const ICAL_URL = import.meta.env.VITE_GOOGLE_CALENDAR_ICAL_URL || '';

export interface CalendarEvent {
  id: string;
  summary: string;
  start: Date;
  end: Date;
  allDay: boolean;
  location?: string;
  description?: string;
}

export function isCalendarConfigured(): boolean {
  return !!ICAL_URL;
}

/**
 * Parse an iCal VEVENT block into a CalendarEvent.
 */
function parseVEvent(block: string): CalendarEvent | null {
  const get = (key: string): string | undefined => {
    // Handle folded lines (RFC 5545: continuation lines start with space/tab)
    const unfolded = block.replace(/\r?\n[ \t]/g, '');
    const regex = new RegExp(`^${key}[;:](.*)$`, 'mi');
    const match = unfolded.match(regex);
    return match?.[1]?.trim();
  };

  const summary = get('SUMMARY') ?? 'Untitled';
  const uid = get('UID') ?? Math.random().toString(36);
  const location = get('LOCATION');
  const description = get('DESCRIPTION')?.replace(/\\n/g, '\n').replace(/\\,/g, ',');

  const dtStartRaw = get('DTSTART');
  const dtEndRaw = get('DTEND');
  if (!dtStartRaw) return null;

  const allDay = !dtStartRaw.includes('T');

  const parseICalDate = (raw: string): Date => {
    // Strip any TZID parameter prefix (e.g., "TZID=America/New_York:")
    const val = raw.includes(':') ? raw.split(':').pop()! : raw;
    if (val.includes('T')) {
      // 20260401T130000Z or 20260401T130000
      const y = val.slice(0, 4), m = val.slice(4, 6), d = val.slice(6, 8);
      const h = val.slice(9, 11), mi = val.slice(11, 13), s = val.slice(13, 15);
      const iso = `${y}-${m}-${d}T${h}:${mi}:${s}${val.endsWith('Z') ? 'Z' : ''}`;
      return new Date(iso);
    }
    // Date-only: 20260401
    const y = val.slice(0, 4), m = val.slice(4, 6), d = val.slice(6, 8);
    return new Date(`${y}-${m}-${d}T00:00:00`);
  };

  const start = parseICalDate(dtStartRaw);
  const end = dtEndRaw ? parseICalDate(dtEndRaw) : new Date(start.getTime() + 3600000);

  if (isNaN(start.getTime())) return null;

  return { id: uid, summary, start, end, allDay, location, description };
}

/**
 * Fetch and parse a private iCal feed URL.
 * Uses a CORS proxy since Google Calendar iCal URLs don't include CORS headers.
 */
export async function fetchCalendarEvents(daysAhead = 14): Promise<CalendarEvent[]> {
  if (!ICAL_URL) return [];

  // Use allorigins as CORS proxy for the iCal feed
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(ICAL_URL)}`;

  const res = await fetch(proxyUrl);
  if (!res.ok) throw new Error(`iCal fetch error: ${res.status}`);

  const icalText = await res.text();

  // Split into VEVENT blocks
  const eventBlocks = icalText.split('BEGIN:VEVENT').slice(1);
  const now = new Date();
  const cutoff = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

  const events: CalendarEvent[] = [];

  for (const block of eventBlocks) {
    const evt = parseVEvent(block);
    if (!evt) continue;
    // Only include future events within the window
    if (evt.end >= now && evt.start <= cutoff) {
      events.push(evt);
    }
  }

  // Sort chronologically
  return events.sort((a, b) => a.start.getTime() - b.start.getTime());
}
