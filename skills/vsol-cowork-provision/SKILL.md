---
name: vsol-cowork-provision
description: Step-by-step provisioning guide for onboarding a new Sunny Cowork customer onto Claude Code CLI and Claude Desktop. Use when a vsol team member needs to set up Claude Code on a new customer machine.
---

# Sunny Cowork — New Customer Provisioning

Walk the customer through each phase in order. All commands are PowerShell 7+ unless noted.

---

## Phase 0 — VSol Team Member Setup (Before You Begin)

**Check whether the vsol MCP server is available before resorting to the clone approach.**

### Option A — Use the vsol MCP server (preferred, no cleanup needed)

Add this to your personal `~/.claude/settings.json` once — it works in every session on every machine:

```json
{
  "mcpServers": {
    "vsol-skills": {
      "type": "http",
      "url": "https://mcp-server-jet.vercel.app/api/mcp",
      "headers": { "x-api-key": "<MCP_API_KEY>" }
    }
  }
}
```

Get the `MCP_API_KEY` from the vsol team. If this is configured, skip to Phase 1. No clone, no cleanup.

### Option B — Clone to admin folder (fallback if MCP server is unavailable)

**This copy must be deleted before you leave the customer's machine.**

Find the right drive:

```powershell
Get-PSDrive -PSProvider FileSystem | Sort-Object Free -Descending | Select-Object Name, @{n="FreeGB";e={[math]::Round($_.Free/1GB,1)}}
```

Use whichever of C: or D: has the most free space. Replace `<ADMIN_DRIVE>` below with your chosen letter.

```powershell
New-Item -ItemType Directory -Force -Path "<ADMIN_DRIVE>:\admin\git"
git clone https://github.com/DebonairSM/claude-automations.git "<ADMIN_DRIVE>:\admin\git\claude-automations"
cd "<ADMIN_DRIVE>:\admin\git\claude-automations"
claude
```

The `vsol-cowork-provision` and `cowork-provisioner` skills are now available for this session.

> **If you used Option B:** `<ADMIN_DRIVE>:\admin\git` must be deleted before you end the session. See the Cleanup Checklist at the end of this document.

---

## Phase 1 — Upgrade PowerShell

Check the current version:

```powershell
$PSVersionTable.PSVersion
```

If the major version is below 7, install PowerShell 7+:

```powershell
winget install Microsoft.PowerShell
```

**Close the current window and reopen using "PowerShell 7" or "pwsh" from the Start menu.** Confirm the major version is 7 or higher before continuing. All remaining phases must run in PowerShell 7+.

---

## Phase 2 — Install Core Software

Install all core tools in sequence. Each command may open a UAC prompt — accept it. After all installs complete, close and reopen PowerShell 7 once to refresh the PATH.

### 2a — Git for Windows

```powershell
winget install Git.Git --accept-source-agreements --accept-package-agreements
```

### 2b — GitHub CLI

```powershell
winget install GitHub.cli --accept-source-agreements --accept-package-agreements
```

### 2c — Node.js (LTS)

```powershell
winget install OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements
```

### 2d — Visual Studio Code

```powershell
winget install Microsoft.VisualStudioCode --accept-source-agreements --accept-package-agreements
```

### 2e — Cline (VS Code AI extension)

Requires VS Code to be installed and the `code` command to be in PATH. Close and reopen PowerShell 7 after the VS Code install above, then run:

```powershell
code --install-extension saoudrizwan.claude-dev
```

### 2f — Claude Code CLI

```powershell
irm https://claude.ai/install.ps1 | iex
```

### 2g — Claude Desktop

```powershell
winget install Anthropic.Claude --accept-source-agreements --accept-package-agreements
```

### 2h — OpenClaw

```powershell
winget install <OpenClaw.WingetID> --accept-source-agreements --accept-package-agreements
```

> Confirm the exact winget package ID with the vsol team before running this step.

### 2i — Verify installs

After closing and reopening PowerShell 7:

```powershell
git --version
gh --version
node --version
npm --version
code --version
claude --version
```

All commands should return version numbers. If `claude` is not found, continue to Phase 3.

---

## Phase 3 — Fix PATH (if `claude` is not found)

```powershell
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";$env:USERPROFILE\.local\bin", "User")
```

Close and reopen PowerShell 7, then confirm `claude --version` works before continuing.

---

## Phase 4 — Set Up Projects Folder & Secrets

### 4a — Find the drive with the most free space

```powershell
Get-PSDrive -PSProvider FileSystem | Sort-Object Free -Descending | Select-Object Name, @{n="FreeGB";e={[math]::Round($_.Free/1GB,1)}}
```

Ask the customer which drive they want to use. Note the chosen drive letter — replace `<DRIVE>` in all commands below.

### 4b — Create the projects folder

```powershell
New-Item -ItemType Directory -Force -Path "<DRIVE>:\projects"
```

### 4c — Store customer secrets

Run the `customer-secrets-setup` skill. It walks through:

- Adding API keys (ANTHROPIC_API_KEY, OPENAI_API_KEY, etc.) to `~/.claude/settings.json` `env` so they're available inside every Claude Code session.
- Storing cross-tool secrets (e.g. GitHub PATs used by PowerShell scripts or VS Code tasks) in Windows Credential Manager where they're DPAPI-encrypted.

Do not use `setx` or a loose `.env` file for customer secrets — both are explicitly avoided in favor of the two mechanisms above.

### 4d — Set projects folder as the PowerShell 7 default starting directory

