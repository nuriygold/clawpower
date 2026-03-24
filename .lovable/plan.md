

## Add "Today" Tab to the Dashboard

### What it does
Adds a new "Today" panel as the default landing view. It surfaces a focused, at-a-glance summary of what matters right now -- active tasks, upcoming deadlines, system health, and recent email triage items -- so you don't have to click through each panel.

### Layout

```text
+------------------------------------------+
| TODAY - March 24, 2026                   |
+------------------------------------------+
| [Priority Tasks]          | [System]     |
| - In Progress (A/A+)     | Gateway: OK  |
| - Ready (A/A+)           | iCloud: OK   |
|                           | Uptime: 14d  |
+---------------------------+--------------+
| [Email Triage]            | [Cron Health]|
| 3 pending decisions       | 5/5 running  |
| Next: from John @ 9:14am | 0 failed     |
+---------------------------+--------------+
```

### Sections inside the Today panel

1. **Priority Tasks** -- Filters task pool to show only `In Progress` + `Ready` items with priority `A` or `A+`, sorted by priority then domain. Compact card list (task name, domain badge, status badge). Click any task to jump to Task Pool with that filter.

2. **Email Triage Summary** -- Shows count of pending decisions from email-triage data. Lists the 3 most recent pending items (from, subject, time ago). Click to jump to Email Triage panel.

3. **System Health** -- Pulls from `fetchSystemGH()`. Shows gateway status, iCloud sync status, Mac uptime in a compact card. Mirrors the status bar but slightly more detailed.

4. **Cron/Agent Health** -- Pulls from `fetchAgentsGH()` and `fetchCronsGH()`. Shows running agent count, any stopped agents flagged red, LaunchAgent failures.

### Files to create/modify

**New: `src/components/panels/Today.tsx`**
- New panel component with 4 summary cards in a 2x2 responsive grid
- Uses `useQuery` for all 4 data sources (task pool, email triage, system, agents/crons) with 60s polling
- Each card has a "View all" link that calls `onNavigate` to switch panels

**Modified: `src/pages/Index.tsx`**
- Add `today: Today` to the panels map
- Change default `activePanel` state from `'tasks'` to `'today'`
- Pass `onNavigate={setActivePanel}` prop to `Today` component

**Modified: `src/components/AppSidebar.tsx`**
- Add `{ id: 'today', title: 'Today', icon: CalendarDays }` as the first sidebar item

**Modified: `src/components/panels/Today.tsx` (the new file)**
- Accepts `onNavigate: (id: string) => void` prop so cards can link to full panels

### Technical details
- Reuses existing fetch functions: `fetchTaskPoolFromGitHub`, `fetchEmailTriageGH`, `fetchSystemGH`, `fetchAgentsGH`, `fetchCronsGH`
- All queries share the same cache keys as other panels, so no duplicate fetches
- `date-fns` `format` for the date header, `formatDistanceToNow` for timestamps
- Responsive: 2-column grid on desktop, stacked on mobile

