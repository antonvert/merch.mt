# merch.mt SEO & GEO Implementation Report

**Report basis:** actual generated production candidate and source code, not the original specification  
**Code version reviewed:** launch-readiness production source after the 20 September visual-polish pass

**Review date:** 20 September 2026  
**Current preview:** `https://merch-mt-preview.kg-758.workers.dev/`  
**Intended production URL:** `https://merch.mt/`

## Executive summary

The current production candidate already communicates the core commercial proposition clearly: merch.mt helps international event teams select and produce branded merchandise in the EU and deliver it to booths, venues and hotels in Malta.

The page has useful coverage for four commercial search areas:

1. event and conference merchandise in Malta;
2. iGaming merchandise;
3. named Malta conferences such as SiGMA, SBC and NEXT;
4. practical questions about ordering, timing and delivery.

The strongest current SEO/GEO assets are the explicit service wording, named conference coverage, six useful FAQs, a single focused gallery of real project photography and structured `Service` and `FAQPage` data.

The approved production layout now builds directly to the root homepage. Preview indexing is intentionally blocked at the Cloudflare Worker level on `*.workers.dev`, while the same root document remains indexable when served from `https://merch.mt/`.

Two launch integrations still require account configuration rather than code changes:

- The analytics code prepares events in `window.dataLayer`, but no GA4 or Google Tag Manager script is loaded. No traffic or conversion data is currently being sent to GA4.
- The form backend exists, but no live delivery destination is configured in the preview. Therefore a successful `form_submit` conversion cannot currently occur.

These are the remaining operational launch tasks once the custom domain is connected.

## 1. Intent-to-implementation map

The table below connects each target search intent to the content and technical implementation that actually exist today.

| Target intent | Example queries | Page section | H1/H2/text supporting the intent | Metadata / technical implementation | Structured data | Expected measurement source after launch |
| --- | --- | --- | --- | --- | --- | --- |
| **Primary commercial intent** | `event merchandise Malta`, `conference merchandise Malta`, `merchandise Malta`, `branded merchandise Malta`, `promotional products Malta` | Metadata, Hero, What we produce, final CTA, footer | Hero eyebrow: **“Event merchandise for conferences in Malta”**; H1: **“Your Merch Partner in Malta”**; Hero text: **“Need branded merchandise for an event in Malta?”**; category text includes **“Conference giveaways and promotional products”**; final CTA offers **“conference giveaways, branded merchandise or promotional products for your Malta event”** | Exact title and description target Malta commercial terms. Canonical is `https://merch.mt/`. Automated build checks protect title length, description length and required semantic topics. | `WebPage` describes branded event merchandise and promotional products. `Service` lists Event merchandise, Conference merchandise, Branded merchandise and Promotional products, with Malta as `areaServed`. | Google Search Console queries, impressions, clicks, CTR and average position; GA4 organic landing sessions; `hero_cta_click`, `header_cta_click`, `form_start`, `form_submit`, `telegram_click`, `email_click`; lead destination/CRM after it is connected. |
| **Event-specific commercial intent** | `merch for event Malta`, `conference giveaways Malta`, `event giveaways Malta`, `merch supplier Malta` | Hero, Event Giveaways category, FAQ, CTA | **“Need branded merchandise for an event in Malta?”**; H3: **“Event Giveaways”**; FAQ: **“Are you a merchandise supplier in Malta?”**; FAQ: **“What kind of event merchandise can you produce?”**; CTA H2: **“Need merch for an event in Malta?”** | Terms are placed in visible service copy rather than a `meta keywords` tag. The page is English (`lang="en"`) and uses one canonical destination. | `Service.audience` identifies exhibitors, sponsors and international event teams. `FAQPage` contains the supplier, product and ordering questions. | Search Console filters for `event`, `giveaway`, `supplier`, `merch` plus `Malta`; GA4 organic sessions and lead events; form field “Which event are you attending?” once form delivery is live. |
| **Secondary / iGaming intent** | `iGaming merchandise Malta`, `iGaming merch Malta`, `iGaming conference merchandise` | Hero project caption, Malta event circuit dark section, industry list | Hero proof caption: **“Conference gifts for an iGaming team”**; event-circuit text: **“iGaming conference merchandise for international teams, sponsors and B2B exhibitors…”**; industry list leads with **“PRIMARY / iGaming”** | The phrase “iGaming conference merchandise” is protected by the automated SEO content check. The visual section groups iGaming with Malta’s wider B2B event circuit. | `Service.description` includes iGaming merchandise. `Service.serviceType` includes **“iGaming conference merchandise”**. | Search Console query regex containing `igaming`; GA4 organic landing sessions; `conference_section_view`, `project_gallery_view`; qualified lead/event-name data after form delivery is connected. |
| **Conference long-tail intent** | `SiGMA Malta merchandise`, `merchandise for SiGMA Malta`, `SBC Malta merchandise`, `NEXT Valletta merchandise` | Malta event circuit cards and FAQ | H2: **“Built for Malta's event circuit.”**; H3s: **“SiGMA Europe Malta”**, **“SBC Summit Malta”**, **“NEXT Summit Valletta”**; descriptions use the exact phrases **“SiGMA Malta merchandise”**, **“SBC Malta merchandise”** and **“NEXT Valletta merchandise”**; one FAQ explicitly covers all three events | Named events are present in visible text. A disclaimer states that merch.mt and SWAGGY are not presented as official suppliers or partners. The current single-page architecture does not yet provide separate event URLs. | `FAQPage` includes one combined SiGMA/SBC/NEXT question. The general `Service` schema remains the provider entity; no false event-partner schema is used. | Search Console query filters by `sigma`, `sbc`, `next`, `valletta`; GA4 organic sessions and `conference_section_view`; conference name in the lead form. `conference_cta_click` remains in shared HTML but its links are visually hidden in the current production theme. |
| **Problem-based / query intent** | `merchandise delivery to conference Malta`, `order merch for Malta event`, `merchandise delivered to Malta venue`, urgent merch queries | Hero, From brief to Malta, timeline, process, FAQ, final CTA | Hero promises delivery to **“your booth or hotel room”**; H2: **“From brief to Malta.”**; visible benefits state **“EU production”**, **“Delivery where you need it”**, **“One point of contact”** and **“Less event-week stress”**; timeline states 4+ weeks, 3 weeks and 2 weeks or less; FAQ: **“Can you deliver merchandise to a conference venue or hotel in Malta?”** and **“How do I order merch for a Malta event?”** | Delivery wording is repeated across visible copy, FAQ, footer and metadata without claiming local Maltese production. The form collects event, date, quantity, need, budget and message. | `Service.areaServed` is Malta. `FAQPage` states delivery destinations, EU production, urgency conditions and the ordering process. | Search Console filters for `deliver`, `delivery`, `venue`, `hotel`, `order`, `urgent`, `how`; GA4 `timeline_cta_click`, `form_start`, `form_submit`, Telegram/email clicks; lead fields for event date, quantity and need. |

