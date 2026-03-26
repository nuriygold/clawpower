# OpenClaw Standard Operating Procedure (SOP) – Job, Script & File Placement

**Purpose:**
Guide for new operators and developers on where each job, config, script, and log should live in OpenClaw, and how the system processes each by file location/type.

---

## 1. Scheduled & Recurring Jobs
- **Definition:** Any automation (e.g., daily check-in, outbox, heartbeat) that runs on a repeating schedule.
- **Canonical Location:** `jobs.json` in the main OpenClaw workspace (`/Users/claw/.openclaw/workspace/jobs.json` or equivalent visible workspace).
- **System Response:** This file is loaded by the gateway/job runner; only jobs here will persist and run automatically at their scheduled time. Editing jobs.json is REQUIRED for system-side persistence.

## 2. Ad-Hoc or One-Off Scripts
- **Definition:** Scripts or jobs run manually or just once, not on a recurring schedule.
- **Location:** `scripts/` directory in the workspace.
- **System Response:** NOT picked up by the job scheduler. Can be executed manually or as part of manual workflows, API triggers, or tests. Will not persist across system restarts or be fired by time.

## 3. Logs & Proof Output
- **Definition:** All system, job, error, or sync logs.
- **Location:** `logs/` in the workspace (e.g., `email-triage.log`, `config-sync.log`).
- **System Response:** Must be written to disk for every significant job or automation run. Used for audit, error tracing, and compliance proof.

## 4. Secrets, Tokens, Credentials
- **Definition:** SMTP/IMAP/api keys/tokens, login details, confidential tokens.
- **Location:** `~/.openclaw/secrets.json` (never committed to git or logs).
- **System Response:** Secrets ONLY read from this file at job runtime. Never commit or expose secrets elsewhere.

## 5. Audit Memory/Proof Logs
- **Definition:** Persistent memory and operational timeline logs.
- **Location:** `memory/YYYY-MM-DD.md` (by date), plus `/adrian-executive-log/log.txt` for exec timelines.
- **System Response:** Must be updated by every automation at every meaningful run. Audit chains and post-mortems pull directly from these logs.

## 6. Custom Skills, Agent Code, and Non-Core Scripts
- **Definition:** Custom code, new skills, subagent scripting logic.
- **Location:** `skills/`, `agents/`, or `scripts/` in the workspace. Prefer explicit subfolders for agent-specific or integration-specific code.
- **System Response:** May be invoked by jobs in jobs.json, by other scripts, or directly via system API calls. Not scheduled unless linked in jobs.json or external system trigger.

## 7. Comms Logic (Telegram, Email, etc.)
- **Definition:** All outbound comms logic, including Telegram/email jobs, must proof-log every trigger and send (success/fail) in logs/.
- **Location:** Config within jobs.json/skills/scripts. Outbound actions logged, not just returning UI output.

## 8. Cron/Job Runner Internal Logic
- **Definition:** Gateway/jobs runner config, time-based or recurrence system state.
- **Location:** jobs.json, plus logs/ proof output. NEVER in ad-hoc scripts only.
- **System Response:** Only jobs in jobs.json are guaranteed scheduled and persisted.

## General Environment Rules
- Only jobs.json = persistent, reboot-resilient system schedule.
- `/logs/` = all audit, error, schedule proof.
- `/scripts/` = ad-hoc and test scripts only (execute manual or by one-off API event).
- `/skills/`, `/agents/` = custom extensibility, invoked by linked jobs or calls.
- `/memory/` & `/adrian-executive-log/` = operational timeline, always updated by jobs.
- `secrets.json` = ALL creds, tokens, secrets.
- Never make destructive changes, rotate logs, or change scheduling/jobs.json without explicit approval and proof-logging.

**If not in jobs.json, a job will NOT persist or be managed by the scheduler. If not proof-logged, an event is considered untrackable/out of compliance.**

---

## Sync Safety Protocol (HARD RULE — NO EXCEPTIONS)

**NEVER DELETE FILES DURING ANY SYNC OPERATION.**

