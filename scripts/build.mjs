import { cp, copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  benefits,
  categories,
  faqs,
  featuredConferences,
  gallery,
  industries,
  otherConferences,
  site,
  steps
} from "../src/content.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(projectRoot, "dist");
const [stylesSource, scriptSource, editorialStylesSource, igamingStylesSource, eventCultureStylesSource, productionStylesSource] = await Promise.all([
  readFile(path.join(projectRoot, "src/styles.css")),
  readFile(path.join(projectRoot, "src/script.js")),
  readFile(path.join(projectRoot, "src/themes/editorial.css")),
  readFile(path.join(projectRoot, "src/themes/igaming.css")),
  readFile(path.join(projectRoot, "src/themes/event-culture.css")),
  readFile(path.join(projectRoot, "src/themes/production.css"))
]);
const assetVersion = createHash("sha256")
  .update(stylesSource)
  .update(scriptSource)
  .update(editorialStylesSource)
  .update(igamingStylesSource)
  .update(eventCultureStylesSource)
  .update(productionStylesSource)
  .digest("hex")
  .slice(0, 10);

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const picture = ({ image, alt, eager = false, className = "" }) => `
  <picture class="${className}">
    <source media="(max-width: 700px)" srcset="/assets/images/${image}-640.webp">
    <img src="/assets/images/${image}.webp" alt="${escapeHtml(alt)}" width="960" height="1280" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">
  </picture>`;

const categoryCards = categories
  .map(
    (item) => `
      <article class="category-card">
        <span class="category-card__number">${item.number}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.description)}</p>
      </article>`
  )
  .join("");

const conferenceCards = featuredConferences
  .map(
    (item) => `
      <article class="conference-card">
        <span class="conference-card__index">${item.index}</span>
        <h3>${escapeHtml(item.name)}</h3>
        <p>${escapeHtml(item.description)}</p>
        <a href="#quote" data-event="conference_cta_click" data-event-label="${escapeHtml(item.name)}">Plan your event merch <span aria-hidden="true">↗</span></a>
      </article>`
  )
  .join("");

const otherConferenceTags = otherConferences
  .map((name) => `<li>${escapeHtml(name)}</li>`)
  .join("");

const industryTags = industries
  .map(
    (name, index) =>
      `<li class="${index === 0 ? "industry-list__lead" : ""}">${escapeHtml(name)}</li>`
  )
  .join("");

const galleryCards = gallery
  .map(
    (item, index) => `
      <figure class="gallery-card ${item.className}" data-gallery-item>
        ${picture({ image: item.image, alt: item.alt, eager: index === 0 }).trim()}
        <figcaption>
          <strong>${escapeHtml(item.client)}</strong>
          <span>${escapeHtml(item.type)}</span>
        </figcaption>
      </figure>`
  )
  .join("");

const productionProofIndexes = [0, 1, 3, 8, 7, 5];
const productionProofCards = productionProofIndexes
  .map((index) => {
    const item = gallery[index];
    return `
      <figure class="production-proof__card" data-gallery-item>
        ${picture({ image: item.image, alt: item.alt }).trim()}
        <figcaption><strong>${escapeHtml(item.client)}</strong><span>${escapeHtml(item.type)}</span></figcaption>
      </figure>`;
  })
  .join("");

const productionProofSection = `
    <section class="production-proof" id="projects" data-observe-event="project_gallery_view">
      <div class="production-proof__heading">
        <div>
          <p class="eyebrow eyebrow--dark"><span></span> Selected work</p>
          <h2>Real merchandise.<br>Real events.</h2>
        </div>
        <p>Products photographed where they matter: at booths, partner meetings and international conferences.</p>
      </div>
      <div class="production-proof__grid">${productionProofCards}</div>
    </section>`;

const productionMerchProcess = `
      <div class="merch-process-line" aria-label="Merchandise production process">
        <span>Sourcing</span><b>→</b><span>Branding</span><b>→</b><span>Production</span><b>→</b><span>Quality control</span><b>→</b><span>Delivery</span>
      </div>`;

const productionOpsProcess = `
    <ol class="production-process-line" aria-label="From brief to Malta">
      <li>Brief</li>
      <li>Approval</li>
      <li>Production</li>
      <li>Delivery</li>
    </ol>`;

const benefitCards = benefits
  .map(
    ([title, description], index) => `
      <article class="benefit-card">
        <span>${String(index + 1).padStart(2, "0")}</span>
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(description)}</p>
      </article>`
  )
  .join("");

