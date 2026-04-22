# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Purpose

This repo is a personal library of reusable Claude Code skills, agents, hooks, and prompt templates. Skills are symlinked to `~/.claude/skills/` so they're available globally in any project.

## Structure

- `skills/<skill-name>/SKILL.md` — each skill lives in its own folder with a single `SKILL.md` file
- `agents/<agent-name>.md` — custom subagent definitions (spawned via the Agent tool)
- `prompts/` — reusable prompt templates (not yet populated)
- `hooks/` — Claude Code hook scripts (not yet populated)

## Skill Format

Every skill is a Markdown file at `skills/<name>/SKILL.md` with YAML frontmatter:

```markdown
---
name: skill-name
description: Trigger condition description used by Claude to decide when to invoke this skill.
---

# Skill Title
...skill instructions...
```

The `description` field is critical — it's the text Claude uses to decide when to auto-invoke the skill. Write it as a precise trigger condition, not a general summary.

## Agent Format

Agents are Markdown files at `agents/<name>.md` with YAML frontmatter:

```markdown
---
name: agent-name
description: When to spawn this agent (used by the Agent tool).
model: claude-sonnet-4-6
tools: Bash, Read, Write, Edit
---

You are the ... agent. Your job is to ...
```

## Adding a New Skill

1. Create `skills/<skill-name>/SKILL.md` with the frontmatter and skill body.
2. Symlink it globally (requires Developer Mode or PowerShell 7 as Administrator):
   ```powershell
   New-Item -ItemType SymbolicLink -Force `
       -Path "$env:USERPROFILE\.claude\skills\<skill-name>" `
       -Target "<absolute-path-to-skills\<skill-name>>"
   ```
3. Verify the link: `ls "$env:USERPROFILE\.claude\skills"` — each entry should show a symlink target.
4. Add a row to the Skills table in `README.md`.

To bulk-symlink all skills and agents after cloning this repo:
```powershell
Get-ChildItem "skills" | ForEach-Object {
    New-Item -ItemType SymbolicLink -Force `
        -Path "$env:USERPROFILE\.claude\skills\$($_.Name)" -Target $_.FullName
}
Get-ChildItem "agents" | ForEach-Object {
    New-Item -ItemType SymbolicLink -Force `
        -Path "$env:USERPROFILE\.claude\agents\$($_.Name)" -Target $_.FullName
}
```

## Skill Writing Conventions

- Structure skills as phases or steps with clear headers.
- Include copy-paste–ready commands (PowerShell, Bash, etc.) rather than prose descriptions.
- Separate non-admin and admin-required actions — users may not always have elevation.
- End with a verification step so the user can confirm the fix worked.
