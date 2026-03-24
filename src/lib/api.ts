const API_URL = import.meta.env.VITE_OPENCLAW_API_URL || '';
const TOKEN = import.meta.env.VITE_OPENCLAW_TOKEN || '';

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function fetchTasks() {
  return apiFetch<any[]>('/tasks');
}

export async function fetchCronJobs() {
  return apiFetch<any[]>('/cron/jobs');
}

export async function fetchAgents() {
  return apiFetch<any[]>('/agents');
}

export async function fetchEmailQueue() {
  return apiFetch<any[]>('/email/queue');
}

export async function fetchActivity() {
  return apiFetch<any[]>('/activity');
}

export async function markEmailDone(id: string) {
  const res = await fetch(`${API_URL}/email/queue/${id}/done`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
