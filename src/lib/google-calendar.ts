const API_KEY = import.meta.env.VITE_GOOGLE_CALENDAR_API_KEY || '';
const CALENDAR_ID = import.meta.env.VITE_GOOGLE_CALENDAR_ID || '';

export interface CalendarEvent {
  id: string;
  summary: string;
  start: Date;
  end: Date;
  allDay: boolean;
  location?: string;
}

export function isCalendarConfigured(): boolean {
  return !!API_KEY && !!CALENDAR_ID;
}

export async function fetchCalendarEvents(daysAhead = 14): Promise<CalendarEvent[]> {
  if (!API_KEY || !CALENDAR_ID) return [];

  const now = new Date();
  const future = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

  const params = new URLSearchParams({
    key: API_KEY,
    timeMin: now.toISOString(),
    timeMax: future.toISOString(),
    maxResults: '20',
    orderBy: 'startTime',
    singleEvents: 'true',
  });

  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events?${params}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Calendar API error: ${res.status}`);

  const json = await res.json();
  return (json.items ?? []).map((item: any) => {
    const allDay = !!item.start?.date;
    return {
      id: item.id,
      summary: item.summary ?? 'Untitled',
      start: new Date(item.start?.dateTime ?? item.start?.date),
      end: new Date(item.end?.dateTime ?? item.end?.date),
      allDay,
      location: item.location,
    };
  });
}
