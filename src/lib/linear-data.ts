const LINEAR_API_KEY = import.meta.env.VITE_LINEAR_API_KEY || '';

export interface LinearIssue {
  id: string;
  title: string;
  status: string;
  priority: number; // 0=none, 1=urgent, 2=high, 3=medium, 4=low
  team?: string;
  assignee?: string;
  dueDate?: string;
  labels: string[];
}

const PRIORITY_MAP: Record<number, string> = {
  0: 'C',
  1: 'A+',
  2: 'A',
  3: 'B',
  4: 'C',
};

const STATUS_MAP: Record<string, string> = {
  'In Progress': 'In Progress',
  'Todo': 'Ready',
  'Backlog': 'Backlog',
  'Done': 'Done',
  'Canceled': 'Done',
  'In Review': 'Pending Review',
  'Triage': 'Queued',
};

export function mapLinearPriority(p: number): string {
  return PRIORITY_MAP[p] ?? 'C';
}

export function mapLinearStatus(s: string): string {
  return STATUS_MAP[s] ?? s;
}

export function isLinearConfigured(): boolean {
  return !!LINEAR_API_KEY;
}

const QUERY = `
  query {
    viewer {
      assignedIssues(first: 100, filter: { state: { type: { nin: ["canceled"] } } }) {
        nodes {
          id
          title
          priority
          dueDate
          state { name }
          team { name }
          assignee { name }
          labels { nodes { name } }
        }
      }
    }
  }
`;

export async function fetchLinearIssues(): Promise<LinearIssue[]> {
  if (!LINEAR_API_KEY) return [];

  const res = await fetch('https://api.linear.app/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: LINEAR_API_KEY,
    },
    body: JSON.stringify({ query: QUERY }),
  });

  if (!res.ok) throw new Error(`Linear API error: ${res.status}`);

  const json = await res.json();
  const nodes = json?.data?.viewer?.assignedIssues?.nodes ?? [];

  return nodes.map((n: any) => ({
    id: n.id,
    title: n.title,
    status: n.state?.name ?? 'Unknown',
    priority: n.priority ?? 0,
    team: n.team?.name,
    assignee: n.assignee?.name,
    dueDate: n.dueDate,
    labels: (n.labels?.nodes ?? []).map((l: any) => l.name),
  }));
}
