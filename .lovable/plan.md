

## Wire GitHub JSON Data into Dashboard Panels

### Overview
Replace the broken API-backed panels (Agents, Cron Jobs, Email Queue, iCloud Sync) with GitHub raw content fetches, matching the Task Pool pattern. Add a persistent System Status bar at the top.

### Data Layer

**New file: `src/lib/github-data.ts`**
- Base URL: `https://raw.githubusercontent.com/nuriygold/clawpower/main/data/`
- Four fetch functions: `fetchAgentsGH()`, `fetchCronsGH()`, `fetchEmailQueueGH()`, `fetchSystemGH()`
- Each does a plain `fetch()` with `cache: 'no-store'`, parses JSON, falls back to local `data/*.json` imports (same pattern as task pool)
- Local fallbacks via Vite `?raw` imports of the JSON files in `data/`

### Panel Changes

**1. New component: `src/components/panels/SystemStatusBar.tsx`**
- Fetches `system.json` via `useQuery` with 60s polling
- Compact single-line bar with dark background at top of main content area
- Shows: Gateway status dot + HTTP code, iCloud Sync dot + folder count, Mac uptime, last sync timestamp
- Sits above the active panel in `Index.tsx`

**2. Rewrite `src/components/panels/AgentStatus.tsx`**
- Fetch from `fetchAgentsGH()` instead of `fetchAgents()`
- Data shape: `{ agents: [{ name, role, service, port, pid, status }] }`
- Group gateway agents (service = `ai.openclaw.gateway`) under an "OpenClaw Gateway" header card with shared status
- Remaining agents as individual cards in a 2-3 column grid
- Status dot: green if `status === 'running'`, red if `stopped`
- Show PID and port in small gray text
- "Last synced: X min ago" indicator

**3. Rewrite `src/components/panels/CronJobs.tsx`**
- Fetch from `fetchCronsGH()` instead of `fetchCronJobs()`
- Data shape: `{ crontab: [{schedule, command}], launchagents: [{label, pid, last_exit}] }`
- Two side-by-side subsections:
  - **Crontab**: table with Schedule (raw + human-readable, e.g. "Every 5 min"), Command (truncated 50 chars)
  - **LaunchAgents**: table with Label, Status (green if pid non-null, red if null), Last Exit Code
- "Last synced: X min ago" indicator

**4. Rewrite `src/components/panels/EmailQueue.tsx`**
- Fetch from `fetchEmailQueueGH()` instead of `fetchEmailQueue()`
- Data shape: `{ accounts: [{address, provider, status}], triage_log_recent: [...], imap_state: {...}, notes: string }`
- Three account pills: amber for `pending_migration`, green for `active`
- Scrollable monospace log box showing last 5 lines of `triage_log_recent`
- IMAP state key-value list if present
- Notes displayed below
- Remove the old per-email mark-done logic (no longer applicable)

**5. Rewrite `src/components/panels/ICloudSync.tsx`**
- Fetch from `fetchSystemGH()`, extract `icloud_sync` section
- Show real data: status, PID, account, folder count, destination path

**6. Update `src/pages/Index.tsx`**
- Import and render `SystemStatusBar` above the active panel inside the main content area
- Layout order when viewing panels: System Status Bar (persistent) → active panel content

### Files Modified
- `src/lib/github-data.ts` (new)
- `src/components/panels/SystemStatusBar.tsx` (new)
- `src/components/panels/AgentStatus.tsx` (rewrite)
- `src/components/panels/CronJobs.tsx` (rewrite)
- `src/components/panels/EmailQueue.tsx` (rewrite)
- `src/components/panels/ICloudSync.tsx` (rewrite)
- `src/pages/Index.tsx` (add status bar)

### Technical Details
- All queries use `useQuery` with `refetchInterval: 60000` and local JSON fallback on error
- Cron human-readable parsing: simple map for common patterns (`*/5 * * * *` → "Every 5 min")
- `formatDistanceToNow` from date-fns for "Last synced" timestamps
- No new dependencies needed