## 2. Keyword and intention clusters

### Primary keyword/intention cluster

The primary cluster is the broad commercial market: companies looking for event merchandise, conference merchandise, branded merchandise or promotional products in Malta.

**Current strengths**

- Malta and the service category appear together in the title, description and Hero eyebrow.
- The H1 remains brand-led and readable rather than becoming a keyword list.
- The product section covers six compact categories: giveaways, team merch, apparel/textile, client gifts, combined VIP/welcome kits and custom event merchandise.
- The final CTA repeats the commercial offer at the decision point.

**Current limitation**

All commercial topics currently resolve to one page. This is appropriate before search demand is known, but it limits relevance if individual product clusters begin generating material impressions.

### Secondary / iGaming cluster

The iGaming cluster is deliberately secondary rather than the whole brand position. The combined Malta event-circuit scene labels iGaming as the primary vertical while still naming FinTech, Crypto, Gaming, Tech, Finance, SaaS, Startups and MedTech.

**Current strengths**

- “iGaming conference merchandise” appears in visible copy.
- A real-project caption references an iGaming team.
- `Service` structured data explicitly includes iGaming conference merchandise.
- The audience remains broad enough for non-iGaming buyers.

**Current limitation**

There is no dedicated iGaming landing page, no iGaming-specific case study with measurable detail and no iGaming-specific product or lead-time examples.

### Conference long-tail cluster

The page currently targets three named events directly:

- SiGMA Europe Malta;
- SBC Summit Malta;
- NEXT Summit Valletta.

It also names EU-Startups Summit, MedTech World, FinanceMalta Annual Conference, PLAYCON Malta, Malta Aviation Conference & Expo and Malta Maritime Summit as events attended by potential client teams.

**Current strengths**

