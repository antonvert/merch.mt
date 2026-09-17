(() => {
  const pushEvent = (event, details = {}) => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...details });
  };

  document.querySelectorAll("[data-event]").forEach((element) => {
    element.addEventListener("click", () => {
      pushEvent(element.dataset.event, {
        event_label: element.dataset.eventLabel || element.textContent.trim()
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
      form.reset();
      resetStartedAt();
      status.textContent = "Thank you—your brief is on its way. We will get back to you shortly.";
      status.classList.add("is-success");
    } catch (error) {
      status.textContent = error.message;
      status.classList.add("is-error");
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = 'Send My Brief <span aria-hidden="true">↗</span>';
    }
  });
})();
