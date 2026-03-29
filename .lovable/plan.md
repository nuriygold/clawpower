

# Today Panel: Add Date/Time Display + Calendar "What's Next" Section

## GitHub Data Status — No Action Needed

Your screenshots confirm `data/` folder exists on `main` branch at `nuriygold/clawpower` with all expected files: `agents.json`, `crons.json`, `email-queue.json`, `email-triage.json`, `system.json`, `task-pool.json`, `task-pool.md`. The fetch URL in `github-data.ts` already points to `https://raw.githubusercontent.com/nuriygold/clawpower/main/data/` — this should work. No folders need to be moved.

---

## Changes to Today Panel

### 1. Enhanced Greeting with Live Date and Time

Replace the current greeting section (lines 118-132) with a richer header that shows:
- Time-aware greeting (already exists)
- **Full date**: "Saturday, March 29, 2026"
- **Live clock**: "10:03 PM" — updates every minute via `setInterval`
- **Day progress**: "Day 88 of 2026" (already computed, just not prominently displayed)

```text
🌙 Good evening, queen
   Saturday, March 29, 2026 · 10:03 PM
   "Today's affirmation..."
```

### 2. "What's Next" Calendar Section

Replace the generic "Calendar" card (column 3, lines 304-337) with a "What's Next" card that highlights the **immediately upcoming event** prominently, then lists the rest:

- **Next event spotlight**: Large display of the next calendar event with countdown ("in 2 hours", "tomorrow at 9 AM")
- **Remaining events**: Compact timeline list (already exists, keep as-is)
- **Empty state**: When no iCal URL is configured, show "Add VITE_GOOGLE_CALENDAR_ICAL_URL to connect your calendar" (already exists)
- **Waiting state**: When configured but no events loaded yet, show a subtle loading indicator

### Files Modified

| File | Change |
|---|---|
| `src/components/panels/Today.tsx` | Add live clock state, enhance greeting with time, redesign Calendar card as "What's Next" with spotlight |

### Technical Details

- Add `useState` + `useEffect` with `setInterval(60000)` for live clock
- Use `formatDistanceToNow` from date-fns for "in 2 hours" countdown on next event
- No new dependencies needed — all date-fns functions already imported

