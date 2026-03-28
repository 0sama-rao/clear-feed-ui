# Cyber Brief — Complete Project State (as of 2026-03-28)

> **Context:** Project is pausing here. This document captures the entire frontend from A to Z so it can be understood and potentially integrated into a new project later.

---

## 1. What Is Cyber Brief?

A **personalized cybersecurity news intelligence platform**. Users define their infrastructure (tech stack), add news sources and keywords, and get AI-generated daily briefings about threats and CVEs relevant specifically to them.

**Formerly called:** Clearfeed (renamed to Cyber Brief during development)

**Live demo:** `demo.cyberbrief.io` (EC2 with nginx, auto-deployed via GitHub Actions)

**One-liner:** You tell us what tech you run — we tell you what CVEs, threats, and incidents matter to you specifically, summarized by AI.

---

## 2. Tech Stack (Frontend)

| Layer         | Technology                          | Version    |
|---------------|-------------------------------------|------------|
| Framework     | React                               | 19         |
| Language      | TypeScript                          | 5.9        |
| Build tool    | Vite                                | 7.3        |
| CSS           | Tailwind CSS v4                     | 4.x        |
| Routing       | React Router                        | v7         |
| HTTP client   | Axios                               | 1.13+      |
| Markdown      | react-markdown                      | latest     |
| Icons         | lucide-react                        | latest     |

**Key Axios note:** For POST requests with no body (e.g. `runDigest`), must use `headers.delete('Content-Type')` via `transformRequest` — not `delete headers['Content-Type']`. This is an AxiosHeaders API requirement in v1.13+.

---

## 3. Repository Structure

