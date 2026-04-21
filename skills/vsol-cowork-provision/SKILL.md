---
name: vsol-cowork-provision
description: Step-by-step provisioning guide for onboarding a new Sunny Cowork customer onto Claude Code CLI and Claude Desktop. Use when a vsol team member needs to set up Claude Code on a new customer machine.
---

# Sunny Cowork — New Customer Provisioning

Walk the customer through each phase in order. All commands are PowerShell unless noted.

---

## Phase 1 — Prerequisite: Git for Windows

Claude Code CLI on Windows requires Git for Windows. Check first:

```powershell
git --version
```

If the command fails or Git is not installed:

1. Download Git for Windows from https://git-scm.com/downloads/win
2. Run the installer with default options
3. Restart PowerShell after installation and confirm `git --version` works before continuing

---

## Phase 2 — Prerequisite: Node.js

Claude Code CLI requires Node.js. Check first:

```powershell
node --version
npm --version
```

If either command fails, install Node.js using winget:

```powershell
winget install OpenJS.NodeJS.LTS
```

After installation, **close and reopen PowerShell**, then confirm both commands return version numbers before continuing.

---

## Phase 3 — Install Claude Code CLI

Open PowerShell and run:

```powershell
irm https://claude.ai/install.ps1 | iex
```

Wait for the installer to complete. It will download and install the `claude` CLI and configure it automatically.

---

## Phase 4 — Fix PATH (if `claude` command is not found)

After installation, test that the CLI is reachable:

```powershell
claude --version
```

If you get `claude is not recognized` or a similar error, the install directory is not in the system PATH. Fix it with:

```powershell
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";$env:USERPROFILE\.local\bin", "User")
```

Then **close and reopen PowerShell** and run `claude --version` again to confirm it works.

---

## Phase 5 — Set Up Projects Folder & Shared Secrets

### 5a — Find the drive with the most free space

```powershell
Get-PSDrive -PSProvider FileSystem | Sort-Object Free -Descending | Select-Object -First 1 Name, @{n="FreeGB";e={[math]::Round($_.Free/1GB,1)}}
```

Note the drive letter returned (e.g. `D`). Use it in the commands below — replace `D:` if your result differs.

### 5b — Create the folder structure

```powershell
New-Item -ItemType Directory -Force -Path "D:\projects\.secrets"
```

### 5c — Create the `.env` file

```powershell
New-Item -ItemType File -Path "D:\projects\.secrets\.env" -Force
```

Open it in Notepad to add secrets:

```powershell
notepad "D:\projects\.secrets\.env"
```

File format (one `KEY=value` per line, no spaces around `=`):

```
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
```

Save and close Notepad.

### 5d — Register the secrets path as a user environment variable

```powershell
[Environment]::SetEnvironmentVariable("SECRETS_DIR", "D:\projects\.secrets", "User")
```

Any script or tool can now reference `$env:SECRETS_DIR` instead of hardcoding the path. **Restart PowerShell** for the variable to take effect.

---

## Phase 6 — Log In to Claude Code

Start Claude Code:

```powershell
claude
```

On first launch you will be prompted to log in. Follow the on-screen instructions. The customer will need one of:

- A **Claude Pro, Max, Team, or Enterprise** subscription at claude.com (recommended)
- A **Claude Console** account at console.anthropic.com (API / pay-as-you-go)

Once authenticated, credentials are stored locally — the customer will not need to log in again on this machine.

---

## Phase 7 — Install Claude Desktop

Install Claude Desktop using winget:

```powershell
winget install Anthropic.Claude
```

After installation, launch Claude Desktop from the Start menu and log in with the same account used in Phase 6. Claude Desktop provides a full GUI experience alongside the CLI.

---

## Phase 8 — Verify the Install

Run a quick sanity check inside any project folder:

```powershell
cd C:\Users\<CustomerName>\Documents
claude
```

Then type:

```
what can Claude Code do?
```

Claude should respond with a summary of its capabilities. If it does, the setup is complete.

Exit with:

```
exit
```

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
- Type `/` inside a session to see available skills and commands
- Claude Desktop is available in the Start menu for a full GUI experience

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `claude` not recognized after install | Run the PATH fix in Phase 4 and reopen PowerShell |
| Installer fails | Confirm Git (Phase 1) and Node.js (Phase 2) are installed |
| `node` not recognized after install | Close and reopen PowerShell; winget updates PATH on new sessions |
| `winget` not found | Update the App Installer from the Microsoft Store |
| Login loop / auth error | Check the customer has an active Claude subscription |
| `The token '&&' is not a valid statement separator` | You are in PowerShell, not CMD — use the PowerShell install command |
| `'irm' is not recognized` | You are in CMD, not PowerShell — open PowerShell and retry |