- Exact long-tail phrases are visible in card copy and FAQs.
- Each primary event has its own H3.
- The disclaimer avoids implying official supplier or partner status.

**Current limitation**

Named-event intent is consolidated on the homepage. Dedicated pages do not yet exist for event dates, venue delivery details, deadlines, recommended products or event-specific proof.

### Problem-based / query cluster

The page is strongest when a buyer already knows the operational problem: they need merchandise for a Malta event without travelling with boxes.

**Current strengths**

- The page explicitly answers where delivery can go: booth, venue, hotel or another agreed Malta location.
- It distinguishes EU production from Malta delivery.
- It explains realistic timing: 4+ weeks is best, 3 weeks is fast-track and 2 weeks or less is case by case.
- The FAQ answers ordering, urgency, product selection and delivery questions.

**Current limitation**

The page does not yet explain minimum order quantities, typical budget ranges, product-specific production times, customs/VAT handling, delivery coverage outside the main Malta event venues or what happens if venue access changes.

## 3. Exact current on-page and technical implementation

### Page identity

| Element | Exact current value |
| --- | --- |
| HTML language | `en` |
| Title | <code>Event &amp; Conference Merchandise Malta &#124; merch.mt</code> |
| Title length | 47 characters when rendered |
| Meta description | `Branded event merchandise, conference giveaways and promotional products produced in the EU and delivered to booths, hotels and venues across Malta.` |
| Meta description length | 148 characters |
| Canonical | `https://merch.mt/` |
| Open Graph type | `website` |
| Open Graph site name | `merch.mt` |
| Open Graph title | <code>Event &amp; Conference Merchandise Malta &#124; merch.mt</code> |
| Open Graph URL | `https://merch.mt/` |
| Open Graph image | `https://merch.mt/assets/images/og-event-merchandise-malta.jpg` |
| Open Graph image ALT | `Branded conference merchandise produced for an international event team` |
| Twitter card | `summary_large_image` |

### Robots and canonical state

The generated root page is now the approved production layout.

**On `https://merch.mt/`**

- No `noindex` meta directive
- Canonical: `https://merch.mt/`
- Included in sitemap
- Production theme and production page structure are rendered at the root URL

**On `*.workers.dev` preview hosts**

- The Worker returns `X-Robots-Tag: noindex, nofollow` on HTML responses
- The Worker serves a preview-only `robots.txt` with `Disallow: /`
- Canonical remains `https://merch.mt/`
- Review routes remain excluded from the sitemap

The `/production/` route is retained only as a noindex review mirror. This prevents accidental indexing of preview deployments without weakening the indexability of the final custom-domain homepage.

**robots.txt**

```text
User-agent: *
Allow: /

Sitemap: https://merch.mt/sitemap.xml
```

**Sitemap status**

The sitemap contains one URL only:

```xml
<url>
  <loc>https://merch.mt/</loc>
  <changefreq>monthly</changefreq>
  <priority>1.0</priority>
</url>
```

The preview variants `/editorial/`, `/igaming/`, `/event-culture/` and `/production/` are intentionally excluded.

### Exact H1/H2 structure

The production HTML has one H1 and six H2 elements. Every H1/H2 is visible; no SEO heading is hidden with CSS.

| Level | Exact heading | Purpose |
| --- | --- | --- |
| H1 | `Your Merch Partner in Malta` | Main brand and service position |
| H2 | `Real merchandise. Real events.` | Immediate visual proof |
| H2 | `Merchandise built around the event—not a catalogue.` | Product/category framing plus the sourcing-to-delivery process |
| H2 | `Built for Malta's event circuit.` | SiGMA, SBC, NEXT, other Malta events and iGaming relevance in one scene |
| H2 | `From brief to Malta.` | EU production, Malta delivery, lead time and the four-step process in one scene |
| H2 | `Useful answers before you brief us.` | Six collapsed FAQ items |
| H2 | `Need merch for an event in Malta?` | Final lead-generation section |

### Image ALT strategy

The current strategy is descriptive rather than keyword-stuffed:

- brand or client name;
- visible product type;
- event or conference context where it is genuinely visible;
- no claim that a photograph was taken in Malta unless that is known;
- decorative interface elements are text/CSS or marked `aria-hidden` rather than receiving artificial ALT copy.

The production HTML contains seven image elements and seven ALT descriptions: one Hero image and six images in the only project gallery.

**Exact unique ALT text**

