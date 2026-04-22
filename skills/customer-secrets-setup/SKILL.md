---
name: customer-secrets-setup
description: Provision API keys and other secrets for a Sunny Cowork customer using Claude Code's settings.json env block (primary) and Windows Credential Manager (for secrets that must be accessible outside Claude Code). Use during onboarding or whenever a customer needs to add, rotate, or remove a secret on their machine.
---

# Customer Secrets Setup

Two storage locations, chosen by who needs to read the secret:

| Secret needs to be visible to... | Store in |
|---|---|
| Only Claude Code sessions | `~/.claude/settings.json` → `env` block |
| Claude Code **and** other tools (VS Code tasks, PowerShell scripts, Cline, etc.) | Windows Credential Manager (DPAPI-encrypted) |

Do **not** use `setx` — it writes plaintext to the user registry and is inherited by every process the user launches.
Do **not** drop secrets into a loose `.env` file — nothing in this stack auto-loads it.

All commands assume PowerShell 7+.

---

## Phase 1 — Claude Code `settings.json` env block (primary)

Secrets in the `env` block of `~/.claude/settings.json` are set as environment variables for every Claude Code session. They are scoped to Claude Code — no other process on the machine sees them.

### 1a — Ensure the settings file exists

```powershell
$settingsPath = "$env:USERPROFILE\.claude\settings.json"
if (!(Test-Path $settingsPath)) {
    New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.claude" | Out-Null
    '{ "env": {} }' | Set-Content -Path $settingsPath -Encoding utf8
}
Get-Content $settingsPath
```

### 1b — Add or update a secret

Ask the customer which keys they need. Typical set:

- `ANTHROPIC_API_KEY` — only needed if the customer is on Console/pay-as-you-go instead of a Pro/Max/Team/Enterprise subscription. Subscription users skip this.
- `OPENAI_API_KEY` — only if they use OpenAI tooling
- `GITHUB_TOKEN` — only if they need scripted GitHub access beyond `gh auth`
- `NGROK_AUTHTOKEN` — only for the WhatsApp bot use case

Add each one with this PowerShell snippet (run once per key — prompt at each invocation so the value never appears in shell history):

```powershell
$settingsPath = "$env:USERPROFILE\.claude\settings.json"
$key = Read-Host "Env var name (e.g. ANTHROPIC_API_KEY)"
$val = Read-Host "Value" -AsSecureString
$plain = [System.Net.NetworkCredential]::new('', $val).Password

$json = Get-Content $settingsPath -Raw | ConvertFrom-Json
if (-not $json.env) { $json | Add-Member -NotePropertyName env -NotePropertyValue ([pscustomobject]@{}) -Force }
$json.env | Add-Member -NotePropertyName $key -NotePropertyValue $plain -Force
$json | ConvertTo-Json -Depth 10 | Set-Content -Path $settingsPath -Encoding utf8
Write-Host "Saved $key to $settingsPath"
```

### 1c — Verify

```powershell
claude -p "echo `"ANTHROPIC_API_KEY length: `$env:ANTHROPIC_API_KEY.Length`""
```

Replace the key name as needed. The reported length should match the expected secret length.

### 1d — Lock down file permissions (recommended)

`settings.json` is plaintext JSON. On a single-user Windows machine the default NTFS ACL already restricts it to the user profile owner, but if the machine is shared, restrict it explicitly:

```powershell
icacls "$env:USERPROFILE\.claude\settings.json" /inheritance:r /grant:r "$($env:USERNAME):(F)"
```

---

## Phase 2 — Windows Credential Manager (for cross-tool secrets)

Use this only when a secret needs to be readable by tools other than Claude Code — for example a PowerShell script, a VS Code task, or a background service. Credentials stored here are encrypted at rest with DPAPI (per-user key, not plaintext).

### 2a — Install the CredentialManager module (one-time, per user)

```powershell
Install-Module CredentialManager -Scope CurrentUser -Force
```

If the customer is offline or blocks PSGallery, the built-in `cmdkey.exe` works too — but retrieving requires Win32 API calls, so the module is the pragmatic default.

### 2b — Store a secret

```powershell
$target = Read-Host "Credential name (e.g. github-deploy-pat)"
$secret = Read-Host "Value" -AsSecureString
New-StoredCredential `
    -Target $target `
    -UserName $env:USERNAME `
    -SecurePassword $secret `
    -Persist LocalMachine | Out-Null
Write-Host "Stored credential '$target' in Windows Credential Manager."
```

### 2c — Retrieve a secret (from any PowerShell session)

```powershell
$pat = (Get-StoredCredential -Target 'github-deploy-pat').GetNetworkCredential().Password
```

### 2d — (Optional) Auto-inject into the PowerShell session environment

If a specific tool expects the secret as an env var at shell launch, add a loader to the user's PowerShell profile. Only do this for secrets that genuinely need environment-variable access — the whole point of Credential Manager is to avoid spraying secrets into env.

```powershell
if (!(Test-Path $PROFILE)) { New-Item -ItemType File -Force -Path $PROFILE | Out-Null }
Add-Content $PROFILE @'

# Load select secrets from Windows Credential Manager into the session env.
# Add one line per secret the shell must expose.
$env:GITHUB_TOKEN = (Get-StoredCredential -Target 'github-deploy-pat').GetNetworkCredential().Password
'@
```

### 2e — Verify

```powershell
Get-StoredCredential -Target 'github-deploy-pat' | Format-List Target, UserName
```

The target should appear; the password itself is intentionally not printed.

---

## Phase 3 — Rotating or removing a secret

### From settings.json

Re-run the Phase 1b snippet with the same key — it overwrites. To delete:

```powershell
$settingsPath = "$env:USERPROFILE\.claude\settings.json"
$json = Get-Content $settingsPath -Raw | ConvertFrom-Json
$json.env.PSObject.Properties.Remove('KEY_TO_REMOVE')
$json | ConvertTo-Json -Depth 10 | Set-Content -Path $settingsPath -Encoding utf8
```

### From Credential Manager

```powershell
Remove-StoredCredential -Target 'github-deploy-pat'
```

---

## Phase 4 — Decommission / customer offboarding

When a customer leaves, or a vsol technician finishes a session on their machine:

```powershell
# Show every Claude Code env-scoped secret (names only; values visible in the file)
$settingsPath = "$env:USERPROFILE\.claude\settings.json"
(Get-Content $settingsPath -Raw | ConvertFrom-Json).env.PSObject.Properties.Name

# Show every Credential Manager entry (names only)
Get-StoredCredential | Select-Object Target, UserName
```

Confirm nothing vsol-owned remains. If anything does, remove it with the snippets in Phase 3.

---

## Why not `setx` or a plaintext `.env`?

- `setx` writes to `HKCU\Environment` in plaintext and is inherited by **every** process the user launches — a single malicious dependency install exfiltrates every customer secret at once. It also truncates values over 1024 chars and does not update the current shell.
- A loose `.env` file is plaintext on disk and is not auto-loaded by Claude Code or Claude Desktop, so it silently fails to populate the env and gives a false sense of configuration.
- `settings.json` `env` is also plaintext JSON, but its blast radius is limited to processes Claude Code spawns. Credential Manager uses per-user DPAPI encryption and is the correct home for anything that must survive outside that scope.
