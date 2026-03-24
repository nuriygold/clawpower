

## Add Local Fallback for Task Pool Data

### Problem
The GitHub raw URL (`https://raw.githubusercontent.com/nuriygold/clawpower/main/data/task-pool.md`) returns 404 because the file hasn't been pushed to the repo yet. The Task Pool panel shows skeleton loaders indefinitely.

### Solution
Embed the task pool data from the local `data/task-pool.md` as a fallback. If the GitHub fetch fails, use the embedded data so the panel always has something to display.

### Changes

**1. `src/lib/taskpool-github.ts`** -- Add fallback logic
- Import the raw markdown content from `data/task-pool.md` using Vite's `?raw` import
- In `fetchTaskPoolFromGitHub()`, wrap the fetch in a try/catch. If it fails (404 or network error), parse and return the local embedded data instead
- This means: GitHub works = live data; GitHub down = last-known local data

**2. No other files change** -- the TaskPool component already handles the data correctly once `useQuery` resolves.

### Technical Detail
```
import localTaskPoolMd from '../../../data/task-pool.md?raw';

export async function fetchTaskPoolFromGitHub() {
  try {
    const res = await fetch(GITHUB_RAW_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error(`GitHub fetch failed: ${res.status}`);
    const text = await res.text();
    return parseTaskPoolMarkdown(text);
  } catch {
    // Fallback to embedded local data
    return parseTaskPoolMarkdown(localTaskPoolMd);
  }
}
```

This ensures the Task Pool panel works immediately with the 17 tasks already defined locally, and will seamlessly switch to live GitHub data once you push to the repo.