1. `StarCrown conference gifts displayed at an international event`
2. `Branded StarCrown conference gifts displayed at an international event`
3. `Monolead branded socks, bottles and giveaways at a conference booth`
4. `CryptoBoss merchandise kit with cap, bottle and notebook`
5. `Adsterra branded drinkware and client gifts at a conference`
6. `Custom e.pn branded textile displayed at an event`
7. `UNLIM branded event materials and water bottle`

All project images use WebP files, include explicit width and height, and provide a 640-pixel mobile source. The Hero image is prioritized; gallery images are lazy-loaded. The social-sharing image has its own Open Graph ALT text.

**Image semantic gaps**

- The gallery offers captions but not full case-study pages with project scope, date, quantity, challenge and result.
- No `ImageObject` structured data is present. This is optional, not a launch blocker.

## 4. Structured data currently implemented

The page contains one JSON-LD graph with five schema entities.

| Schema | What it tells search/AI systems |
| --- | --- |
| `Organization` | The service is called merch.mt, uses `https://merch.mt`, can be contacted at `order@swaggy.agency`, and is connected to SWAGGY.agency as its parent organization. |
| `WebSite` | The website name, publisher and English language. |
| `WebPage` | The canonical page name, description, parent website and subject service. |
| `Service` | Event/conference merchandise is the offered service; Malta is the service area; the categories include event, conference, branded, promotional and iGaming merchandise; the audience is exhibitors, sponsors and international event teams. |
| `FAQPage` | Six visible, collapsed questions and answers covering lead time (including urgent work), delivery, named events, supplier model, product types and ordering. |

