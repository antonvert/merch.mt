const MAX_BODY_BYTES = 16_000;
const RATE_LIMIT_SECONDS = 60;

const json = (body, status = 200) =>
  Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff"
    }
  });

const clean = (value, maxLength) =>
  String(value || "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);

const validEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

const htmlEscape = (value) =>
  value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

async function parseBody(request) {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_BODY_BYTES) throw new Error("payload_too_large");

  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return request.json();
  if (contentType.includes("form")) return Object.fromEntries((await request.formData()).entries());
  throw new Error("unsupported_content_type");
}

async function rateLimited(request) {
  try {
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    const bytes = new TextEncoder().encode(ip);
    const hashBuffer = await crypto.subtle.digest("SHA-256", bytes);
    const hash = [...new Uint8Array(hashBuffer)]
      .slice(0, 12)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
    const key = new Request(`https://rate-limit.internal/${hash}`);
    const cache = caches.default;
    if (await cache.match(key)) return true;
    await cache.put(
      key,
      new Response("1", { headers: { "Cache-Control": `max-age=${RATE_LIMIT_SECONDS}` } })
    );
    return false;
  } catch {
    return false;
  }
}

function normalize(raw) {
  return {
    name: clean(raw.name, 80),
    company: clean(raw.company, 100),
    email: clean(raw.email, 160).toLowerCase(),
    event: clean(raw.event, 120),
    eventDate: clean(raw.eventDate, 20),
    need: clean(raw.need, 180),
    quantity: clean(raw.quantity, 40),
    budget: clean(raw.budget, 60),
    message: clean(raw.message, 2000),
    website: clean(raw.website, 200),
    consent: raw.consent === true || raw.consent === "true" || raw.consent === "on",
    startedAt: Number(raw.startedAt || 0)
  };
}

async function sendWebhook(url, secret, payload, request) {
  const headers = { "Content-Type": "application/json", "User-Agent": "merch.mt-lead-form/1.0" };
  if (secret) headers.Authorization = `Bearer ${secret}`;
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      source: "merch.mt",
      submittedAt: new Date().toISOString(),
      country: request.cf?.country || null,
      ...payload
    })
  });
  if (!response.ok) throw new Error(`webhook_${response.status}`);
}

async function sendTelegram(token, chatId, payload) {
  const lines = [
    "<b>New merch.mt brief</b>",
    `Name: ${htmlEscape(payload.name)}`,
    `Company: ${htmlEscape(payload.company || "—")}`,
    `Email: ${htmlEscape(payload.email)}`,
    `Event: ${htmlEscape(payload.event || "—")}`,
    `Event date: ${htmlEscape(payload.eventDate || "—")}`,
    `Need: ${htmlEscape(payload.need)}`,
    `Quantity: ${htmlEscape(payload.quantity || "—")}`,
    `Budget: ${htmlEscape(payload.budget || "—")}`,
    `Message: ${htmlEscape(payload.message || "—")}`
  ];
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, parse_mode: "HTML", text: lines.join("\n") })
  });
  if (!response.ok) throw new Error(`telegram_${response.status}`);
}

async function handleLead(request, env) {
  let raw;
  try {
    raw = await parseBody(request);
  } catch (error) {
    const status = error.message === "payload_too_large" ? 413 : 415;
    return json({ ok: false, code: error.message }, status);
  }

  const payload = normalize(raw);
  if (payload.website) return json({ ok: true });

  const age = Date.now() - payload.startedAt;
  if (!payload.startedAt || age < 1500 || age > 21_600_000) {
    return json({ ok: false, code: "invalid_form_session", message: "Please refresh the page and try again." }, 400);
  }
  if (!payload.name || !payload.need || !validEmail(payload.email) || !payload.consent) {
    return json({ ok: false, code: "validation_error", message: "Please check the required fields." }, 400);
  }
  if (await rateLimited(request)) return json({ ok: false, code: "rate_limited" }, 429);

  const deliveries = [];
  if (env.FORM_WEBHOOK_URL) {
    deliveries.push(sendWebhook(env.FORM_WEBHOOK_URL, env.FORM_WEBHOOK_SECRET, payload, request));
  }
  if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
    deliveries.push(sendTelegram(env.TELEGRAM_BOT_TOKEN, env.TELEGRAM_CHAT_ID, payload));
  }
  if (deliveries.length === 0) {
    return json({ ok: false, code: "destination_not_configured" }, 503);
  }

  const results = await Promise.allSettled(deliveries);
  if (results.every((result) => result.status === "rejected")) {
    return json({ ok: false, code: "delivery_failed", message: "We could not send the brief. Please use Telegram or email." }, 502);
  }

  return json({ ok: true });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/lead") {
      if (request.method !== "POST") return json({ ok: false, code: "method_not_allowed" }, 405);
      return handleLead(request, env);
    }
    return env.ASSETS.fetch(request);
  }
};
