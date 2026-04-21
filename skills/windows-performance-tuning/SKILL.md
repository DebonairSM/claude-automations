---
name: windows-performance-tuning
description: Diagnose and optimize Windows PC performance. Use this skill whenever the user mentions their computer is slow, lagging, or unresponsive, wants to speed up Windows, asks about high CPU or RAM usage, wants to clean up startup programs, disable unnecessary services, or tune Windows settings for better performance. Also use when the user asks about WSL memory, power plans, or visual effects on Windows.
---

# Windows Performance Tuning

This skill diagnoses and optimizes Windows performance through a structured workflow: assess → fix → prevent.

## Phase 1: Diagnose

Run a full system snapshot to understand current state:

```powershell
# Top CPU processes
Get-Process | Sort-Object CPU -Descending | Select-Object -First 10 Name, CPU, Id | Format-Table -AutoSize

# Top RAM processes
Get-Process | Sort-Object WorkingSet -Descending | Select-Object -First 10 Name, Id, @{N="RAM_MB";E={[math]::Round($_.WorkingSet/1MB,1)}} | Format-Table -AutoSize

# Memory summary
$os = Get-CimInstance Win32_OperatingSystem
$total = [math]::Round($os.TotalVisibleMemorySize/1MB, 1)
$free = [math]::Round($os.FreePhysicalMemory/1MB, 1)
Write-Host "Total: $total GB | Used: $($total - $free) GB | Free: $free GB"

# Disk space
Get-PSDrive -PSProvider FileSystem | Where-Object {$_.Used -gt 0} | Select-Object Name, @{N="Used_GB";E={[math]::Round($_.Used/1GB,1)}}, @{N="Free_GB";E={[math]::Round($_.Free/1GB,1)}} | Format-Table -AutoSize

# Startup programs
Get-CimInstance Win32_StartupCommand | Select-Object Name, Command | Format-Table -AutoSize -Wrap
```

Report findings clearly: which processes are eating resources, how much RAM is free, what's auto-starting.

## Phase 2: Common Fixes (no admin required)

These can be applied immediately:

```powershell
# Restart runaway TextInputHost (Windows touch keyboard - often goes rogue)
Stop-Process -Name "TextInputHost" -Force -ErrorAction SilentlyContinue

# Set High Performance power plan
powercfg -setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c

# Disable visual effects (animations, shadows)
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\VisualEffects" -Name VisualFXSetting -Value 2 -ErrorAction SilentlyContinue
Set-ItemProperty -Path "HKCU:\Control Panel\Desktop" -Name "MenuShowDelay" -Value "0" -ErrorAction SilentlyContinue

# Disable unnecessary startup entries (adjust names as found in diagnosis)
$runKey = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run"
Remove-ItemProperty -Path $runKey -Name "MicrosoftEdgeAutoLaunch_*" -ErrorAction SilentlyContinue
Remove-ItemProperty -Path $runKey -Name "GoogleChromeAutoLaunch_*" -ErrorAction SilentlyContinue

# Shut down WSL2 if running and not needed
wsl --shutdown
```

## Phase 3: Admin-Required Fixes

These need **Admin PowerShell** (right-click → Run as Administrator). Provide as copy-paste commands:

```powershell
# Disable SysMain (Superfetch) - reduces disk thrashing
sc.exe config SysMain start= disabled
sc.exe stop SysMain

# Disable Windows Search indexing - reduces background CPU/disk
sc.exe config WSearch start= disabled
sc.exe stop WSearch

# Prevent WSL2 from auto-starting on boot
sc.exe config WSLService start= demand
sc.exe config lxss start= demand

# Enable Hardware-Accelerated GPU Scheduling (gaming/GPU workloads)
Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\GraphicsDrivers" -Name "HwSchMode" -Value 2
```

## Phase 4: Verify Improvement

After fixes, re-check memory and top processes to confirm improvement:

```powershell
$os = Get-CimInstance Win32_OperatingSystem
$total = [math]::Round($os.TotalVisibleMemorySize/1MB, 1)
$free = [math]::Round($os.FreePhysicalMemory/1MB, 1)
Write-Host "Free RAM: $free GB of $total GB"
```

## Key Culprits to Watch

| Process | What it is | Fix |
|---------|-----------|-----|
| `TextInputHost` | Touch keyboard - can go rogue | Restart it |
| `vmmem` | WSL2 / Hyper-V VM | `wsl --shutdown` |
| `chrome` (multiple) | Browser renderers | Close unused tabs |
| `OneDrive.Sync.Service` | Cloud sync | Pause sync if not needed |
| `SearchIndexer` | Windows Search | Disable WSearch service |
| `SysMain` | Superfetch disk preloading | Disable service |

## Notes

- Always check free RAM first — under 1 GB free causes severe slowdowns (Windows starts paging to disk)
- Chrome with many tabs is the most common culprit on developer machines
- A restart after applying admin-level service changes ensures everything takes effect
- WSL2 (`vmmem`) holds memory aggressively — always shut it down when not in use