### Exact current JSON-LD

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://merch.mt/#organization",
      "name": "merch.mt",
      "url": "https://merch.mt",
      "email": "order@swaggy.agency",
      "parentOrganization": {
        "@type": "Organization",
        "name": "SWAGGY.agency",
        "url": "https://swaggy.agency"
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://merch.mt/#website",
      "url": "https://merch.mt",
      "name": "merch.mt",
      "publisher": {
        "@id": "https://merch.mt/#organization"
      },
      "inLanguage": "en"
    },
    {
      "@type": "WebPage",
      "@id": "https://merch.mt/#webpage",
      "url": "https://merch.mt",
      "name": "Event & Conference Merchandise Malta | merch.mt",
      "description": "Branded event merchandise, conference giveaways and promotional products produced in the EU and delivered to booths, hotels and venues across Malta.",
      "isPartOf": {
        "@id": "https://merch.mt/#website"
      },
      "about": {
        "@id": "https://merch.mt/#service"
      },
      "inLanguage": "en"
    },
    {
      "@type": "Service",
      "@id": "https://merch.mt/#service",
      "name": "Event and conference merchandise for Malta",
      "description": "Branded event merchandise, conference giveaways, iGaming merchandise and promotional products produced in the EU and delivered to venues, booths and hotels in Malta.",
      "provider": {
        "@id": "https://merch.mt/#organization"
      },
      "areaServed": {
        "@type": "Country",
        "name": "Malta"
      },
      "serviceType": [
        "Event merchandise",
        "Conference merchandise",
        "Branded merchandise",
        "Promotional products",
        "iGaming conference merchandise"
      ],
      "audience": {
        "@type": "BusinessAudience",
        "audienceType": "Exhibitors, sponsors and international event teams"
      }
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How early should I order merchandise for an event in Malta?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Four weeks or more gives the widest choice. Three weeks is fast-track. Two weeks or less, including urgent orders, is assessed case by case based on the product, branding and quantity."
          }
        },
        {
          "@type": "Question",
          "name": "Can you deliver merchandise to a conference venue or hotel in Malta?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. We can arrange delivery straight to your conference booth, hotel room or another agreed location in Malta. We confirm the delivery details and contact person with you before dispatch."
          }
        },
        {
          "@type": "Question",
          "name": "Can you produce merchandise for SiGMA, SBC or NEXT in Malta?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. We produce SiGMA Malta merchandise, SBC Malta merchandise and NEXT Valletta merchandise for exhibitors, sponsors and international event teams. merch.mt and SWAGGY are not presented as official suppliers or partners of these events."
          }
        },
        {
          "@type": "Question",
          "name": "Are you a merchandise supplier in Malta?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "We are an EU production partner for companies attending events in Malta. We handle branding and quality control within the EU, then arrange merchandise delivery to your venue, booth or hotel in Malta."
          }
        },
        {
          "@type": "Question",
          "name": "What kind of event merchandise can you produce?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "We produce conference giveaways, promotional products, branded apparel, bags and textiles, team merchandise, client gifts, VIP gifts, welcome kits and custom campaign-specific products."
          }
        },
        {
          "@type": "Question",
          "name": "How do I order merch for a Malta event?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Send us the event name, date, audience, quantity and approximate budget. We will suggest branded merchandise that fits your booth, team, partners or clients, then coordinate production and delivery to Malta."
          }
        }
      ]
    }
  ]
}
```

## 5. GEO / AI Search readiness

GEO here means Generative Engine Optimization: making the service sufficiently explicit and internally consistent for AI search systems to describe it correctly.

### Facts AI systems can currently extract

| Question an AI system needs to answer | Explicit factual statements currently available |
| --- | --- |
| **What does merch.mt do?** | “Branded event merchandise, conference giveaways and promotional products produced in the EU and delivered to booths, hotels and venues across Malta.” The product section further lists giveaways, apparel, client gifts, VIP gifts, welcome kits and custom event merchandise. |
| **Who does it serve?** | Visible copy names international teams, sponsors and B2B exhibitors. Structured data defines the audience as “Exhibitors, sponsors and international event teams.” The page also addresses booth teams, partners, clients, speakers and staff. |
| **Where does it deliver?** | Hero and FAQ copy explicitly state delivery to a conference booth, venue, hotel room or another agreed location in Malta. `Service.areaServed` is Malta. |
| **Where are products produced?** | The page repeatedly states EU production. The supplier FAQ clarifies that merch.mt is an EU production partner for companies attending events in Malta; it does not claim local Maltese production. |
| **Which Malta events does it serve participants of?** | SiGMA Europe Malta, SBC Summit Malta and NEXT Summit Valletta have dedicated cards. The page also names EU-Startups Summit, MedTech World, FinanceMalta Annual Conference, PLAYCON Malta, Malta Aviation Conference & Expo and Malta Maritime Summit. A disclaimer states that merch.mt/SWAGGY are not official suppliers or partners of these events. |
| **How can customers contact the service?** | Email: `order@swaggy.agency`; Telegram: `@swaggyagency`; on-page brief form at `/api/lead`. The preview form currently has no configured delivery destination, so Telegram and email are the live contact methods. |
| **What lead time should customers expect?** | 4+ weeks provides the widest choice; 3 weeks is fast-track; 2 weeks or less is assessed case by case. |
| **Who is behind the service?** | JSON-LD identifies merch.mt as an organization and SWAGGY.agency as its parent organization. The footer says “A project by SWAGGY.agency.” |

### Why this is useful for AI answers

The important facts are not implied only through branding. They are stated as complete sentences in visible page content and repeated consistently in structured data. This gives an AI system a reasonable basis to answer questions such as:

- “Who can deliver conference merchandise to my hotel in Malta?”
- “Can I order SiGMA merchandise before travelling?”
- “Is merch.mt a Maltese manufacturer?”
- “How early should I order giveaways for an event in Malta?”

The page is especially strong on the distinction between **EU production** and **delivery to Malta**, reducing the risk that an AI system incorrectly describes merch.mt as a local Maltese manufacturer.

### GEO gaps

The current page explains the service, but it offers limited independent evidence. Important gaps are:

1. **Entity verification:** no legal company name, registration details, business address, telephone number, `sameAs` social profiles, logo entity or structured `ContactPoint`.
2. **Case-study depth:** client photos and names are present, but there are no project dates, quantities, objectives, product specifications, delivery destinations, customer quotes or measurable results.
3. **Freshness signals:** no visible “last updated” date and no dated case studies or event calendar.
4. **Sourceable expertise:** no named expert, procurement methodology, quality-control standard or production capability page.
5. **Dedicated answer URLs:** all topics live on one page, so AI/search systems cannot cite a focused URL for SiGMA, SBC, NEXT, iGaming merchandise, delivery or individual product categories.
6. **Contact completeness:** email and Telegram are explicit, but phone, response-time expectation and structured contact details are absent.
7. **Commercial detail:** no minimum order quantities, indicative budgets, production method examples, delivery terms or product-specific lead times.
8. **External corroboration:** no linked reviews, testimonials, partner references or third-party profiles are present in the code.

These gaps should be closed only with verified business facts. The site should not add a Malta address, local-manufacturer claim, official event relationship, customer metric or testimonial unless it is true and approved.

## 6. Current measurement implementation

### What is already instrumented

The frontend pushes the following named events to `window.dataLayer`:

| Event | Meaning in the current page |
| --- | --- |
| `header_cta_click` | Header “Get a Quote” click |
| `hero_cta_click` | Hero “Get a Quote” click |
| `mobile_sticky_cta_click` | Mobile sticky CTA click |
| `timeline_cta_click` | “Check my timeline” click |
| `telegram_click` | Telegram click; label identifies Hero or form contact area |
| `email_click` | Email link click |
| `form_start` | First input in the brief form |
| `form_submit` | Successful server response after form submission |
| `project_gallery_view` | First observed project gallery/proof section |
| `conference_section_view` | Malta conference section reaches the visibility threshold |
| `conference_cta_click` | Event-card CTA click; instrumented in markup, but these links are hidden by the current production CSS |

`project_gallery_view` now maps unambiguously to the page's only gallery: the six-project proof block immediately after the Hero.

### What is not active yet

- No GA4 script is loaded.
- No Google Tag Manager container is loaded.
- No consent banner or consent-mode implementation is loaded.
- No Google Search Console verification is present in the HTML.
- No connected form destination is configured in the preview.
- No CRM/lead-source persistence is implemented.

Therefore the current page is **measurement-ready in principle**, but it is not yet collecting analytics data.

## 7. Post-launch measurement plan

### Before launch

1. Move the approved production design to `https://merch.mt/`.
2. Confirm that the final URL returns HTTP 200 and does not contain `noindex` in HTML or an `X-Robots-Tag` header.
3. Keep one canonical: `https://merch.mt/`.
4. Redirect obsolete public variants if they become externally reachable; do not index design-review URLs.
5. Configure and test at least one form destination: Telegram bot or secure webhook/CRM.
6. Create a Google Search Console Domain property and verify it through DNS.
7. Submit `https://merch.mt/sitemap.xml`.
8. Install GA4 through GTM or directly, together with the approved EU consent implementation.
9. Map the existing `dataLayer` events to GA4 events.
10. Mark `form_submit` as the primary conversion. Treat `telegram_click` and `email_click` as secondary conversions until downstream lead quality can be reconciled.

