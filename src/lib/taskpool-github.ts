import localTaskPoolMd from '../../data/task-pool.md?raw';

const GITHUB_RAW_URL =
  'https://raw.githubusercontent.com/nuriygold/clawpower/main/data/task-pool.md';

export interface TaskPoolItem {
  domain: string;
  task: string;
  status: string;
  priority: string;
  notes: string;
}

export interface WellstarStep {
  step: string;
  done: boolean;
}

export interface TaskPoolResult {
  tasks: TaskPoolItem[];
  progressMap: Record<string, WellstarStep[]>;
}

export async function fetchTaskPoolFromGitHub(): Promise<TaskPoolResult> {
  try {
    const res = await fetch(GITHUB_RAW_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error(`GitHub fetch failed: ${res.status}`);
    const text = await res.text();
    return parseTaskPoolMarkdown(text);
  } catch {
    return parseTaskPoolMarkdown(localTaskPoolMd);
  }
}

function parseTaskPoolMarkdown(text: string): TaskPoolResult {
  // Split at the Wellstar Dashboard Progress section
  const progressSplit = text.split(/^## Wellstar Dashboard Progress/m);
  const tableSection = progressSplit[0];
  const progressSection = progressSplit[1] || '';

  // Parse table
  const lines = tableSection.split('\n').filter((l) => l.trim().startsWith('|'));
  const dataLines = lines.slice(2);

  const tasks = dataLines
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

  // Parse progress checklists
  const progressMap: Record<string, WellstarStep[]> = {};
  const headingRegex = /^### (.+)$/gm;
  let match;
  while ((match = headingRegex.exec(progressSection)) !== null) {
    const name = match[1].trim();
    const startIdx = match.index + match[0].length;
    const nextHeading = progressSection.indexOf('###', startIdx);
    const block = nextHeading === -1
      ? progressSection.slice(startIdx)
      : progressSection.slice(startIdx, nextHeading);

    const steps: WellstarStep[] = [];
    for (const line of block.split('\n')) {
      const checked = line.match(/^- \[x\] (.+)$/i);
      const unchecked = line.match(/^- \[ \] (.+)$/);
      if (checked) steps.push({ step: checked[1].trim(), done: true });
      else if (unchecked) steps.push({ step: unchecked[1].trim(), done: false });
    }
    if (steps.length > 0) {
      progressMap[name] = steps;
    }
  }

  return { tasks, progressMap };
}