const productionBenefitCards = [1, 2, 3, 5]
  .map((benefitIndex, displayIndex) => {
    const [title, description] = benefits[benefitIndex];
    return `
      <article class="benefit-card">
        <span>${String(displayIndex + 1).padStart(2, "0")}</span>
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(description)}</p>
      </article>`;
  })
  .join("");

const stepCards = steps
  .map(
    ([number, title, description]) => `
      <li class="step-card">
        <span>${number}</span>
        <div>
          <h3>${escapeHtml(title)}</h3>
          <p>${escapeHtml(description)}</p>
        </div>
      </li>`
  )
  .join("");

const faqItems = faqs
  .map(
    (item) => `
      <details class="faq-item">
        <summary>${escapeHtml(item.question)}<span aria-hidden="true"></span></summary>
        <p>${escapeHtml(item.answer)}</p>
      </details>`
  )
  .join("");

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${site.url}/#organization`,
      name: "merch.mt",
      url: site.url,
      email: site.email,
      parentOrganization: {
        "@type": "Organization",
        name: "SWAGGY.agency",
        url: site.poweredByUrl
      }
    },
    {
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      url: site.url,
      name: site.name,
      publisher: { "@id": `${site.url}/#organization` },
      inLanguage: "en"
    },
    {
      "@type": "WebPage",
      "@id": `${site.url}/#webpage`,
      url: site.url,
      name: site.title,
      description: site.description,
      isPartOf: { "@id": `${site.url}/#website` },
      about: { "@id": `${site.url}/#service` },
      inLanguage: "en"
    },
    {
      "@type": "Service",
      "@id": `${site.url}/#service`,
      name: "Event and conference merchandise for Malta",
      description:
        "Branded event merchandise, conference giveaways, iGaming merchandise and promotional products produced in the EU and delivered to venues, booths and hotels in Malta.",
      provider: { "@id": `${site.url}/#organization` },
      areaServed: { "@type": "Country", name: "Malta" },
      serviceType: [
        "Event merchandise",
        "Conference merchandise",
        "Branded merchandise",
        "Promotional products",
        "iGaming conference merchandise"
      ],
      audience: {
        "@type": "BusinessAudience",
        audienceType: "Exhibitors, sponsors and international event teams"
      }
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer }
      }))
    }
  ]
};

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(site.title)}</title>
  <meta name="description" content="${escapeHtml(site.description)}">
  <meta name="theme-color" content="#2538cf">
  <link rel="canonical" href="${site.url}/">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="merch.mt">
  <meta property="og:title" content="${escapeHtml(site.title)}">
  <meta property="og:description" content="${escapeHtml(site.description)}">
  <meta property="og:url" content="${site.url}/">
  <meta property="og:image" content="${site.url}/assets/images/og-swaggy-merchandise-malta-social-v2.jpg">
  <meta property="og:image:width" content="600">
  <meta property="og:image:height" content="315">
  <meta property="og:image:alt" content="SWAGGY branded merchandise prepared for an international event team">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(site.title)}">
  <meta name="twitter:description" content="${escapeHtml(site.description)}">
  <meta name="twitter:image" content="${site.url}/assets/images/og-swaggy-merchandise-malta-social-v2.jpg">
  <link rel="preload" as="image" href="/assets/images/starcrown-event-gifts.webp" imagesrcset="/assets/images/starcrown-event-gifts-640.webp 640w, /assets/images/starcrown-event-gifts.webp 960w" imagesizes="(max-width: 860px) 100vw, 42vw">
  <link rel="stylesheet" href="/assets/styles.css?v=${assetVersion}">
  <script type="application/ld+json">${JSON.stringify(structuredData)}</script>
