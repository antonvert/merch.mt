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

  const readConsent = () => {
    try { return window.localStorage.getItem(CONSENT_KEY); } catch { return null; }
  };

  const writeConsent = (value) => {
    try { window.localStorage.setItem(CONSENT_KEY, value); } catch { /* Analytics remains optional. */ }
  };

  const enableAnalytics = () => {
    if (!isProductionHost || analyticsEnabled) return;
    analyticsEnabled = true;
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
    window.gtag("config", GA_MEASUREMENT_ID);
  };

  const mountConsent = () => {
    if (!isProductionHost) return;
    const stored = readConsent();
    if (stored === "granted") { enableAnalytics(); return; }
    if (stored === "denied") return;
    const banner = document.createElement("aside");
    banner.className = "analytics-consent";
    banner.setAttribute("aria-label", "Analytics preferences");
    banner.innerHTML = '<div><strong>Optional analytics</strong><p>Anonymous usage data helps us improve the site. It is never combined with form details.</p></div><div class="analytics-consent__actions"><button type="button" data-analytics-consent="denied">No thanks</button><button type="button" data-analytics-consent="granted">Allow analytics</button></div>';
    banner.addEventListener("click", (event) => {
      const choice = event.target.closest("[data-analytics-consent]")?.dataset.analyticsConsent;
      if (!choice) return;
      writeConsent(choice);
      if (choice === "granted") enableAnalytics();
      banner.remove();
    });
    document.body.append(banner);
  };

  const pushEvent = (event, details = {}) => {
    if (analyticsEnabled) {
      window.gtag("event", event, details);
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
    submitButton.disabled = true;
    submitButton.textContent = "Sending…";

    try {
      const response = await fetch(form.action, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (result.code === "destination_not_configured") {
          throw new Error("The preview form is ready, but lead delivery is not connected yet. Please use Telegram or email for a live quote.");
        }
        if (response.status === 429) {
          throw new Error("That was quick. Please wait a minute before sending another brief.");
        }
        throw new Error(result.message || "We could not send the brief. Please try Telegram or email instead.");
      }

      pushEvent("form_submit", { event_name: payload.event || "not provided" });
      pushEvent("generate_lead", { lead_source: "contact_form" });
      form.reset();
      resetStartedAt();
      status.textContent = "Thank you—your brief is on its way. We will get back to you shortly.";
      status.classList.add("is-success");
    } catch (error) {
      status.textContent = error.message;
      status.classList.add("is-error");
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = 'Let’s Make Merch <span aria-hidden="true">↗</span>';
    }
  });
})();
