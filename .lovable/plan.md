

# Phase 2: API Integrations & Revenue Panel

This plan adds five integrations to the existing Ivory Ledger dashboard. Since this is a client-side React app without a backend (no Supabase/Lovable Cloud), integrations that require secret API keys need careful handling. The plan addresses this reality head-on.

---

## Architecture Decision: Secret Keys in the Browser

Four of five integrations require API keys that should not be exposed in client-side code (`VITE_` variables are bundled into the browser). The options are:

1. **Use Lovable connectors** (Linear has one; Shopify has one) — requires enabling Lovable Cloud for edge functions
2. **Accept browser exposure** for read-only public tokens (Google Calendar public API key, Shopify Storefront public token)
3. **Proxy through OpenClaw gateway** — the existing `src/lib/api.ts` already points at the gateway; extend it to proxy Linear/Calendar/Shopify calls server-side

**Recommendation:** Use a hybrid approach:
- **OpenClaw API** and **Linear**: proxy through the OpenClaw gateway (add proxy endpoints server-side on the Mac mini)
- **Google Calendar**: use a public API key (read-only, restricted to calendar scope) directly from the browser
- **Shopify Storefront**: use the public Storefront Access Token directly from the browser (designed for client-side use)
- **Lovable Linear connector**: available but requires Lovable Cloud; use if the user wants to avoid Mac mini proxying

Before implementation, I need to confirm which approach you prefer for Linear and whether the OpenClaw gateway can be extended with proxy endpoints.

---

## Required Environment Variables

```
# OpenClaw Gateway (activate existing dormant layer)
VITE_OPENCLAW_API_URL=https://<gateway-tunnel>.trycloudflare.com
VITE_OPENCLAW_TOKEN=<gateway-auth-token>

# Google Calendar (public, browser-safe)
VITE_GOOGLE_CALENDAR_API_KEY=<google-cloud-api-key>
VITE_GOOGLE_CALENDAR_ID=<calendar-email>

# Shopify Storefront (public, browser-safe)
VITE_SHOPIFY_STORE_URL=<store>.myshopify.com
VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN=<public-storefront-token>

# Linear (if calling directly — expose risk)
VITE_LINEAR_API_KEY=<personal-api-token>
```

All secrets stored in 1Password; never commit `.env.local` to git.

---

## Integration 1: OpenClaw API Activation

**What exists:** `src/lib/api.ts` — dormant but correctly structured with Bearer token auth, endpoints for `/tasks`, `/cron/jobs`, `/agents`, `/email/queue`, `/activity`, and `markEmailDone`.

