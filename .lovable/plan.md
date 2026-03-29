

# Today Panel Redesign: "The Claw Board"

Transform the Today panel from a newspaper-style grid into a warm, creative whiteboard/planner aesthetic — strong but feminine, clear, and delightful.

---

## Design Direction

**Vibe**: Personal planner meets digital whiteboard. Think Notion meets a curated Pinterest board. Soft pastels, generous rounding (xl/2xl), subtle shadows, decorative emoji/icon touches, and a warm greeting instead of a stern masthead.

**Color shifts**:
- Background: keep warm ivory base
- Cards: introduce soft pastel tints per section (rose for focus, lavender for calendar, mint for system health, peach for revenue, sky for email)
- Primary accent: shift from forest green to a dusty rose/mauve (`340 45% 55%`) with forest green as secondary
- Add a new `--claw-pink`, `--claw-lavender`, `--claw-mint`, `--claw-peach` palette

**Typography**: Keep Playfair Display for the greeting, but make it warmer — "Good morning, queen" style personalized greeting with the date below.

**Rounding**: Cards go from `rounded-lg` to `rounded-2xl`. Badges get `rounded-full`. Input fields and buttons get `rounded-xl`.

---

## Changes

### 1. Theme Updates — `src/index.css`
- Add CSS custom properties: `--claw-pink`, `--claw-lavender`, `--claw-mint`, `--claw-peach`, `--claw-sky`
- Increase `--radius` from `0.5rem` to `0.75rem`
- Add utility classes: `.card-pink`, `.card-lavender`, `.card-mint`, `.card-peach` for tinted card backgrounds
- Add a subtle `card-glow` box-shadow utility for the whiteboard "sticky note" feel
- Add a subtle dot-grid background pattern class for the main content area (whiteboard texture)

### 2. Today Panel Redesign — `src/components/panels/Today.tsx`
- **Masthead**: Replace "The Ivory Ledger" with a time-aware greeting ("Good morning" / "Good afternoon" / "Good evening") with a sparkle or flower emoji. Date formatted beautifully below. Add a short rotating motivational line from the affirmations data.
- **Layout**: Keep 3-column grid but make cards feel like pinned notes on a board — each card gets a unique soft pastel tint, `rounded-2xl`, and a slightly rotated/offset shadow for visual playfulness.
- **Section icons**: Add small decorative emoji or colored circle indicators next to each section header instead of plain uppercase text.
- **Calendar section**: Style it like a mini day-planner with time blocks, a visual timeline for today's events (colored dots on a vertical line), and the next 5 events styled as planner entries.
- **System Health**: Style as a cute status dashboard — use pill-shaped status indicators with labels, emoji for each system (shield for gateway, robot for agents, clock for crons, envelope for email, cloud for iCloud).
- **Priority Tasks**: Each task gets a checkbox-style circle indicator, softer domain badges with `rounded-full`, and hover effects.
- **Revenue Signals**: Add a small sparkline indicator or trend arrow with color (green up, rose down).

### 3. Sidebar Polish — `src/components/AppSidebar.tsx`
- Add subtle pastel hover states matching the card colors
- Active item gets a filled pill background instead of just accent color
- Add a small "crown" or "claw" emoji next to "Claw Power" brand

### 4. Header Bar — `src/pages/Index.tsx`
- Soften the header: `rounded-b-2xl` on the header, add a subtle gradient or warm tint
- "Live" indicator becomes a cute animated dot with "All systems go" or similar friendly text

### 5. Password Gate — `src/components/PasswordGate.tsx`
- Round the input and button to `rounded-xl`
- Add a soft gradient background or pattern
- Make the shield icon sit in a pastel circle with a glow

### 6. Sub-panels — `AccomplishmentsTracker.tsx`, `DailyModules.tsx`, `DeadlinesCalendar.tsx`
- Update all `rounded-sm` to `rounded-2xl`
- Add pastel tint backgrounds matching their parent column
- DailyModules: verse and affirmation cards get a slightly italic, centered, journal-entry feel with decorative quotation marks

### 7. PanelWrapper — `src/components/panels/PanelWrapper.tsx`
- `rounded-lg` becomes `rounded-2xl`
- Add soft pastel variant support via an optional `tint` prop

### 8. Main content area — `src/pages/Index.tsx`
- Add a subtle dot-grid or soft crosshatch background pattern to the `<main>` area to create the whiteboard feel

---

## Files Modified

| File | Change |
|---|---|
| `src/index.css` | New pastel palette, increased radius, dot-grid background, card-glow utility |
| `src/components/panels/Today.tsx` | Full visual redesign — greeting, pastel cards, calendar planner, creative layout |
| `src/components/AppSidebar.tsx` | Pill-style active states, softer hover, emoji brand touch |
| `src/pages/Index.tsx` | Softer header, dot-grid main background |
| `src/components/PasswordGate.tsx` | Rounder inputs/buttons, warmer styling |
| `src/components/panels/DailyModules.tsx` | `rounded-2xl`, journal-entry styling |
| `src/components/panels/AccomplishmentsTracker.tsx` | `rounded-2xl`, pastel tint |
| `src/components/panels/DeadlinesCalendar.tsx` | `rounded-2xl`, planner-style entries |
| `src/components/panels/PanelWrapper.tsx` | `rounded-2xl`, optional tint prop |
| `src/components/panels/SystemStatusBar.tsx` | Softer styling, emoji indicators |

---

## What stays the same
- All data fetching, React Query hooks, API integrations — untouched
- 3-column responsive grid layout structure
- All panel navigation and routing
- Sidebar items and panel registry
- All existing functionality

---

## Success Criteria
- [ ] Today panel feels like opening a personal planner/whiteboard, not a spreadsheet
- [ ] Soft pastels per section — visually distinct but harmonious
- [ ] `rounded-2xl` on all cards, `rounded-full` on badges
- [ ] Time-aware greeting replaces "The Ivory Ledger" masthead
- [ ] Calendar section has a visual day-planner feel
- [ ] Mobile responsive: single column stacks cleanly
- [ ] No functionality regressions — all data still loads and displays