</head>
<body class="theme-base" data-theme="base">
  <a class="skip-link" href="#main">Skip to content</a>
  <main id="main">
    <section class="hero" id="top">
      <header class="site-header" data-header>
        <a class="brand" href="#top" aria-label="merch.mt home">
          <span class="brand__wordmark">merch.mt</span>
          <span class="brand__endorsement">Powered by SWAGGY</span>
        </a>
        <nav class="desktop-nav" aria-label="Main navigation">
          <a href="#merchandise">Merchandise</a>
          <a href="#conferences">Conferences</a>
          <a href="#projects">Projects</a>
          <a href="#process">How it works</a>
        </nav>
        <a class="button button--small header-cta" href="#quote" data-event="header_cta_click">Let's Make Merch</a>
      </header>
      <div class="hero__content">
        <p class="eyebrow"><span></span> Event merchandise for conferences in Malta</p>
        <h1>Your Merch Partner in Malta</h1>
        <p class="hero__lede">Need branded merchandise for an event in Malta? We’ll handle it—from product selection and EU production to delivery straight to your booth or hotel room.</p>
        <div class="hero__actions">
          <a class="button button--light" href="#quote" data-event="hero_cta_click">Let's Make Merch <span aria-hidden="true">↗</span></a>
          <a class="text-link" href="${site.telegramUrl}" target="_blank" rel="noopener" data-event="telegram_click" data-event-label="hero">Send your brief on Telegram</a>
        </div>
        <ul class="proof-list" aria-label="Service highlights">
          <li>EU production</li>
          <li>Booth & hotel delivery</li>
          <li>Personal manager</li>
        </ul>
      </div>
      <div class="hero__visual">
        <div class="hero__photo">
          ${picture({ image: "starcrown-event-gifts", alt: "StarCrown conference gifts displayed at an international event", eager: true })}
          <div class="hero__caption">
            <span>Real project</span>
            <strong>Conference gifts for an iGaming team</strong>
          </div>
        </div>
        <div class="hero__stamp" aria-hidden="true">EU → MT</div>
      </div>
    </section>

    <section class="marquee" aria-label="Service summary">
      <div>
        <span>Sourcing</span><b>→</b><span>Branding</span><b>→</b><span>Production</span><b>→</b><span>Quality control</span><b>→</b><span>Delivery</span>
      </div>
    </section>

    <section class="section intro-section">
      <div class="section-heading section-heading--split">
        <div>
          <p class="eyebrow eyebrow--dark"><span></span> Coming to Malta for an event?</p>
          <h2>Need merch for an event?<br>We’ll handle it.</h2>
        </div>
        <div class="intro-section__copy">
          <p>Tell us the event, dates, product idea, quantity, branding and approximate budget. We take it from there—from the first shortlist to delivery in Malta.</p>
          <a class="text-link text-link--dark" href="#process">See how it works</a>
        </div>
      </div>
    </section>

    <section class="section section--tint" id="merchandise">
      <div class="section-heading">
        <p class="eyebrow eyebrow--dark"><span></span> What we produce</p>
        <h2>Merchandise built around the event—not a catalogue.</h2>
        <p>Tell us what needs to happen at your booth, meeting or side event. We will shape the product mix around that job.</p>
      </div>
      <div class="category-grid">${categoryCards}</div>
    </section>

    <section class="section conferences-section" id="conferences" data-observe-event="conference_section_view">
      <div class="section-heading section-heading--split">
        <div>
          <p class="eyebrow eyebrow--dark"><span></span> Malta conference merchandise</p>
          <h2>Ready for Malta's biggest conferences.</h2>
        </div>
        <p>iGaming conference merchandise for international teams, sponsors and B2B exhibitors arriving with a full schedule—and no desire to travel with boxes.</p>
      </div>
      <div class="conference-grid">${conferenceCards}</div>
      <div class="other-events">
        <p>Also supporting teams attending</p>
        <ul>${otherConferenceTags}</ul>
      </div>
      <p class="disclaimer">Conference names are used to describe the events our clients attend. merch.mt and SWAGGY are not presented as official suppliers or partners of these events.</p>
    </section>

    <section class="industries-section">
      <div class="industries-section__copy">
        <p class="eyebrow"><span></span> Made for international event teams</p>
        <h2>Built with iGaming pace. Ready for every B2B crowd.</h2>
        <p>We produce iGaming conference merchandise that works as a booth giveaway, a partner dinner gift or a team kit that looks right in every photo.</p>
      </div>
      <ul class="industry-list">${industryTags}</ul>
    </section>

    <section class="section projects-section" id="projects" data-observe-event="project_gallery_view">
      <div class="section-heading section-heading--split">
        <div>
          <p class="eyebrow eyebrow--dark"><span></span> Selected work</p>
          <h2>Real merchandise.<br>Real events.</h2>
        </div>
        <p>Products photographed where they matter: at booths, partner meetings and international conferences.</p>
      </div>
      <div class="gallery-grid">${galleryCards}</div>
    </section>

    <section class="section section--ink benefits-section">
      <div class="section-heading">
        <p class="eyebrow"><span></span> Why order before you fly?</p>
        <h2>Arrive in Malta with one less thing to worry about.</h2>
      </div>
      <div class="benefit-grid">${benefitCards}</div>
    </section>

    <section class="section timeline-section" id="timeline">
      <div class="timeline-section__intro">
        <p class="eyebrow eyebrow--dark"><span></span> Lead time</p>
        <h2>Order early.<br>Arrive stress-free.</h2>
        <p>Three weeks or more is the ideal, stress-free window. Two weeks is tight but still possible for selected products. Under two weeks is assessed case by case.</p>
        <a class="button button--blue" href="#quote" data-event="timeline_cta_click">Check My Timing</a>
      </div>
      <div class="timeline" aria-label="Typical event merchandise lead times">
        <div class="timeline__item timeline__item--ideal">
          <span>Ideal timing</span>
          <strong>3+ weeks</strong>
          <p>Comfortable timing for product choice, branding, production and delivery.</p>
        </div>
        <div class="timeline__item timeline__item--rush">
          <span>Tight but possible</span>
          <strong>2 weeks</strong>
          <p>Possible for selected products when decisions and approvals move quickly.</p>
        </div>
        <div class="timeline__item">
          <span>Ask us</span>
          <strong>Under 2 weeks</strong>
          <p>Case by case. Send the brief and we will check what is realistically possible.</p>
        </div>
      </div>
    </section>

    <section class="section process-section" id="process">
      <div class="section-heading">
        <p class="eyebrow eyebrow--dark"><span></span> How it works</p>
        <h2>From brief to Malta in five clear steps.</h2>
      </div>
      <ol class="steps-list">${stepCards}</ol>
    </section>

    <section class="section faq-section">
      <div class="faq-section__heading">
        <p class="eyebrow eyebrow--dark"><span></span> FAQ</p>
        <h2>Useful answers before you brief us.</h2>
        <p>Still deciding? Send the event name and date. We can start with that.</p>
      </div>
      <div class="faq-list">${faqItems}</div>
    </section>

    <section class="quote-section" id="quote">
      <div class="quote-section__copy">
        <p class="eyebrow"><span></span> Start with what you know</p>
        <h2>Let’s make your Malta merch happen.</h2>
        <p>Tell us the event and the essentials. We’ll suggest the right options, handle EU production and deliver everything to your booth, venue or hotel in Malta.</p>
        <div class="direct-contact">
          <span>Prefer a direct message?</span>
          <a href="${site.telegramUrl}" target="_blank" rel="noopener" data-event="telegram_click" data-event-label="form">Telegram · ${site.telegramLabel}</a>
          <a href="mailto:${site.email}" data-event="email_click">${site.email}</a>
        </div>
      </div>
      <form class="lead-form" action="/api/lead" method="post" data-lead-form novalidate>
        <div class="lead-form__intro">
          <strong>30 seconds is enough.</strong>
          <span>Share the basics — we’ll ask for the rest only if we need it.</span>
        </div>
        <div class="form-grid">
          <label>Name <span>*</span><input name="name" type="text" autocomplete="name" required maxlength="80" placeholder="Your name"></label>
          <label>Work email <span>*</span><input name="email" type="email" autocomplete="email" required maxlength="160" placeholder="you@company.com"></label>
          <label>Company <small>optional</small><input name="company" type="text" autocomplete="organization" maxlength="100" placeholder="Company name"></label>
          <label>Event + date <small>optional</small><input name="event" type="text" maxlength="120" placeholder="e.g. SiGMA Europe · November"></label>
          <label class="form-grid__wide">Tell us what you need <span>*</span><textarea name="need" rows="5" required maxlength="2000" placeholder="Giveaways, team apparel, VIP gifts, quantity, budget, delivery point — whatever you already know."></textarea></label>
        </div>
        <label class="honeypot" aria-hidden="true">Website<input name="website" type="text" tabindex="-1" autocomplete="off"></label>
        <input type="hidden" name="startedAt" value="" data-started-at>
        <label class="consent"><input type="checkbox" name="consent" required> <span>I agree to the <a href="${site.privacyUrl}" target="_blank" rel="noopener">processing of my personal data</a> for this enquiry.</span></label>
        <button class="button button--ink button--submit" type="submit" data-submit-button>Let’s Make Merch <span aria-hidden="true">↗</span></button>
        <p class="form-status" role="status" aria-live="polite" data-form-status></p>
      </form>
    </section>
  </main>

  <footer class="site-footer">
    <div>
      <a class="brand brand--footer" href="#top"><span class="brand__wordmark">merch.mt</span><span class="brand__endorsement">A project by SWAGGY.agency</span></a>
      <p>Event and conference merchandise produced in the EU and delivered to Malta.</p>
    </div>
    <div class="footer-links">
      <a href="${site.poweredByUrl}" target="_blank" rel="noopener">SWAGGY.agency</a>
      <a href="mailto:${site.email}">${site.email}</a>
      <a href="${site.telegramUrl}" target="_blank" rel="noopener">Telegram</a>
      <a href="${site.privacyUrl}" target="_blank" rel="noopener">Privacy</a>
    </div>
    <p class="footer-note">© ${new Date().getFullYear()} merch.mt. Conference names belong to their respective owners.</p>
  </footer>

  <a class="mobile-sticky-cta" href="#quote" data-event="mobile_sticky_cta_click">Let's Make Merch</a>
  <script src="/assets/script.js?v=${assetVersion}" defer></script>
