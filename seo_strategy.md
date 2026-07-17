# SEO Strategy

## In scope
- Public-facing routes in `artifacts/mqayada`
- Marketing and discovery pages: `/`, `/annual-offers`, `/advisor-standards`
- Public legal and trust pages: `/disclaimer`, `/privacy`, `/terms`
- Public auth entry pages where relevant to crawlability/meta checks: `/login`, `/register`, `/verify-email`

## Out of scope
- Authenticated client flows: `/client`, `/apply`, `/requests/:id`
- Advisor and staff dashboards: `/advisor`, `/supervisor`, `/admin`
- API-only routes in `artifacts/api-server` except where they affect crawlability of the frontend

## Target audience
- Arabic-speaking users in Saudi Arabia looking for debt refinancing, financing comparison, and better loan offers.
- Financial advisors and bank-affiliated consultants considering joining the platform.

## Primary keywords
- منصات مقارنة التمويل
- إعادة تمويل القروض
- مقايضة التمويل
- عروض التمويل في السعودية
- مستشار تمويل معتمد

## Dismissed categories
- (None yet)

## Notes
- The public app is a Vite + React SPA using Wouter. Public routes are client-rendered from a single `index.html` shell.
- For social bots and AI crawlers, only the static HTML head in `artifacts/mqayada/index.html` is visible.