### Recommended GA4 event model

Keep the existing event names, with these refinements:

- add `cta_location` to all CTA clicks (`header`, `hero`, `timeline`, `mobile_sticky`, `final`);
- keep `project_gallery_view` tied to the single proof gallery; no gallery-location split is needed unless another gallery is added later;
- rename the current form payload parameter `event_name` to `conference_name` to avoid confusion with GA4’s event-name concept;
- pass `conference_name`, `quantity_band` and `budget_band` only after privacy review and without personal information;
- record a backend or CRM confirmation so a click is distinguishable from a qualified lead;
- either show the named conference CTAs or remove `conference_cta_click` from the reporting plan, because those links are currently hidden.

### Search Console review cadence

| Timing | What to check |
| --- | --- |
| Days 0–7 | URL Inspection, index eligibility, selected canonical, sitemap fetch, mobile rendering and any crawl errors |
| Weeks 2–4 | First non-brand queries, impressions by country/device, snippets, average position and pages receiving impressions |
| Day 28 | Establish the first query-cluster baseline; compare primary, iGaming, named-event and delivery/problem clusters |
| Days 60–90 | Decide whether evidence justifies dedicated landing pages; review conversions alongside ranking data |
| Monthly thereafter | Query growth, CTR changes, landing-page conversions, new event terms and cannibalization between any future pages |

### Query groups to monitor in Search Console

- **Primary:** `event merchandise`, `conference merchandise`, `branded merchandise`, `promotional products`, combined with `Malta`.
- **Event-specific:** `merch event Malta`, `event giveaways Malta`, `conference giveaways Malta`, `merch supplier Malta`.
- **iGaming:** every query containing `igaming` plus `merch`, `merchandise`, `conference`, `giveaway` or `gift`.
- **Conference:** `sigma`, `sbc`, `next`, `valletta` combined with merchandise intent.
- **Problem-based:** `deliver`, `delivery`, `venue`, `hotel`, `order`, `urgent`, `lead time`, `how early` combined with Malta/event merchandise.
- **Product discovery:** apparel, bags, notebooks, gifts, VIP gifts, welcome kits, team merch and giveaways.

### When to create additional landing pages