</body>
</html>`;

const renderVariant = ({ theme, themeColor }) =>
  html
    .replace(
      '<meta name="theme-color" content="#2538cf">',
      `<meta name="theme-color" content="${themeColor}">\n  <meta name="robots" content="noindex,nofollow">`
    )
    .replace(
      `<link rel="stylesheet" href="/assets/styles.css?v=${assetVersion}">`,
      `<link rel="stylesheet" href="/assets/styles.css?v=${assetVersion}">\n  <link rel="stylesheet" href="/assets/themes/${theme}.css?v=${assetVersion}">`
    )
    .replace(
      '<body class="theme-base" data-theme="base">',
      `<body class="theme-${theme}" data-theme="${theme}">`
    );

const editorialHtml = renderVariant({ theme: "editorial", themeColor: "#f5f3ee" });
const igamingHtml = renderVariant({ theme: "igaming", themeColor: "#07090e" });
const eventCultureHtml = renderVariant({ theme: "event-culture", themeColor: "#090b10" });
const productionHtml = renderVariant({ theme: "production", themeColor: "#f5f4f0" })
  .replace("Send your brief on Telegram", "Send Your Brief")
  .replace(
    '    </section>\n\n    <section class="marquee" aria-label="Service summary">',
    `    </section>\n${productionProofSection}\n\n    <section class="marquee" aria-label="Service summary">`
  )
  .replace(
    /\n    <section class="marquee" aria-label="Service summary">[\s\S]*?<\/section>/,
    ""
  )
  .replace(
    /\n    <section class="section intro-section">[\s\S]*?<\/section>\n\n    <section class="section section--tint" id="merchandise">/,
    '\n\n    <section class="section section--tint" id="merchandise">'
  )
  .replace(
    '        <p>Tell us what needs to happen at your booth, meeting or side event. We will shape the product mix around that job.</p>\n      </div>\n      <div class="category-grid">',
    `        <p>Tell us what needs to happen at your booth, meeting or side event. We will shape the product mix around that job.</p>\n      </div>\n${productionMerchProcess}\n      <div class="category-grid">`
  )
  .replace("Ready for Malta's biggest conferences.", "Built for Malta's event circuit.")
  .replace(
    "iGaming conference merchandise for international teams, sponsors and B2B exhibitors arriving with a full schedule—and no desire to travel with boxes.",
    "iGaming conference merchandise for international teams, sponsors and B2B exhibitors—without travelling with boxes."
  )
  .replace(
    '<section class="section conferences-section" id="conferences" data-observe-event="conference_section_view">',
    '<div class="production-event-scene">\n    <section class="section conferences-section" id="conferences" data-observe-event="conference_section_view">'
  )
  .replace(
    /\n      <div class="industries-section__copy">[\s\S]*?<\/div>/,
    ""
  )
  .replace(
    '</ul>\n    </section>\n\n    <section class="section projects-section"',
    '</ul>\n    </section>\n    </div>\n\n    <section class="section projects-section"'
  )
  .replace(
    /\n    <section class="section projects-section"[\s\S]*?<\/section>\n\n    <section class="section section--ink benefits-section">/,
    '\n\n    <section class="section section--ink benefits-section">'
  )
  .replace(
    '<section class="section section--ink benefits-section">',
    '<div class="production-ops-scene" id="process">\n    <section class="section section--ink benefits-section">'
  )
  .replace("Arrive in Malta with one less thing to worry about.", "From brief to Malta.")
  .replace(
    /<div class="benefit-grid">[\s\S]*?<\/div>\n    <\/section>/,
    `<div class="benefit-grid">${productionBenefitCards}</div>\n    </section>`
  )
  .replace(
    '        <h2>Order early.<br>Arrive stress-free.</h2>\n        <p>Three weeks or more is the ideal, stress-free window. Two weeks is tight but still possible for selected products. Under two weeks is assessed case by case.</p>\n',
    ""
  )
  .replace(
    /\n    <section class="section process-section"[\s\S]*?<\/section>\n\n    <section class="section faq-section">/,
    `\n${productionOpsProcess}\n    </div>\n\n    <section class="section faq-section">`
  );

const productionRootHtml = productionHtml
  .replace(
    '  <meta name="robots" content="noindex,nofollow">\n',
    ""
  )
  .replace(
    '  <script type="application/ld+json">',
    '  <script async src="https://www.googletagmanager.com/gtag/js?id=G-YRCP7PXYYE"></script>\n  <script type="application/ld+json">'
  );

const notFoundHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <title>Page not found | merch.mt</title>
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="stylesheet" href="/assets/styles.css?v=${assetVersion}">
</head>
<body class="error-page">
  <main>
    <a class="brand" href="/"><span class="brand__wordmark">merch.mt</span><span class="brand__endorsement">Powered by SWAGGY</span></a>
    <p class="error-page__code">404</p>
    <h1>This page missed the event.</h1>
    <p>The merchandise route still starts on the homepage.</p>
    <a class="button button--light" href="/">Back to merch.mt</a>
  </main>
</body>
</html>`;

