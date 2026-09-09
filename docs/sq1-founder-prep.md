# Kleenest SQ1 Founder Prep — v1

This document is the working founder-preparation baseline for Cortex SQ1, pilot meetings, and early investor-readiness conversations.

## Stage framing

Kleenest has substantial product and location-data infrastructure, but customer traction is still early. The St. Louis pilot exists to convert that infrastructure into measurable proof: useful searches, partner activation, verified observations, repeat usage, discovery-to-visit behavior, and willingness to pay.

Do not describe imported location coverage as customers or traction. Do not call a prospect a partner without explicit approval. Do not describe accessibility data as certified unless authoritative evidence supports that claim.

## Business Model Canvas v1

### Key partners
- Pilot businesses and venues.
- Visitor-economy and destination organizations.
- Local startup ecosystem and mentors.
- OpenStreetMap and other licensed/public data sources.
- Supabase / cloud infrastructure.
- Future channel partners: hotels, attractions, route networks, enterprise and fleet organizations.

### Key activities
- Ingest and normalize place data.
- Maintain provenance, confidence, freshness, and contradictions.
- Build consumer discovery and route-aware search.
- Recruit and onboard pilot businesses.
- Collect real-world observations and check-ins.
- Provide business corrections, analytics, QR engagement, and partner support.

### Value propositions
**Consumers:** Find a place that actually has the amenity needed, with confidence and freshness context.

**Businesses:** Keep amenity/location facts current, understand what visitors need, and measure discovery/engagement without heavy operational burden.

**Partners:** Improve visitor utility across a network of locations with measurable, current data.

### Customer relationships
- Consumer self-service discovery plus community contribution.
- Lightweight pilot onboarding and direct founder support for businesses.
- Relationship-led partner pilots with agreed review cadence.
- Long-term self-service business tools and account success for multi-location/enterprise.

### Customer segments
1. Consumers with practical amenity needs: families, travelers, drivers, and route-based users.
2. Single-location businesses.
3. Growth / multi-location businesses and venues.
4. Visitor-economy and destination networks.
5. Fleet / enterprise users after the core discovery loop is proven.

### Channels
- Kleenest web/native apps.
- Direct founder outreach.
- QR and physical-location engagement.
- Hotels, attractions, tourism and destination partners.
- Local associations and startup ecosystem.
- Partner referrals and city-by-city expansion.

### Key resources
- Kleenest consumer/business/fleet/owner apps.
- Location-data network and provenance layer.
- Verification/confidence/freshness logic.
- QR/check-in and attribution capabilities.
- Founder relationships and local pilot network.
- Brand, code, analytics, and operating know-how.

### Cost structure
- Cloud/database/storage and mapping.
- Data ingestion and monitoring.
- Product engineering and QA.
- Sales, partnerships and customer success.
- Marketing and local activation.
- Legal, privacy, insurance and accounting.
- Moderation / trust and safety as usage grows.

### Revenue streams
Current Production catalog inputs as of 2026-09-09:
- Business Standard: $20/month.
- Business Growth: $50/month.
- Fleet: $75/month up to 50 users.
- Enterprise: custom.
- Consumer Premium: $5 one-time.
- Family: $20 one-time up to 5 users.
- Ads and partner programs should remain secondary until user value and trust are proven.

## Five customer hypotheses

### 1. Consumer destination-choice hypothesis
People with a specific amenity need will choose a destination based on trusted amenity information, not merely proximity or star rating.

**Test:** 10 problem interviews plus a task test using the demo/search flow.

**Pass signal:** At least 7/10 describe a current uncertainty/workaround and at least 6/10 prefer a better-supported result when it solves the need.

### 2. Hospitality workflow hypothesis
Hotels and visitor-facing teams repeatedly answer “where can I find X?” questions and will value a no-signage tool that improves nearby recommendations.

**Test:** Four Seasons plus two additional hotel interviews.

**Pass signal:** At least 2/3 confirm the repeated need and at least one agrees to a pilot.

### 3. Single-location willingness-to-pay hypothesis
A single-location business will pay $20/month once Kleenest shows measurable discovery, visit, correction, or engagement value.

