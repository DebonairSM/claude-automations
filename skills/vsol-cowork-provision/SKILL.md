---
name: vsol-cowork-provision
description: Step-by-step provisioning guide for onboarding a new Sunny Cowork customer onto Claude Code CLI and Claude Desktop. Use when a vsol team member needs to set up Claude Code on a new customer machine.
---

# Sunny Cowork — New Customer Provisioning

Walk the customer through each phase in order. All commands are PowerShell 7+ unless noted.

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

## Phase 2 — Prerequisite: Git for Windows

Claude Code CLI on Windows requires Git for Windows. Check first:

```powershell
git --version
```

If the command fails or Git is not installed:

1. Download Git for Windows from https://git-scm.com/downloads/win
2. Run the installer with default options
3. Restart PowerShell 7 after installation and confirm `git --version` works before continuing

---

## Phase 3 — Prerequisite: Node.js

Claude Code CLI requires Node.js. Check first:

```powershell
node --version
npm --version
```

If either command fails, install Node.js using winget:

```powershell
winget install OpenJS.NodeJS.LTS
```

After installation, **close and reopen PowerShell 7**, then confirm both commands return version numbers before continuing.

---

## Phase 4 — Install Claude Code CLI

Open PowerShell 7 and run:

```powershell
irm https://claude.ai/install.ps1 | iex
```

Wait for the installer to complete. It will download and install the `claude` CLI and configure it automatically.

---

## Phase 5 — Fix PATH (if `claude` command is not found)

After installation, test that the CLI is reachable:

```powershell
claude --version
```

If you get `claude is not recognized` or a similar error, the install directory is not in the system PATH. Fix it with:

```powershell
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";$env:USERPROFILE\.local\bin", "User")
```

Then **close and reopen PowerShell 7** and run `claude --version` again to confirm it works.

---

## Phase 6 — Set Up Projects Folder & Shared Secrets

### 6a — Find the drive with the most free space

```powershell
Get-PSDrive -PSProvider FileSystem | Sort-Object Free -Descending | Select-Object Name, @{n="FreeGB";e={[math]::Round($_.Free/1GB,1)}}
```

Ask the customer which drive they want to use. Note the chosen drive letter — replace `<DRIVE>` in all commands below.

### 6b — Create the folder structure

```powershell
New-Item -ItemType Directory -Force -Path "<DRIVE>:\projects\.secrets"
```

### 6c — Create the `.env` file

```powershell
New-Item -ItemType File -Path "<DRIVE>:\projects\.secrets\.env" -Force
notepad "<DRIVE>:\projects\.secrets\.env"
```

File format (one `KEY=value` per line, no spaces around `=`):

```
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
```

Save and close Notepad.

### 6d — Register the secrets path as a user environment variable

```powershell
[Environment]::SetEnvironmentVariable("SECRETS_DIR", "<DRIVE>:\projects\.secrets", "User")
```

### 6e — Set projects folder as the PowerShell 7 default starting directory

```powershell
if (!(Test-Path $PROFILE)) { New-Item -ItemType File -Force -Path $PROFILE }
Add-Content $PROFILE "`nSet-Location '<DRIVE>:\projects'"
```

Open a new PowerShell 7 window and confirm it starts in `<DRIVE>:\projects`.

---

## Phase 7 — Clone the Skills Repo & Wire Up Global Links

This gives the customer the same skills, agents, and hooks that vsol uses.

> **Requires Developer Mode or running PowerShell 7 as Administrator** to create symlinks on Windows.
> Enable Developer Mode: Settings → System → For developers → Developer Mode → On.

### 7a — Clone the repo

```powershell
git clone https://github.com/DebonairSM/claude-automations.git "<DRIVE>:\projects\claude-automations"
```

### 7b — Create the global Claude folders

```powershell
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.claude\skills"
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.claude\agents"
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.claude\hooks"
```

### 7c — Symlink skills

```powershell
Get-ChildItem "<DRIVE>:\projects\claude-automations\skills" | ForEach-Object {
    New-Item -ItemType SymbolicLink -Force `
        -Path "$env:USERPROFILE\.claude\skills\$($_.Name)" `
        -Target $_.FullName
}
```

### 7d — Symlink agents

```powershell
Get-ChildItem "<DRIVE>:\projects\claude-automations\agents" | ForEach-Object {
    New-Item -ItemType SymbolicLink -Force `
        -Path "$env:USERPROFILE\.claude\agents\$($_.Name)" `
        -Target $_.FullName
}
```

### 7e — Verify links

```powershell
ls "$env:USERPROFILE\.claude\skills"
ls "$env:USERPROFILE\.claude\agents"
```

Each entry should show a symlink (`@`) pointing back to the cloned repo. Claude Code will now automatically find all skills and agents in any session on this machine.

---

## Phase 8 — Log In to Claude Code

Start Claude Code:

```powershell
claude
```

On first launch you will be prompted to log in. Follow the on-screen instructions. The customer will need one of:

- A **Claude Pro, Max, Team, or Enterprise** subscription at claude.com (recommended)
- A **Claude Console** account at console.anthropic.com (API / pay-as-you-go)

Once authenticated, credentials are stored locally — the customer will not need to log in again on this machine.

---

## Phase 9 — Install Claude Desktop

Install Claude Desktop using winget:

```powershell
winget install Anthropic.Claude
```

After installation, launch Claude Desktop from the Start menu and log in with the same account used in Phase 8. Claude Desktop provides a full GUI experience alongside the CLI.

---

## Phase 10 — Verify the Install

Run a quick sanity check:

```powershell
claude -p "Confirm you are working by responding with: Claude Code is ready."
```

Claude should respond with the confirmation message. If it does, the setup is complete.

---

## Phase 11 — Orientation Tips (share with the customer)

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
- Claude Desktop is available in the Start menu for a full GUI experience
- To update skills and agents: `git pull` inside `<DRIVE>:\projects\claude-automations`

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `claude` not recognized after install | Run the PATH fix in Phase 5 and reopen PowerShell 7 |
| Installer fails | Confirm Git (Phase 2) and Node.js (Phase 3) are installed |
| `node` not recognized after install | Close and reopen PowerShell 7 |
| `winget` not found | Update the App Installer from the Microsoft Store |
| PowerShell still shows version 5 | Open "pwsh" or "PowerShell 7" from Start menu, not "Windows PowerShell" |
| Symlink creation fails | Enable Developer Mode or run PowerShell 7 as Administrator |
| Skills not found in Claude Code | Confirm symlinks exist in `~/.claude/skills/` (Phase 7e) |
| Login loop / auth error | Check the customer has an active Claude subscription |
| `The token '&&' is not a valid statement separator` | You are in old PowerShell 5 — switch to PowerShell 7 |
| `'irm' is not recognized` | You are in CMD, not PowerShell — open PowerShell 7 and retry |
