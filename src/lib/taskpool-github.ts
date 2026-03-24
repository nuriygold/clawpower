const GITHUB_RAW_URL =
  'https://raw.githubusercontent.com/nuriygold/clawpower/main/data/task-pool.md';

export interface TaskPoolItem {
  domain: string;
  task: string;
  status: string;
  priority: string;
  notes: string;
}

export async function fetchTaskPoolFromGitHub(): Promise<TaskPoolItem[]> {
  const res = await fetch(GITHUB_RAW_URL, { cache: 'no-store' });
  if (!res.ok) throw new Error(`GitHub fetch failed: ${res.status}`);
  const text = await res.text();
  return parseTaskPoolMarkdown(text);
}

function parseTaskPoolMarkdown(text: string): TaskPoolItem[] {
  const lines = text.split('\n').filter((l) => l.trim().startsWith('|'));
  // Skip header row and separator row (first two pipe-lines)
  const dataLines = lines.slice(2);

  return dataLines
    .map((line) => {
      const cols = line
        .split('|')
        .map((c) => c.trim())
        .filter(Boolean);
      if (cols.length < 5) return null;
      return {
        domain: cols[0].replace(/\*\*/g, '').trim(),
        task: cols[1].trim(),
        status: cols[2].trim(),
        priority: cols[3].trim(),
        notes: cols[4].replace(/`/g, '').trim(),
      };
    })
    .filter(Boolean) as TaskPoolItem[];
}