Use search demand and lead quality together. The following are practical decision thresholds, not guarantees:

1. **Named conference page:** create a SiGMA, SBC or NEXT page when that event cluster reaches at least **50 impressions in 28 days** with average position between 8 and 30, or generates **three qualified enquiries within 90 days**. The page must include event-specific deadlines, delivery information, product ideas and genuine proof—not just a rewritten homepage.
2. **iGaming page:** create a dedicated iGaming merchandise page when iGaming queries reach **100 impressions in 28 days** or **10 organic clicks within 90 days**, especially if the queries show a distinct B2B buying intent.
3. **Product/category page:** create a page for a category such as conference giveaways, apparel, welcome kits or VIP gifts when a coherent group reaches **75–100 impressions in 28 days** and the homepage is ranking outside the top 10, or when the category produces at least **two qualified organic leads**.
4. **Delivery/operations page:** create a Malta delivery and lead-time page when delivery, venue, hotel or urgent-order queries reach **75 impressions in 28 days** and visitors repeatedly engage with the timeline or delivery FAQs.
5. **Broad commercial page:** if a cluster exceeds **250 impressions in 28 days** but has a CTR below the site’s average while ranking between positions 4 and 15, test title/description and on-page framing before creating another URL.

Do **not** create a new page solely because one query appeared once. Avoid near-duplicate “doorway” pages. Each new page should have a distinct job, unique evidence and its own conversion rationale.

### GA4 and lead-quality reporting

The minimum monthly business dashboard should show:

- organic sessions to the production landing page;
- Search Console impressions, clicks, CTR and average position by the four main clusters;
- `form_start` rate from organic sessions;
- successful `form_submit` rate;
- Telegram and email click rate;
- qualified leads and won opportunities by source/cluster;
- conference named in the brief;
- days between enquiry date and event date;
- requested quantity and budget bands;
- conversion rate by device and country.

Search Console and GA4 should be linked so query demand can be reviewed alongside on-site behavior. CRM or lead-destination data is required to judge commercial quality; GA4 alone cannot show whether a lead became a sale.

### GEO / AI Search measurement

AI answer visibility cannot be measured completely through one platform. Use a combination of:

- GA4 referrals from services such as ChatGPT, Perplexity, Copilot and Gemini when a click is passed;
- Cloudflare request logs for identifiable referral traffic;
- monthly manual checks of a fixed set of buyer questions;
- brand-query growth in Search Console;
- a lead-source question in the sales process (“How did you find us?”);
- monitoring whether AI answers correctly state EU production, Malta delivery and non-official event relationship.

The manual AI check should use the same factual questions listed in the GEO section and record whether merch.mt is mentioned, whether the answer is accurate, which URL is cited and which competitors appear.

## 8. Prioritized next actions

### Launch blockers

1. Publish the approved production candidate at the canonical root.
2. Remove preview-only `noindex` directives from the live page.
3. Connect the form destination and run an end-to-end test.
4. Install GA4/GTM and consent handling.
5. Verify Search Console and submit the sitemap.

### First 30 days after launch

1. Confirm indexing and canonical selection.
2. Validate all analytics events and conversions.
3. Review query clusters weekly without creating premature pages.
4. Add verified organization/contact entity details if available.
5. Turn at least two existing project-photo sets into factual case studies.

### After 60–90 days of data

1. Create event or iGaming landing pages only where the thresholds in this report are met.
2. Add product/category pages where demand and lead quality support them.
3. Expand GEO evidence with dated case studies, approved testimonials and verifiable delivery details.
4. Review title/description CTR before assuming a new landing page is needed.

## 9. Code evidence reviewed

This report was derived from the following current implementation files:

- `src/content.mjs` — exact content, conference wording, FAQs and contact details;
- `scripts/build.mjs` — metadata, canonical, robots generation, sitemap and JSON-LD;
- `src/themes/production.css` — the visible production layout, responsive behavior and hidden shared conference-card CTAs;
- `src/script.js` — `dataLayer` events and form conversion behavior;
- `src/_worker.js` — form validation and delivery destinations;
- `dist/production/index.html` — actual generated production-candidate HTML;
- `dist/_headers` — live route-level `X-Robots-Tag` rules;
- `dist/robots.txt` and `dist/sitemap.xml` — crawl and sitemap state;
- `README.md` — confirmed preview, analytics and launch configuration state.

No claim in this report is based only on the original design brief.
