

# Cleanup: Remove Stale Data, Fix Inconsistencies, Add Ticker

## Current Pipeline Status (what's actually working)

| Pipeline | Status | Evidence |
|---|---|---|
| **Linear API** | LIVE | 200 OK, returning 8 real issues |
| **Dictionary API** | LIVE | Word-of-the-day working |
| **OpenClaw Gateway** (`mother.nuriy.com`) | DOWN | "Load failed" on all requests — tunnel not responding |
| **GitHub data polling** | DOWN | All `data/*.json` files return 404 from `nuriygold/clawpower/main/data/` |
| **iCal Calendar** | DOWN | `api.allorigins.win` proxy failing (Load failed) |
| **Shopify Revenue** | DOWN | Depends on gateway (`/shopify/revenue`), which is unreachable |

## What's Currently Misleading

1. **"Synced 3 days ago"** in SystemStatusBar — comes from local `data/system.json` fallback (dated March 26). This looks like a stale connection when really there's no connection at all.
2. **System Health card** — shows Gateway "Offline", Agents "0/0", Crons "0/0" from stale local JSON. Looks like a real reading but it's 3-day-old static data.
3. **Revenue tab** says Shopify "Connected" (because env vars exist), but **Today panel** says "Not connected" (because no revenue data came back). Contradictory.
4. **AWIN "Active"** and **TikTok Shop "Pending"** — completely hardcoded, not connected to anything real.
5. **Email Triage** — falls back to local `data/email-triage.json`, showing stale decisions as if they're live.

## Plan

### 1. Remove GitHub Polling Entirely
The `data/*.json` files don't exist on the remote repo. Every 60 seconds, 6+ requests 404. Remove the GitHub fetch layer and use gateway API as the only live source, with local JSON as a clearly-labeled static fallback.

**Files**: `src/lib/github-data.ts`, `src/lib/taskpool-github.ts`
- Remove `fetch()` calls to `raw.githubusercontent.com`
- Import local JSON directly and return it, labeled as "offline snapshot"
- Add a `source: 'live' | 'snapshot'` field so the UI can distinguish

### 2. Fix SystemStatusBar — Show Real Connection State
Instead of displaying stale "Synced 3 days ago", show whether live sources are reachable right now.

**File**: `src/components/panels/SystemStatusBar.tsx`
- Probe `mother.nuriy.com/status` on mount with a short timeout
- If unreachable: show "Gateway: Unreachable" with red dot — no misleading "synced" timestamp
- If reachable: show live status and real sync time
- Show Linear as green (confirmed working)
- Show Calendar status (configured but proxy failing)

### 3. Fix Shopify/Revenue Inconsistency
The Revenue panel's `ChannelCards` checks `isShopifyConfigured()` (env vars exist = "Connected"), but `Today` checks `hasRevenue` (actual data returned). These need to agree.

**Files**: `src/components/panels/RevenuePanel.tsx`, `src/components/panels/Today.tsx`
- Change ChannelCards to show "Configured" (not "Connected") when env vars exist but no data flows
- Show "Connected" only when `fetchShopifyRevenue` returns real data
- Today panel: match the same logic

### 4. Remove Hardcoded AWIN and TikTok Shop
These are fake entries with no backing integration.

**File**: `src/components/panels/RevenuePanel.tsx`
- Remove AWIN "Active" and TikTok Shop "Pending" rows
- Only show channels that have real env vars or API connections

### 5. Add Stock-Style Ticker
A horizontal scrolling ticker bar showing live data points from working integrations.

**File**: New `src/components/panels/Ticker.tsx`, added to `src/pages/Index.tsx`
- Positioned below the SystemStatusBar
- CSS `@keyframes ticker-scroll` animation, horizontal marquee
- Data points pulled from working feeds:
  - Linear: "8 issues · 2 Todo · 6 Backlog"
  - Gateway: "● Online" or "● Offline"
  - Calendar: next event summary (when iCal works)
  - Shopify: revenue number (when gateway works)
- Pauses on hover
- Only shows items with real data; empty items hidden

### 6. Gateway Connection — What You Need to Do
The tunnel at `mother.nuriy.com` is not responding from the browser. This is either:
- **Tunnel not running**: Tell Adrian to run `cloudflared tunnel run` on the Mac mini
- **CORS headers missing**: The OpenClaw gateway needs to return `Access-Control-Allow-Origin: *` (or `https://clawpower.lovable.app`) on all responses including OPTIONS preflight

You can test by visiting `https://mother.nuriy.com/status` in your browser directly. If it loads JSON, it's a CORS issue (fixable in gateway config). If it doesn't load at all, the tunnel process needs to be started.

## Files Modified

| File | Change |
|---|---|
| `src/lib/github-data.ts` | Remove GitHub fetch, return local JSON directly with `source` label |
| `src/lib/taskpool-github.ts` | Same — remove GitHub fetch, use local directly |
| `src/components/panels/SystemStatusBar.tsx` | Show real connection state, not stale timestamps |
| `src/components/panels/RevenuePanel.tsx` | Fix "Connected" vs real state, remove fake AWIN/TikTok |
| `src/components/panels/Today.tsx` | Match revenue display logic, remove stale system health numbers |
| `src/components/panels/Ticker.tsx` | New — stock-style scrolling ticker |
| `src/pages/Index.tsx` | Add Ticker below SystemStatusBar |
| `src/index.css` | Add `@keyframes ticker-scroll` animation |