```
clear-feed-ui/
├── src/
│   ├── App.tsx                        # Route definitions
│   ├── main.tsx                       # Entry point
│   ├── context/
│   │   └── AuthContext.tsx            # Auth state, login/register/logout
│   ├── components/
│   │   ├── Layout.tsx                 # Sidebar + Outlet wrapper
│   │   ├── ProtectedRoute.tsx         # Auth + onboarding guard
│   │   ├── Sidebar.tsx                # Navigation sidebar
│   │   └── ui/
│   │       ├── Accordion.tsx          # Expand/collapse section
│   │       ├── Alert.tsx              # Success/error/warning banners
│   │       ├── Badge.tsx              # Colored status chips
│   │       ├── Button.tsx             # Primary button with isLoading state
│   │       ├── Card.tsx               # Generic bordered card
│   │       ├── ConfidenceScore.tsx    # % confidence indicator (color-coded)
│   │       ├── ConfirmDialog.tsx      # Modal confirm/cancel dialog
│   │       ├── EmptyState.tsx         # Centered icon + message + CTA
│   │       ├── EntityChip.tsx         # Named entity pill (company, person, etc.)
│   │       ├── Input.tsx              # Labeled text input
│   │       ├── Modal.tsx              # Full modal overlay with title + close
│   │       ├── Pagination.tsx         # Page prev/next + number display
│   │       ├── Prose.tsx              # react-markdown renderer (typography)
│   │       ├── ReportCard.tsx         # Period report stats card
│   │       ├── Select.tsx             # Labeled <select> dropdown
│   │       ├── SignalBadge.tsx        # Intelligence signal tag
│   │       └── Spinner.tsx            # Loading spinner (sm/md/lg)
│   ├── lib/
│   │   ├── api.ts                     # Axios instance + JWT interceptors
│   │   ├── services.ts                # All API call functions
│   │   └── types.ts                   # All TypeScript interfaces
│   └── pages/
│       ├── Login.tsx                  # Login form
│       ├── Register.tsx               # Sign-up form
│       ├── Onboarding.tsx             # Industry selection wizard
│       ├── Dashboard.tsx              # Main feed (intelligence brief + all articles)
│       ├── ArticleDetail.tsx          # Single article full view
│       ├── GroupDetail.tsx            # Intelligence story full view
│       ├── Sources.tsx                # CRUD for news sources
│       ├── Keywords.tsx               # CRUD for tracked keywords
│       ├── TechStack.tsx              # CRUD for user's infrastructure products
│       ├── Exposure.tsx               # CVE exposure dashboard
│       ├── Settings.tsx               # Digest schedule + email settings
│       └── Admin.tsx                  # Admin-only: users + stats
├── PRODUCT.md                         # This file
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## 4. Routing

```
/login                   → Login.tsx               (public)
/register                → Register.tsx             (public)
/onboarding              → Onboarding.tsx           (protected, skipOnboardingCheck)
/dashboard               → Dashboard.tsx            (protected + onboarding guard)
/dashboard/:id           → ArticleDetail.tsx        (protected)
/dashboard/group/:id     → GroupDetail.tsx          (protected)
/sources                 → Sources.tsx              (protected)
/keywords                → Keywords.tsx             (protected)
/techstack               → TechStack.tsx            (protected)
/exposure                → Exposure.tsx             (protected)
/settings                → Settings.tsx             (protected)
/admin                   → Admin.tsx                (protected, admin role only)
/*                       → redirect to /dashboard
```

**ProtectedRoute behavior:**
- If no `accessToken` in localStorage → redirect to `/login`
- If user not onboarded → redirect to `/onboarding` (unless `skipOnboardingCheck`)
- Admin page: sidebar only shows "Admin" nav item if `user.role === 'admin'`

---

## 5. Authentication Flow

- **Tokens:** JWT access token (15 min) + refresh token (7 days, UUID stored in DB)
- **Storage:** `localStorage` — keys: `accessToken`, `refreshToken`, `user`, `onboarded`
- **Auto-refresh:** Axios response interceptor catches 401, calls `POST /api/auth/refresh` once, retries original request. If refresh fails → clears localStorage, redirects to `/login`.
- **Queue:** Concurrent 401s are queued and replayed after single refresh completes.

**Auth context provides:**
- `user` — `{ id, email, name, role, onboarded, industry }`
- `login(email, password)` — stores tokens + user
- `register(name, email, password)` — stores tokens + user
- `logout()` — clears localStorage
- `onboarded` — boolean, set from `user.onboarded` on login
- `setOnboarded(val)` — called after completing onboarding

---

## 6. All API Endpoints (Frontend → Backend)

### Auth
```
POST  /api/auth/login           { email, password } → { accessToken, refreshToken, user }
POST  /api/auth/register        { name, email, password } → { accessToken, refreshToken, user }
POST  /api/auth/refresh         { refreshToken } → { accessToken, refreshToken }
```

### Sources
```
GET   /api/sources              → Source[]
POST  /api/sources              { url, name, type: 'RSS'|'WEBSITE' } → Source
PUT   /api/sources/:id          { url?, name?, type?, active? } → Source
DELETE /api/sources/:id
```

### Keywords
```
GET   /api/keywords             → Keyword[]
POST  /api/keywords             { word } → Keyword
DELETE /api/keywords/:id
```

### Feed (v1 flat)
```
GET   /api/feed                 ?page&limit → FeedResponse
GET   /api/feed/:id             → FeedArticleDetail
```

### Feed (v2 intelligence grouped)
```
GET   /api/feed/brief           ?page&limit&period → GroupedFeedResponse
GET   /api/feed/brief/report    ?period → PeriodReport
GET   /api/feed/groups/:id      → GroupDetail
POST  /api/feed/brief/reset     (no body) → { message }
```

### Onboarding
```
GET   /api/onboarding/industries → IndustriesResponse
POST  /api/onboarding            { industrySlug } → OnboardingResult
```

### Digest
```
POST  /api/digest/run           (no body) → DigestResult
POST  /api/digest/run-all       (no body) → DigestAllResult   [admin only]
```

**Note:** Digest is synchronous — returns 200 with result directly (may take 30-60s). Backend may return `{ status: "already_running" }` — frontend guards against this.

### Settings
```
GET   /api/settings             → UserSettings
PUT   /api/settings             { digestFrequency?, digestTime?, emailEnabled? } → UserSettings
```

### Tech Stack
```
GET   /api/techstack            → TechStackItem[]
POST  /api/techstack            { vendor, product, version?, category } → TechStackCreateResult
DELETE /api/techstack/:id
GET   /api/techstack/catalog    ?search&category? → TechStackCatalogItem[]
POST  /api/techstack/bulk       { items: [{ vendor, product, category }] } → TechStackBulkResult
```

### Exposure
```
GET   /api/exposure             ?state?&page?&limit?&sort? → ExposureListResponse
GET   /api/exposure/stats       → ExposureStats
GET   /api/exposure/overdue     → Exposure[]
POST  /api/exposure/:cveId/patch  { patchedAt? } → Exposure
PUT   /api/exposure/:cveId        { exposureState, notes? } → Exposure
```

### Admin
```
GET   /api/admin/users          → AdminUser[]
GET   /api/admin/stats          → AdminStats
```

---

## 7. All TypeScript Types

### Core
```typescript
Source { id, userId, url, name, type: 'RSS'|'WEBSITE', active, createdAt }
Keyword { id, userId, word, createdAt }
ArticleSource { id, name, url }
```

### Feed (v1 flat)
```typescript
FeedArticle { id, title, url, summary, publishedAt, scrapedAt, source, matchedKeywords, read, sent }
FeedArticleDetail extends FeedArticle { content }
FeedResponse { articles: FeedArticle[], pagination: PaginationInfo }
PaginationInfo { page, limit, total, totalPages }
```

### Feed (v2 grouped intelligence)
```typescript
Entity { type: 'COMPANY'|'PERSON'|'PRODUCT'|'GEOGRAPHY'|'SECTOR', name, confidence }
ArticleSignal { name, slug, confidence }
GroupArticlePreview { id, title, url, publishedAt, source, entities, signals }
GroupBriefing { id, title, synopsis, executiveSummary, impactAnalysis, actionability, confidence, caseType, date, articleCount, articles }
GroupedFeedResponse { groups: GroupBriefing[], pagination }
GroupArticleFull { id, title, url, content, cleanText, summary, publishedAt, author, source, entities, signals, matchedKeywords, read }
GroupDetail { id, title, synopsis, executiveSummary, impactAnalysis, actionability, confidence, caseType, date, articles: GroupArticleFull[] }
```

### Period Reports
```typescript
Period = '1d' | '7d' | '30d'
PeriodReportEntity { name, type, count }
PeriodReport {
  period, fromDate, toDate, summary,
  stats: {
    totalStories, totalArticles, criticalStories,
    signalDistribution: Record<string, number>,
    topEntities: PeriodReportEntity[],
    storiesPerDay: Record<string, number>,
    // optional (CVE-focused):
    vulnerableStories?, fixedStories?, infoStories?,
    topAffectedProducts?, topAffectedSectors?, topThreatActors?
  },
  generatedAt
}
```

### Digest
```typescript
DigestResult { message, result: { scraped, matched, summarized, errors: string[] } }
DigestAllResult { message, results: [{ userId, scraped, matched, summarized, errorCount }] }
```

### Settings
```typescript
DigestInterval = '1h' | '3h' | '6h' | '12h' | '1d' | '3d' | '7d'
UserSettings { digestFrequency: DigestInterval, digestTime: string, emailEnabled: boolean, lastDigestAt: string|null, email: string }
```

### Tech Stack
```typescript
TechStackCategory = 'EDGE_DEVICE'|'NETWORK'|'OS'|'APPLICATION'|'CLOUD'|'IDENTITY'|'DATABASE'|'LIBRARY'|'OTHER'
TechStackItem { id, userId, vendor, product, version, category, cpePattern, active, createdAt, _count: { exposures: number } }
TechStackCatalogItem { vendor, product, category, displayName }
TechStackCreateResult extends TechStackItem { retroactiveMatches: number }
TechStackBulkResult { added, skipped }
```

### Exposure
```typescript
ExposureState = 'VULNERABLE' | 'FIXED' | 'NOT_APPLICABLE' | 'INDIRECT'
ExposureArticleCve { cveId, cvssScore, severity: 'CRITICAL'|'HIGH'|'MEDIUM'|'LOW', description, inKEV, kevDueDate }
ExposureTechStackRef { vendor, product, version, category }
Exposure { id, cveId, exposureState, firstDetectedAt, patchedAt, remediationDeadline, articleCve, techStackItem }
ExposureListResponse { data: Exposure[], pagination }
ExposureStats { totalVulnerable, totalFixed, totalNotApplicable, totalIndirect, totalOverdue, patchRate, slaCompliance, avgMttrDays, medianMttrDays, kevExposureCount, overdueKevCount, criticalExposed, avgCvssExposed }
```

### Admin + Onboarding
```typescript
AdminUser { id, email, name, role, createdAt, sourcesCount, keywordsCount }
AdminStats { totalUsers, totalSources, totalKeywords, totalArticles, totalMatched }
Signal { id, name, slug, description }
Industry { id, name, slug, description, signals: Signal[] }
IndustriesResponse { industries: Industry[] }
OnboardingResult { message, industry: { id, name, slug }, sourcesAdded, keywordsAdded }
```

---

## 8. Page-by-Page Feature Summary

### Dashboard (`/dashboard`)
- **Two view modes:** Intelligence Brief (v2 grouped AI stories) and All Articles (v1 flat)
- **Period tabs:** Daily (1d) / Weekly (7d) / Monthly (30d)
- **Period Report:** `ReportCard` shown above the story list — stats + AI markdown summary
- **Story cards:** Title, synopsis, confidence score, signal badges, entity chips, accordions for Executive Brief / Impact Analysis / What To Do / Sources
- **caseType border colors:** red (actively exploited), orange (vulnerable), green (fixed)
- **Digest button:** Runs `POST /api/digest/run`, shows result count, refreshes feed. Has "already_running" guard.
- **Reset Feed button:** Calls `POST /api/feed/brief/reset`, regenerates intelligence groups

### ArticleDetail (`/dashboard/:id`)
- Full article content + summary rendered with `Prose` (react-markdown)
- Back button to dashboard

### GroupDetail (`/dashboard/group/:id`)
- Full intelligence story with all articles listed
- Executive Brief, Impact Analysis, What To Do in Prose renderer

### Sources (`/sources`)
- List all RSS/website sources
- Add modal: URL + name + type dropdown (RSS/WEBSITE)
- Edit in-place (toggle active/inactive)
- Delete with ConfirmDialog

### Keywords (`/keywords`)
- List keywords as pill chips
- Add input with Enter key support
- Delete (×) button on each chip

### Tech Stack (`/techstack`)
- List user's registered infrastructure products
- Cards show: vendor/product, version badge, category badge (color-coded), exposure count badge
- Add modal:
  - Search input → queries `/api/techstack/catalog` with 300ms debounce
  - Dropdown shows catalog matches
  - **If no catalog results found:** manual Vendor + Product inputs appear
  - Version (optional) + Category dropdown always shown
  - Submits either catalog selection OR manual vendor/product
- Retroactive match success message: "Found X existing exposures"
- Delete with ConfirmDialog

**Category badge colors:**
- EDGE_DEVICE: red, NETWORK: orange, OS: violet, APPLICATION: blue, CLOUD: sky, IDENTITY: purple, DATABASE: emerald, LIBRARY: amber, OTHER: gray

### Exposure (`/exposure`)
- 4 stats cards: Vulnerable count / Fixed count / Overdue count / Patch Rate %
- Filter bar: State (server-side via API param) + Severity (client-side filter)
- CVE cards: CVE ID, severity badge (CRITICAL=red, HIGH=orange, MEDIUM=amber, LOW=emerald), CVSS score, KEV badge, overdue badge (red border), state badge
- "Mark Patched" button (VULNERABLE only) → calls `POST /api/exposure/:cveId/patch` → updates state to FIXED
- Pagination

### Settings (`/settings`)
- **Digest Schedule section:** Frequency dropdown (7 intervals from 1h to 7d), preferred time picker (only shown for 1d/3d/7d intervals), last run timestamp
- **Email Notifications section:** Toggle on/off, read-only email display
- Dirty state tracking — Save button only enabled when something changed

### Admin (`/admin`)
- Users table: email, name, role, joined date, source count, keyword count
- Stats cards: total users, sources, keywords, articles, matched
- "Run All Digests" button (calls `/api/digest/run-all`)

### Onboarding (`/onboarding`)
- Industry selection: fetches `/api/onboarding/industries`
- Each industry shows its signals (relevance tags)
- On submit: calls `/api/onboarding` → fires-and-forgets `runDigest()` → redirects to `/dashboard`

---

## 9. UI Component Library

All components in `src/components/ui/` — no external UI library, all custom Tailwind CSS v4.

| Component        | Props / Behavior |
|------------------|------------------|
| `Alert`          | `variant: success\|error\|warning\|info`, `className` |
| `Badge`          | `variant: default\|primary\|success\|danger\|warning`, size |
| `Button`         | `isLoading`, `variant`, `size`, `disabled` |
| `Spinner`        | `size: sm\|md\|lg` |
| `Input`          | `label`, `id`, `error`, all HTML input attrs |
| `Select`         | `label`, `id`, `error`, all HTML select attrs |
| `Modal`          | `open`, `onClose`, `title` — renders portal-style overlay |
| `ConfirmDialog`  | `open`, `onConfirm`, `onCancel`, `message`, `confirmLabel`, `loading` |
| `EmptyState`     | `icon`, `title`, `description`, `action` |
| `Pagination`     | `page`, `totalPages`, `onPageChange` |
| `Accordion`      | `title`, `badge`, `children` — expand/collapse |
| `Prose`          | `content: string` — renders markdown via react-markdown |
| `ReportCard`     | `report: PeriodReport` — stats grid + markdown summary |
| `ConfidenceScore`| `score: number` — colored % display |
| `SignalBadge`    | `slug`, `name`, `confidence` — intelligence signal tag |
| `EntityChip`     | `entity: Entity` — named entity pill with type icon |

---

## 10. Key Patterns / Conventions

### CRUD Page Pattern (Sources, Keywords, TechStack)
```
1. useState for items list, loading, error
2. useCallback + useEffect to fetchItems on mount
3. Modal with form state for adding
4. ConfirmDialog for deleting
5. Optimistic local state update after API call (no re-fetch)
```

### Debounced Search Pattern (TechStack catalog)
```
useRef for timeout handle
onChange: clearTimeout(ref.current); ref.current = setTimeout(() => apiCall(), 300)
```

### Empty POST body (Axios)
```typescript
api.request({
  method: 'POST',
  url: '/api/...',
  transformRequest: [(_data, headers) => {
    headers.delete('Content-Type');  // Must use .delete() method, not bracket notation
    return undefined;
  }],
})
```

### Backward-compatible digest response
```typescript
// Backend may return { status: 'already_running' } or { message, result: {...} }
if ('status' in data && data.status === 'already_running') {
  setDigestMessage('A digest is already running...');
  return;
}
const { result } = data;
```

### After POST: safe item insertion
```typescript
// Backend POST response may omit _count — provide fallback
const newItem: TechStackItem = {
  ...result,
  _count: result._count ?? { exposures: result.retroactiveMatches },
};
setItems((prev) => [newItem, ...prev]);
```

---

## 11. What's Built vs What's Not

### Frontend — Fully Built ✅
- Auth (login, register, token refresh, logout)
- Onboarding flow (industry selection + digest kickoff)
- Dashboard: Intelligence Brief view (grouped stories, period report, accordions)
- Dashboard: All Articles view (flat feed, pagination)
- Article detail + Group detail pages
- Sources CRUD
- Keywords CRUD
- Tech Stack CRUD with catalog search + manual input fallback
- Exposure Dashboard (stats, filters, mark patched)
- Settings (digest schedule, email toggle)
- Admin (users list, stats, run-all digest)
- Full UI component library

### Frontend — Not Built ❌
- User profile / password change page
- Notifications / alerts page
- Slack / Teams integration UI
- Trend tracking views
- Advanced admin controls

---

## 12. Backend Architecture (What We Know)

The backend is a separate repo. From API contracts seen:

| Area | Technology |
|------|-----------|
| Runtime | Node.js + Fastify + TypeScript |
| Database | PostgreSQL + Prisma ORM |
| AI | Claude API (Anthropic) |
| Email | AWS SES |
| Scheduler | node-cron |
| Auth | JWT access + UUID refresh tokens |
| Deployment | EC2 |

**Key backend capabilities:**
- Article scraping (RSS + website) + keyword matching
- AI-generated intelligence grouping (clusters articles into stories)
- Per-story: Executive Summary, Impact Analysis, Actionability (markdown)
- CVE tracking: matches NVD CVEs against user's tech stack via CPE patterns
- Exposure states: VULNERABLE → FIXED / NOT_APPLICABLE / INDIRECT
- KEV (Known Exploited Vulnerabilities) tracking with deadlines
- Period reports (1d/7d/30d) with AI narrative summary + stats
- User-configurable digest schedule (cron via node-cron)

---

## 13. Deployment

- **Platform:** AWS EC2
- **Domain:** demo.cyberbrief.io
- **Web server:** nginx (reverse proxy to Vite build)
- **CI/CD:** GitHub Actions — auto-deploys to EC2 on push to `main`
- **Build:** `npx vite build` → `dist/` directory

---

## 14. Data and Endpoints Reusable in a New Project

The following backend data/APIs are fully generic and could be consumed by any frontend:

**Core intelligence pipeline (reusable as-is):**
- `GET /api/feed/brief` — grouped intelligence stories
- `GET /api/feed/brief/report` — period reports with AI summaries
- `GET /api/feed/groups/:id` — full story detail
- `POST /api/digest/run` — trigger full scrape + analyze + summarize

**CVE exposure tracking (highly reusable):**
- `GET /api/techstack` + `POST /api/techstack` — register what you run
- `GET /api/techstack/catalog` — search ~55 known products (NVD catalog)
- `GET /api/exposure` + `GET /api/exposure/stats` — CVE exposure data
- `POST /api/exposure/:cveId/patch` — mark remediated

**Auth (standard JWT, reusable directly):**
- `POST /api/auth/login` / `POST /api/auth/register` / `POST /api/auth/refresh`

**Settings (reusable):**
- `GET/PUT /api/settings` — digest frequency, time, email toggle

---

## 15. Git History (Last 5 Commits at Pause)

```
07a4c7b  Add Tech Stack management and Exposure Dashboard pages
56f3b73  Settings tab added with cron jobs to run and emails also
c1c2555  Data presented in better format
5781709  Add GitHub Actions CI/CD for auto-deploy to EC2
7050440  Changing product to cyber brief
```

---

## 16. Environment / Config

```
VITE_API_URL   (not used — baseURL is '' meaning same origin via nginx proxy)
```

All API calls go to the same origin. In development, `vite.config.ts` likely has a proxy config to forward `/api/*` to the backend.

---

## 17. How to Run Locally

```bash
npm install
npm run dev          # Vite dev server on :5173
npm run build        # Production build to dist/
npx tsc --noEmit     # TypeScript check
```