**Test:** Five founding-pilot interviews with an explicit price conversation after value is established.

**Pass signal:** At least 3/5 accept a pilot and at least 2/5 say $20/month is reasonable after proof.

### 4. Growth/multi-location value hypothesis
Growth and multi-location operators will pay $50/month or more for multi-location control, analytics, promotions, QR attribution, and improved location-data quality.

**Test:** Three operator interviews plus a prototype analytics review.

**Pass signal:** At least 2/3 rank correction/analytics/attribution as important and consider $50+ plausible.

### 5. Channel-introduction hypothesis
Channel partners will introduce multiple locations when Kleenest offers useful verified coverage with very low onboarding burden.

**Test:** Three partner interviews with a specific 10–25 location introduction ask.

**Pass signal:** At least one partner offers five or more concrete location introductions.

## Ten customer interviews identified

1. Jonathan Reap — Four Seasons Hotel St. Louis — hospitality / visitor experience.
2. Hotel Saint Louis — guest experience / sales lead.
3. Drury Hotels — group sales / guest experience.
4. Saint Louis Galleria management — destination / retail.
5. City Foundry STL management — destination / multi-tenant.
6. The Magic House — visitor experience / families.
7. Saint Louis Zoo — guest services.
8. Sump Coffee or Coffeestamp owner/manager — single-location SMB.
9. Parent with young children — consumer family use case; recruit through local network/SQ1 cohort.
10. Driver / route-based worker — consumer route-aware use case; recruit through a local driver/fleet network.

Use problem interviews, not product pitches. Start with the last real occurrence of the problem, current workaround, frequency, buyer/budget, switching threshold, willingness to test, and only then price.

## 12-month financial model

The companion workbook `Kleenest_SQ1_Founder_Prep.xlsx` contains a formula-driven base planning scenario. It is not a forecast.

The model uses live Kleenest catalog prices but editable assumptions for customer acquisition, conversion, churn, infrastructure, marketing, and founder compensation. It currently models the free pilot period first, then conversion into paid Business Standard/Growth customers plus limited one-time consumer/family purchases.

The purpose is not to defend every number. The purpose is to give mentors something falsifiable to attack and improve.

## Three mentor questions

1. **If I can validate only one customer wedge during the 10 weeks of SQ1, which would you force me to choose first — consumer amenity discovery, single-location businesses, hospitality/visitor experience, or another segment — and what evidence would make you confident that choice is right?**

2. **Given the current $20/month Business Standard and $50/month Business Growth pricing, what specific conversion, retention, usage, and willingness-to-pay evidence would you need before calling the business model credible rather than merely promising?**

3. **Looking at this 12-month model and our St. Louis pilot plan, which assumption is most likely wrong — customer acquisition, conversion, churn, pricing, cost structure, or expansion — and what experiment should I run in the next 14 days to try to disprove it?**

## Deterministic five-minute demo

A self-contained presentation route is implemented at `/demo` on the `sq1-readiness-demo` branch. It uses clearly labeled fixture data so the presentation does not depend on live location APIs, account state, pilot metrics, or a partner relationship.

### Demo timing

**0:00–0:45 — Intent**
“Kleenest starts with intent. The question is not ‘what is nearby?’ It is ‘where can I go that actually has what I need?’”

**0:45–1:30 — Trust**
“The trust layer matters as much as the pin. We separate confidence, freshness and evidence so people can judge whether a result is worth acting on.”

**1:30–2:15 — Decision**
“Now the user can make a destination decision with context — not just a name, rating and distance.”

**2:15–3:10 — Verification**
“When the person arrives, a check-in or observation closes the loop. QR can strengthen attribution, but a partner does not need signage to participate.”

**3:10–4:05 — Network effect**
“Each real-world observation improves freshness for the next person and rewards the contributor without pretending one report is absolute truth.”

**4:05–5:00 — Business value**
“The business side completes the network: businesses can correct facts, understand demand and eventually measure discovery-to-visit value. That is the commercial loop we are validating in St. Louis.”

End the demo with the pilot ask. Do not turn it into a full feature tour.