```powershell
if (!(Test-Path $PROFILE)) { New-Item -ItemType File -Force -Path $PROFILE }
Add-Content $PROFILE "`nSet-Location '<DRIVE>:\projects'"
```

Open a new PowerShell 7 window and confirm it starts in `<DRIVE>:\projects`.

---

## Phase 5 — Clone the Skills Repo & Wire Up Global Links

> **Requires Developer Mode or running PowerShell 7 as Administrator** to create symlinks on Windows.
> Enable Developer Mode: Settings → System → For developers → Developer Mode → On.

### 5a — Clone the repo

```powershell
git clone https://github.com/DebonairSM/claude-automations.git "<DRIVE>:\projects\claude-automations"
```

### 5b — Create global Claude folders

```powershell
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.claude\skills"
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.claude\agents"
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.claude\hooks"
```

### 5c — Symlink skills and agents

```powershell
Get-ChildItem "<DRIVE>:\projects\claude-automations\skills" | ForEach-Object {
    New-Item -ItemType SymbolicLink -Force `
        -Path "$env:USERPROFILE\.claude\skills\$($_.Name)" `
        -Target $_.FullName
}
Get-ChildItem "<DRIVE>:\projects\claude-automations\agents" | ForEach-Object {
    New-Item -ItemType SymbolicLink -Force `
        -Path "$env:USERPROFILE\.claude\agents\$($_.Name)" `
        -Target $_.FullName
}
```

### 5d — Verify links

```powershell
ls "$env:USERPROFILE\.claude\skills"
ls "$env:USERPROFILE\.claude\agents"
```

Each entry should show a symlink pointing back to the cloned repo.

---

## Phase 6 — Log In to Claude Code

```powershell
claude
```

On first launch you will be prompted to log in. Follow the on-screen instructions. The customer will need one of:

- A **Claude Pro, Max, Team, or Enterprise** subscription at claude.com (recommended)
- A **Claude Console** account at console.anthropic.com (API / pay-as-you-go)

Once authenticated, credentials are stored locally — the customer will not need to log in again on this machine.

Log in to Claude Desktop from the Start menu using the same account.

Log in to the GitHub CLI:

```powershell
gh auth login
```

---

## Phase 7 — Use-Case Add-Ons

Ask the customer which use cases apply. Install only the relevant sections.

---

### Use Case: WhatsApp Bot

Install dependencies for a Node.js-based WhatsApp bot (Baileys):

```powershell
npm install -g typescript ts-node
```

Inside the customer's bot project folder:

```powershell
npm install @whiskeysockets/baileys qrcode-terminal
```

If the bot needs a public webhook (e.g. for receiving messages from external services), install ngrok:

```powershell
winget install Ngrok.Ngrok --accept-source-agreements --accept-package-agreements
```

Store the ngrok auth token via the `customer-secrets-setup` skill (adds `NGROK_AUTHTOKEN` to the `~/.claude/settings.json` `env` block so it's available in every Claude Code session).

---

### Use Case: Obsidian

```powershell
winget install Obsidian.Obsidian --accept-source-agreements --accept-package-agreements
```

After installation, launch Obsidian and create or open a vault. Recommended vault location: `<DRIVE>:\projects\obsidian-vault`.

If the customer uses the `obsidian-memory` skill, set the vault path as an environment variable:

```powershell
[Environment]::SetEnvironmentVariable("OBSIDIAN_VAULT", "<DRIVE>:\projects\obsidian-vault", "User")
```

---

## Phase 8 — Verify the Full Install

```powershell
claude -p "Confirm you are working by responding with: Claude Code is ready."
```

Claude should respond with the confirmation message. If it does, the setup is complete.

---

## Phase 9 — Orientation Tips (share with the customer)

| Action | Command |
|--------|---------|
| Start Claude Code | `claude` |
| Run a quick one-off task | `claude "describe this project"` |
| Continue last conversation | `claude -c` |
| See all commands | `/help` |
| Clear conversation | `/clear` |
| Exit | `exit` or Ctrl+D |

- Claude reads project files automatically — no need to copy-paste code
- Always confirms before editing files
- Type `/` inside a session to see available skills and agents
- Claude Desktop and Cline (in VS Code) are available as GUI alternatives
- To update skills and agents: `git pull` inside `<DRIVE>:\projects\claude-automations`

---

## VSol Team Member Cleanup Checklist

**Complete this before ending the session. Do not leave the customer's machine without confirming all items.**

```powershell
# Confirm the admin folder exists, then delete it
Test-Path "<ADMIN_DRIVE>:\admin\git"
Remove-Item -Recurse -Force "<ADMIN_DRIVE>:\admin\git"
Test-Path "<ADMIN_DRIVE>:\admin\git"   # must return False
```

- [ ] `<ADMIN_DRIVE>:\admin\git` deleted and confirmed gone
- [ ] No vsol credentials or API keys left in environment variables or files
- [ ] Claude Code session closed (the customer's own session is fine)

> **Why this matters:** The `claude-automations` repo contains vsol's proprietary skills and agent definitions. It must not remain on customer machines between sessions.

> **Preferred:** Use the MCP server at `https://mcp-server-jet.vercel.app/api/mcp` instead of cloning. If Option A in Phase 0 is configured, this cleanup step is never needed.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `claude` not recognized after install | Run the PATH fix in Phase 3 and reopen PowerShell 7 |
| `code` not recognized after VS Code install | Close and reopen PowerShell 7; VS Code adds itself to PATH on install |
| `gh` not recognized | Close and reopen PowerShell 7 after GitHub CLI install |
| Installer fails | Confirm Git (2a) and Node.js (2c) are installed |
| `node` not recognized after install | Close and reopen PowerShell 7 |
| `winget` not found | Update the App Installer from the Microsoft Store |
| PowerShell still shows version 5 | Open "pwsh" or "PowerShell 7" from Start menu, not "Windows PowerShell" |
| Symlink creation fails | Enable Developer Mode or run PowerShell 7 as Administrator |
| Skills not found in Claude Code | Confirm symlinks exist in `~/.claude/skills/` (Phase 5d) |
| Login loop / auth error | Check the customer has an active Claude subscription |
| `The token '&&' is not a valid statement separator` | You are in old PowerShell 5 — switch to PowerShell 7 |
| `'irm' is not recognized` | You are in CMD, not PowerShell — open PowerShell 7 and retry |