const robots = `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`;
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${site.url}/</loc>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
const headers = `/*
  Content-Security-Policy: default-src 'self'; img-src 'self' data: https://www.google-analytics.com https://*.google-analytics.com; style-src 'self'; script-src 'self' https://www.googletagmanager.com; connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://analytics.google.com https://*.analytics.google.com; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY

/editorial/*
  X-Robots-Tag: noindex, nofollow

/igaming/*
  X-Robots-Tag: noindex, nofollow

/event-culture/*
  X-Robots-Tag: noindex, nofollow

/production/*
  X-Robots-Tag: noindex, nofollow

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/*.html
  Cache-Control: public, max-age=0, must-revalidate
`;

await rm(distDir, { recursive: true, force: true });
await mkdir(path.join(distDir, "assets"), { recursive: true });
await mkdir(path.join(distDir, "assets/themes"), { recursive: true });
await mkdir(path.join(distDir, "editorial"), { recursive: true });
await mkdir(path.join(distDir, "igaming"), { recursive: true });
await mkdir(path.join(distDir, "event-culture"), { recursive: true });
await mkdir(path.join(distDir, "production"), { recursive: true });
await cp(path.join(projectRoot, "src/assets/images"), path.join(distDir, "assets/images"), { recursive: true });
await copyFile(path.join(projectRoot, "src/styles.css"), path.join(distDir, "assets/styles.css"));
await copyFile(path.join(projectRoot, "src/script.js"), path.join(distDir, "assets/script.js"));
await copyFile(path.join(projectRoot, "src/themes/editorial.css"), path.join(distDir, "assets/themes/editorial.css"));
await copyFile(path.join(projectRoot, "src/themes/igaming.css"), path.join(distDir, "assets/themes/igaming.css"));
await copyFile(path.join(projectRoot, "src/themes/event-culture.css"), path.join(distDir, "assets/themes/event-culture.css"));
await copyFile(path.join(projectRoot, "src/themes/production.css"), path.join(distDir, "assets/themes/production.css"));
await copyFile(path.join(projectRoot, "src/favicon.svg"), path.join(distDir, "favicon.svg"));
await copyFile(path.join(projectRoot, "src/apple-touch-icon.png"), path.join(distDir, "apple-touch-icon.png"));
await Promise.all([
  writeFile(path.join(distDir, "index.html"), productionRootHtml),
  writeFile(path.join(distDir, "editorial/index.html"), editorialHtml),
  writeFile(path.join(distDir, "igaming/index.html"), igamingHtml),
  writeFile(path.join(distDir, "event-culture/index.html"), eventCultureHtml),
  writeFile(path.join(distDir, "production/index.html"), productionHtml),
  writeFile(path.join(distDir, "404.html"), notFoundHtml),
  writeFile(path.join(distDir, "robots.txt"), robots),
  writeFile(path.join(distDir, "sitemap.xml"), sitemap),
  writeFile(path.join(distDir, "_headers"), headers)
]);

console.log(`Built merch.mt → ${path.relative(projectRoot, distDir)}`);
