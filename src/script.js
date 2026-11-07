
  // Send a clean page address; campaign labels are separate from contact/form query strings.
  function analyticsContext() {
    const context = {
      page_location: location.origin + location.pathname,
      page_referrer: '',
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    };
    try { const ref = new URL(document.referrer); context.page_referrer = ref.origin + ref.pathname; } catch (_) {}
    const query = new URLSearchParams(location.search);
    for (const [utm, field] of Object.entries({utm_source:'campaign_source', utm_medium:'campaign_medium', utm_campaign:'campaign_name', utm_content:'campaign_content', utm_term:'campaign_term'})) {
      const value = query.get(utm);
      if (value && /^[a-zA-Z0-9_. -]{1,100}$/.test(value) && !/\d{7}/.test(value)) context[field] = value;
    }
    if (query.get('codex_test') === 'seo_20261107') { context.debug_mode = true; context.test_run = 'seo_20261107'; }
    return context;
  }
  function analyticsPage() {
    return {site: location.hostname.replace(/^www\./, ''), language: document.documentElement.lang || 'en', page_path: location.pathname};
  }
(() => {
  const GA_MEASUREMENT_ID = "G-YRCP7PXYYE";
  const isProductionHost = ["merch.mt", "www.merch.mt"].includes(window.location.hostname);
  const CONSENT_KEY = "merch_mt_analytics_consent_v1";

  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag() {
      window.dataLayer.push(arguments);
    };
  let analyticsEnabled = false;
  let analyticsLoaded = false;

  const readConsent = () => {
    try { return window.localStorage.getItem(CONSENT_KEY); } catch { return null; }
  };

  const writeConsent = (value) => {
    try { window.localStorage.setItem(CONSENT_KEY, value); } catch { /* Analytics remains optional. */ }
  };

  const enableAnalytics = () => {
    if (!isProductionHost || analyticsEnabled) return;
    analyticsEnabled = true;
    window["ga-disable-" + GA_MEASUREMENT_ID] = false;
    window.gtag("consent", "update", { analytics_storage: "granted" });
    if (analyticsLoaded) return;
    analyticsLoaded = true;
    window.gtag("consent", "default", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied"
    });
    window.gtag("consent", "update", { analytics_storage: "granted" });
    const analyticsScript = document.createElement("script");
    analyticsScript.async = true;
    analyticsScript.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`;
    document.head.append(analyticsScript);
    window.gtag("js", new Date());
    window.gtag("config", GA_MEASUREMENT_ID, analyticsContext());
  };

  const mountConsent = (settings = false) => {
    if (document.querySelector(".analytics-consent")) return;
    if (!isProductionHost) return;
    const stored = readConsent();
    if (stored === "granted") { enableAnalytics(); if (!settings) return; }
    if (stored === "denied" && !settings) return;
    const banner = document.createElement("aside");
    banner.className = "analytics-consent";
    banner.setAttribute("aria-label", "Analytics preferences");
    banner.innerHTML = '<div><strong>Optional analytics</strong><p>Anonymous usage data helps us improve the site. It is never combined with form details.</p></div><div class="analytics-consent__actions"><button type="button" data-analytics-consent="denied">No thanks</button><button type="button" data-analytics-consent="granted">Allow analytics</button></div>';
    banner.addEventListener("click", (event) => {
      const choice = event.target.closest("[data-analytics-consent]")?.dataset.analyticsConsent;
      if (!choice) return;
      writeConsent(choice);
      if (choice === "granted") enableAnalytics();
      else {
        analyticsEnabled = false;
        window["ga-disable-" + GA_MEASUREMENT_ID] = true;
        window.gtag("consent", "update", { analytics_storage: "denied" });
        for (const part of document.cookie.split(';')) {
          const name = part.split('=')[0].trim();
          if (!/^_ga(?:_|$)/.test(name)) continue;
          for (const domain of ['', location.hostname, '.' + location.hostname]) document.cookie = name + '=; Max-Age=0; path=/' + (domain ? '; domain=' + domain : '');
        }
      }
      banner.remove();
    });
    document.body.append(banner);
  };

  const pushEvent = (event, details = {}) => {
    if (analyticsEnabled) {
      window.gtag("event", event, { ...analyticsPage(), ...details });
    } else if (!isProductionHost) {
      window.dataLayer.push({ event, ...details });
    }
  };

  const normalizedEventName = (name) => ({
    telegram_click: "click_messenger",
    email_click: "click_email",
    phone_click: "click_phone",
    booking_click: "click_booking"
  }[name] || name);

  document.querySelectorAll("[data-event]").forEach((element) => {
    element.addEventListener("click", () => {
      const eventName = normalizedEventName(element.dataset.event);
      pushEvent(eventName, {
        event_label: (element.dataset.eventLabel || element.textContent.trim()).slice(0, 100),
        messenger: eventName === "click_messenger" ? "telegram" : ""
      });
    });
  });

  const observedEvents = new Set();
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const event = entry.target.dataset.observeEvent;
          if (entry.isIntersecting && event && !observedEvents.has(event)) {
            observedEvents.add(event);
            pushEvent(event);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.35 }
    );
    document.querySelectorAll("[data-observe-event]").forEach((element) => observer.observe(element));
  }

  mountConsent();
  if (isProductionHost) {
    const settings = document.createElement('button');
    settings.type = 'button';
    settings.className = 'analytics-settings';
    settings.textContent = document.documentElement.lang === 'ru' ? 'Настройки аналитики' : document.documentElement.lang === 'ka' ? 'ანალიტიკის პარამეტრები' : 'Analytics preferences';
    settings.addEventListener('click', () => mountConsent(true));
    (document.querySelector('footer') || document.body).appendChild(settings);
  }

  const form = document.querySelector("[data-lead-form]");
  const stickyCta = document.querySelector(".mobile-sticky-cta");
  const quoteSection = document.querySelector("#quote");
  if (stickyCta && quoteSection) {
    const updateStickyCta = () => {
      const rect = quoteSection.getBoundingClientRect();
      stickyCta.classList.toggle("is-hidden", rect.top < window.innerHeight && rect.bottom > 0);
    };
    updateStickyCta();
    window.addEventListener("scroll", updateStickyCta, { passive: true });
    window.addEventListener("resize", updateStickyCta);
  }

  if (!form) return;

  const status = form.querySelector("[data-form-status]");
  const submitButton = form.querySelector("[data-submit-button]");
  const startedAt = form.querySelector("[data-started-at]");
  let formStarted = false;
  let submitting = false;

  const resetStartedAt = () => {
    startedAt.value = String(Date.now());
  };
  resetStartedAt();

  form.addEventListener(
    "input",
    () => {
      if (!formStarted) {
        formStarted = true;
        pushEvent("form_start");
      }
    },
    { once: true }
  );

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submitting) return;
    status.textContent = "";
    status.className = "form-status";

    form.querySelectorAll("[aria-invalid]").forEach((field) => field.removeAttribute("aria-invalid"));
    if (!form.checkValidity()) {
      const invalid = form.querySelector(":invalid");
      invalid?.setAttribute("aria-invalid", "true");
      invalid?.focus();
      status.textContent = "Please complete the required fields and confirm the privacy checkbox.";
      status.classList.add("is-error");
      return;
    }

    const payload = Object.fromEntries(new FormData(form).entries());
    payload.consent = Boolean(payload.consent);
    submitting = true;
    submitButton.disabled = true;
    submitButton.textContent = "Sending…";

    try {
      const response = await fetch(form.action, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.ok !== true) {
        if (result.code === "destination_not_configured") {
          throw new Error("The preview form is ready, but lead delivery is not connected yet. Please use Telegram or email for a live quote.");
        }
        if (response.status === 429) {
          throw new Error("That was quick. Please wait a minute before sending another brief.");
        }
        throw new Error(result.message || "We could not send the brief. Please try Telegram or email instead.");
      }

      pushEvent("form_submit", { page_context: "homepage" });
      pushEvent("generate_lead", { lead_source: "contact_form" });
      form.reset();
      resetStartedAt();
      status.textContent = "Thank you—your brief is on its way. We will get back to you shortly.";
      status.classList.add("is-success");
    } catch (error) {
      status.textContent = error.message;
      status.classList.add("is-error");
    } finally {
      submitting = false;
      submitButton.disabled = false;
      submitButton.innerHTML = 'Let’s Make Merch <span aria-hidden="true">↗</span>';
    }
  });
})();
