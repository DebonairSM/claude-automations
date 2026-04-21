---
name: vsol-cowork-provision
description: Step-by-step provisioning guide for onboarding a new Sunny Cowork customer onto Claude Code CLI. Use when a vsol team member needs to set up Claude Code on a new customer machine.
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

## Phase 2 — Install Claude Code CLI

Open PowerShell and run:

```powershell
irm https://claude.ai/install.ps1 | iex
```

Wait for the installer to complete. It will download and install the `claude` CLI and configure it automatically.

---

## Phase 3 — Fix PATH (if `claude` command is not found)

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

## Phase 4 — Log In

Start Claude Code:

```powershell
claude
```

On first launch you will be prompted to log in. Follow the on-screen instructions. The customer will need one of:

- A **Claude Pro, Max, Team, or Enterprise** subscription at claude.com (recommended)
- A **Claude Console** account at console.anthropic.com (API / pay-as-you-go)

Once authenticated, credentials are stored locally — the customer will not need to log in again on this machine.

---

## Phase 5 — Verify the Install

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

## Phase 6 — Orientation Tips (share with the customer)

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

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `claude` not recognized after install | Run the PATH fix in Phase 3 and reopen PowerShell |
| Installer fails | Confirm Git for Windows is installed (Phase 1) |
| Login loop / auth error | Check the customer has an active Claude subscription |
| `The token '&&' is not a valid statement separator` | You are in PowerShell, not CMD — use the PowerShell install command |
| `'irm' is not recognized` | You are in CMD, not PowerShell — open PowerShell and retry |
