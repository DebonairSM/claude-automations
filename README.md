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
| `obsidian-configure` | Interview a business owner and configure their Obsidian vault to match their workflow |
| `customer-secrets-setup` | Store customer API keys in Claude Code's `settings.json` `env` block and Windows Credential Manager (no `setx`, no loose `.env`) |

## Agents

| Agent | Description |
|-------|-------------|
| `cowork-provisioner` | Actively provisions a new Sunny Cowork customer machine end-to-end |

## MCP Server

`mcp-server/` is a Next.js app that serves skills and agents over the MCP protocol. Deploy it to Vercel and VSol team members can connect without cloning the repo.

### Deploy to Vercel

1. Import this repo in Vercel → set **Root Directory** to `mcp-server/`
2. Add environment variables in Vercel project settings:
   - `MCP_API_KEY` — a long random string (shared secret for team members)
   - `GITHUB_TOKEN` — a GitHub PAT with `repo:read` scope (required if repo is private)
3. Deploy. The MCP endpoint will be at `https://mcp.vsol.software`

### Connect Claude Code to the server

Add to `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "vsol-skills": {
      "type": "http",
      "url": "https://mcp.vsol.software",
      "headers": {
        "x-api-key": "<MCP_API_KEY>"
      }
    }
  }
}
```

### Available MCP tools

| Tool | Description |
|------|-------------|
| `list_skills` | List all skills with name and description |
| `get_skill` | Get the full SKILL.md content for a named skill |
| `list_agents` | List all agents with name and description |
| `get_agent` | Get the full content of a named agent |

### Local setup

Skills are symlinked to `~/.claude/skills/` for global access in any project.
Agents are symlinked to `~/.claude/agents/` for global access.
