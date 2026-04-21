# Claude Automations

Personal collection of reusable Claude Code skills, prompts, hooks, and agents.

## Structure

- `skills/` — Claude Code skills (invokable via the Skill tool)
- `agents/` — Custom subagent definitions (spawned via the Agent tool)
- `prompts/` — Reusable prompt templates
- `hooks/` — Claude Code hook scripts

## Skills

| Skill | Description |
|-------|-------------|
| `windows-performance-tuning` | Diagnose and optimize Windows PC performance |
| `obsidian-memory` | Save session notes to Obsidian vault at the end of every Claude interaction |
| `vsol-cowork-provision` | Step-by-step guide to provision a new Sunny Cowork customer onto Claude Code CLI |

## Setup

Skills are symlinked to `~/.claude/skills/` for global access in any project.
