## Skills
A skill is a set of local instructions to follow that is stored in a `SKILL.md` file.

### Available skills
- shadcn: Manages shadcn components and projects — adding, searching, fixing, debugging, styling, and composing UI. (file: /home/drpepper/Desktop/CodexProjects/kjv-only/.agents/skills/shadcn/SKILL.md)

### How to use skills
- Discovery: The list above is the skills available in this repo/session (name + description + file path).
- Trigger rules: If the user names a skill (with `$SkillName` or plain text) OR the task clearly matches a skill's description, use that skill for that turn.
- Missing/blocked: If a named skill isn't in the list or the path can't be read, state that briefly and continue with the best fallback.
- How to use a skill:
  1) Open its `SKILL.md` and read only what is needed.
  2) Resolve relative paths from the skill directory first.
  3) Load only specific referenced files needed for the current task.
  4) If scripts/assets/templates exist, prefer reusing them over recreating from scratch.
- Coordination:
  - If multiple skills apply, use the minimal set and state order.
  - If skipping an obvious skill, briefly explain why.
- Context hygiene:
  - Keep context small; avoid bulk-loading unrelated docs.
  - Prefer direct references from `SKILL.md` over deep recursive exploration.
- Safety/fallback:
  - If a skill is incomplete or unclear, state the issue and continue with the best practical approach.

## Command Approval
- If a command needed to complete the task requires approval or fails due to sandbox restrictions, request escalation immediately rather than silently avoiding the command or switching to a weaker fallback path.
