const API_URL = import.meta.env.VITE_OPENCLAW_API_URL || '';
const TOKEN = import.meta.env.VITE_OPENCLAW_TOKEN || '';

const TIMEOUT_MS = 8000;

export interface OpenClawAgent {
  id: string;
  name: string;
  status: string;
  model?: string;
  workspace?: string;
}

export interface OpenClawCronJob {
  id: string;
  name: string;
  schedule: string;
  enabled: boolean;
  lastRun?: string;
}

export interface OpenClawEmail {
  id: string;
  to: string;
  subject: string;
  status: string;
  createdAt?: string;
}

export interface OpenClawSystemStatus {
  gateway: { status: string; type?: string; error?: string };
  channels?: Record<string, { enabled: boolean; state: string }>;
  smtp?: { status: string };
  model?: string;
  os?: string;
  node?: string;
}

export interface OpenClawActivity {
  id: string;
  type: string;
  message: string;
  timestamp: string;
}

async function apiFetch<T>(path: string): Promise<T> {
  if (!API_URL) throw new Error('OpenClaw API URL not configured');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${API_URL}${path}`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  } finally {
    clearTimeout(timeout);
  }
}

export async function isGatewayAvailable(): Promise<boolean> {
  if (!API_URL) return false;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${API_URL}/status`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchSystemStatus() {
  return apiFetch<OpenClawSystemStatus>('/status');
}

export async function fetchMemoryToday() {
  const today = new Date().toISOString().slice(0, 10);
  return apiFetch<{ content: string }>(`/memory/${today}`);
}

export async function fetchTasks() {
  return apiFetch<any[]>('/tasks');
}

export async function fetchCronJobs() {
  return apiFetch<OpenClawCronJob[]>('/cron/jobs');
}

export async function fetchAgents() {
  return apiFetch<OpenClawAgent[]>('/agents');
}

export async function fetchEmailQueue() {
  return apiFetch<OpenClawEmail[]>('/email/queue');
}

export async function fetchActivity() {
  return apiFetch<OpenClawActivity[]>('/activity');
}

export async function markEmailDone(id: string) {
  if (!API_URL) throw new Error('OpenClaw API URL not configured');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${API_URL}/email/queue/${id}/done`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${TOKEN}` },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  } finally {
    clearTimeout(timeout);
  }
}