- If a file would be removed (rsync, git checkout, triplet sync, workspace reconciliation), instead:
  1. Move it to a `_deleted/` subfolder inside the folder where it currently lives (e.g., `scripts/` → `scripts/_deleted/`)
  2. Preserve original filename and relative path inside `_deleted/`
  3. Log the move to `logs/sync-deletions.log` with timestamp + original path
- `_deleted/` folders are **EXCLUDED** from all sync operations (rsync rules, .gitignore, triplet sync). They never propagate to the other side.
- This applies to: sync_workspaces.sh, any rsync commands, git operations, Cowork file writes, manual reconciliation — everything.
- Rudolph must explicitly approve any permanent deletion after reviewing `_deleted/` contents.

---

# OpenClaw Checkpoint Protocol (run_checkpoint.sh)

> **MANDATORY BOOTSTRAP — ANY AGENT OR COWORK SESSION EXECUTING A CHECKPOINT MUST READ THIS SECTION IN FULL BEFORE TAKING ANY ACTION.**
> Failure to read = SOP violation. Not reading it is the root cause of every incomplete checkpoint to date.

**Step 0 — Triplet Sync (Phase 1)**
- sync_workspaces.sh runs first: bidirectional rsync between hidden ~/.openclaw/ and canonical ~/openclaw/workspace/scripts/
- Both sides current before checkpoint continues.

**Step 1 — Email Fetch**
- Python imaplib (not himalaya) connects to imap.zoho.com:993
- Pulls last 20 emails, decodes, flags risky/blocked/finance items
- Writes data/email-triage.json using credentials from canonical secrets.json

**Step 2 — Checkpoint Snapshot**
- Reads most recent checkpoint-*.md from `memory/` (NOT adrian-executive-log/ — that path is deprecated)
- Wraps as checkpoint.json with timestamp and source filename
- **Cowork/Dispatch sessions: WRITE the dated checkpoint file `memory/YYYY-MM-DD.md` first (this is the actual memory artifact, not a summary)**

**Step 3 — Push to clawpower**
- Uses curl + API token from secrets.json to push email-triage.json and checkpoint.json to nuriygold/clawpower

**Step 4 — Triplet Sync (Phase 2 / Git Commit)**
- Git repo lives in the VISIBLE workspace: `~/openclaw/workspace` (NOT `~/.openclaw/workspace` — that dir is not a git repo)
- Command: `cd ~/openclaw/workspace && git add -A && git commit -m "checkpoint YYYY-MM-DD — <summary>" && git push`
- Captures all scripts, memory, agents, not just exec-log
- From sandbox/Cowork: push memory/ files to clawpower via GitHub API (Chrome helper); git commit must run from Mac Terminal

**Step 4.5 — Cowork Auto-Memory Update**
- Update `/Users/claw/claude/.auto-memory/` files with any new context from this session
- At minimum: update `user_rudolph_profile.md` with completed/pending items
- Update or create project/feedback entries as needed
- Update `MEMORY.md` index to reflect any new or changed files
- This step is REQUIRED on every checkpoint — it bridges operational memory (OpenClaw) to conversational memory (Cowork)

**Step 5 — Telegram Notify**
- Runs telegram_notify.sh from canonical path, sends a summary of run to ops ID/card

**Notes:**
- All paths point canonical (`~/openclaw/workspace/scripts/`)
- Git repo is in `~/openclaw/workspace` (visible) — `~/.openclaw/workspace` is NOT a git repo
- git/gh CLIs are NOT required for clawpower push (curl/GitHub API used) — but ARE required for openclaw-workspace commit (Step 4)
- All actions proof-log to logs/memory
- sync_workspaces.sh MUST run first (pre-checkpoint) and again for capture before git commit
- Telegram/daily comms must log result (success/fail) at every step
- `_deleted/` folders are NEVER synced — excluded from rsync, .gitignore, and triplet propagation

---

**This SOP is now versionable and official for all new hires, system agents, or compliance checklists.**