**Changes:**
- **Extend `src/lib/api.ts`** with proper TypeScript interfaces, error handling with timeout, and a `isGatewayAvailable()` health check
- Add new endpoints: `/status` (system health), `/memory/today` (today's memory file)
- **Dual-source pattern in panels**: Try OpenClaw API first → fall back to GitHub polling. Wrap in a custom hook `useOpenClawWithFallback(apiQueryKey, apiFn, ghQueryKey, ghFn)` in `src/hooks/use-openclaw-fallback.ts`
- **SystemHealthSection in Today.tsx**: When gateway is reachable, show live agent status instead of stale GitHub JSON
- **React Query config**: 30s staleTime, 30s refetchInterval

**Files:** `src/lib/api.ts` (edit), `src/hooks/use-openclaw-fallback.ts` (new)

---

## Integration 2: Linear — Task Pool Tab

**Data layer:** Create `src/lib/linear-data.ts`
- GraphQL query to fetch issues assigned to the user, with title, status, priority, team, labels, due date
- Called via `VITE_LINEAR_API_KEY` directly (or proxied through OpenClaw gateway if preferred)
- React Query: 60s staleTime, 60s refetchInterval

**UI change in `TaskPool.tsx`:**
- Add tab bar at top: **All | Local | Linear** (default: All)
- "All" merges both sources, deduplicating by task name
- "Local" shows only task-pool.md data (current behavior)
- "Linear" shows only Linear issues
- When Linear is unavailable (no key, API error), hide the Linear tab and default to Local — no error state, just graceful degradation
- Linear issues display with the same table format: map Linear priority (1-4) to A+/A/B/C, map Linear status to In Progress/Ready/Done/Backlog

**Files:** `src/lib/linear-data.ts` (new), `src/components/panels/TaskPool.tsx` (edit)

---

## Integration 3: Google Calendar

**Data layer:** Create `src/lib/google-calendar.ts`
- Fetch from Google Calendar API v3: `GET https://www.googleapis.com/calendar/v3/calendars/{calendarId}/events`
- Parameters: `timeMin=now`, `timeMax=now+14d`, `maxResults=20`, `orderBy=startTime`, `singleEvents=true`
- Uses public API key (browser-safe, restricted to Calendar API in Google Cloud Console)
- React Query: 3600s staleTime (1h), 60s refetchInterval

**UI changes:**
- **Today.tsx Calendar Snapshot**: Replace static placeholder with real events. Show next 3-5 upcoming events with date, time, title
- **DeadlinesCalendar.tsx**: Add a "Calendar" section below task deadlines showing the full 14-day event view
- Graceful fallback: if no API key or fetch fails, show "Connect Google Calendar in settings"

**Files:** `src/lib/google-calendar.ts` (new), `src/components/panels/Today.tsx` (edit), `src/components/panels/DeadlinesCalendar.tsx` (edit)

---

## Integration 4: Shopify Revenue Data

**Data layer:** Create `src/lib/shopify-data.ts`
- Use Shopify Storefront API (public token, browser-safe) for product data
- For order/revenue data: Shopify Admin API is required, which needs a private key. Two options:
  - **Option A**: Proxy through OpenClaw gateway (add `/shopify/orders` endpoint on Mac mini)
  - **Option B**: Use Lovable's Shopify connector (requires enabling Shopify integration)
- Target metrics: 30-day total revenue, order count, average order value, day-over-day % change, top 3 products by revenue
- React Query: 300s staleTime (5m), 300s refetchInterval

**Files:** `src/lib/shopify-data.ts` (new)

---

## Integration 5: Revenue Panel (New Sidebar Item)

**New component:** `src/components/panels/RevenuePanel.tsx`
- Sidebar nav item #4 (after Deadlines): "Revenue" with DollarSign icon
- Sections:
  1. **KPI cards row**: 30-day revenue, order count, AOV, day-over-day change (green/red arrows)
  2. **Revenue trend chart**: 30-day line chart using Recharts (already a Tailwind-compatible library). Add `recharts` as dependency
  3. **Top products**: Table of top 3 products by revenue with name, units sold, revenue
  4. **Channel breakdown**: Shopify / AWIN / TikTok Shop status cards (AWIN and TikTok remain static placeholders)
- When Shopify data unavailable: show placeholder cards with "Connect Shopify" messaging
- Matches Ivory Ledger palette: warm grays, forest green for positive trends, crimson for negative

**Today.tsx Revenue Signals**: Update the existing static placeholder to show real KPI summary when Shopify data is available

**Files:** `src/components/panels/RevenuePanel.tsx` (new), `src/pages/Index.tsx` (edit — add to panel map), `src/components/AppSidebar.tsx` (edit — add nav item), `src/components/panels/Today.tsx` (edit — update Revenue Signals section)

---

## Integration 6: Visual Polish — Rounded Edges

Across all changes: update `rounded-sm` and `rounded-md` to `rounded-lg` on panel cards and interactive surfaces (buttons, badges, inputs). Update `--radius` CSS variable from `0.375rem` to `0.5rem`. Preserve readability.

**Files:** `src/index.css` (edit `--radius`), component edits included above

---

## Polling & Performance

| Integration | staleTime | refetchInterval | Rationale |
|---|---|---|---|
| OpenClaw API | 30s | 30s | Live system health |
| Linear | 60s | 60s | Task data changes frequently |
| Google Calendar | 3600s | 60s | Respect Google quota |
| Shopify | 300s | 300s | Revenue data less volatile |
| GitHub polling | 60s | 60s | Unchanged from Phase 1 |

All use React Query's stale-while-revalidate by default.

---

## New Dependencies

- `recharts` — charting library for Revenue Panel trend chart

---

## File Summary

| Action | File |
|---|---|
| Edit | `src/lib/api.ts` — extend with types, health check, new endpoints |
| Edit | `src/components/panels/TaskPool.tsx` — add All/Local/Linear tabs |
| Edit | `src/components/panels/Today.tsx` — live calendar + revenue data |
| Edit | `src/components/panels/DeadlinesCalendar.tsx` — 14-day calendar view |
| Edit | `src/components/AppSidebar.tsx` — add Revenue nav item |
| Edit | `src/pages/Index.tsx` — add RevenuePanel to panel map |
| Edit | `src/index.css` — update `--radius` to `0.5rem` |
| Create | `src/hooks/use-openclaw-fallback.ts` |
| Create | `src/lib/linear-data.ts` |
| Create | `src/lib/google-calendar.ts` |
| Create | `src/lib/shopify-data.ts` |
| Create | `src/components/panels/RevenuePanel.tsx` |

---

## Success Criteria

- [ ] Linear: Task Pool has "Linear" tab; issues load with status/priority mapped to existing badge system
- [ ] Calendar: Today shows next 3-5 events; Deadlines panel shows 14-day view
- [ ] Shopify: Revenue block shows 30-day total + AOV + top 3 products (or graceful placeholder)
- [ ] OpenClaw: System health shows live agent status when gateway is reachable, falls back to GitHub
- [ ] Revenue panel: Sidebar item visible; routes to panel with KPI cards and trend chart
- [ ] All integrations: Graceful loading/error states (no blank panels, no console errors)
- [ ] React Query polling at specified intervals per integration
- [ ] Mobile responsive: panels stack on <768px without layout shift
- [ ] Design: rounded-lg on cards, all new components match Ivory Ledger palette

