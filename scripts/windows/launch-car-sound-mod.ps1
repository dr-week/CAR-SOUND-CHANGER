[CmdletBinding()]
param(
  [ValidateSet('start', 'start-lan', 'restart', 'stop', 'test', 'build', 'preview')]
  [string]$Action = 'start',
  [ValidateRange(1024, 65535)]
  [int]$Port = 5173
)

$ErrorActionPreference = 'Stop'
$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$MutexName = 'Local\CarSoundMod.DevServer'

function Get-ListenerProcessId {
  param([int]$ListenerPort)
  $listener = Get-NetTCPConnection -LocalPort $ListenerPort -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($null -ne $listener) { return $listener.OwningProcess }
  return $null
}

function Stop-CarSoundServer {
  param([int]$ListenerPort)
  $processId = Get-ListenerProcessId -ListenerPort $ListenerPort
  if ($null -eq $processId) { Write-Host "No Car Sound Mod server is listening on port $ListenerPort."; return }
  $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
  if ($null -eq $process) { return }
  $processDetails = Get-CimInstance Win32_Process -Filter "ProcessId = $processId" -ErrorAction SilentlyContinue
  $projectPathPattern = [regex]::Escape($ProjectRoot)
  if ($null -eq $processDetails -or $processDetails.CommandLine -notmatch $projectPathPattern) {
    Write-Error "Refusing to stop process ${processId}: port $ListenerPort is not owned by this project."
    return
  }
  Write-Host "Stopping process $processId ($($process.ProcessName)) on port $ListenerPort..."
  Stop-Process -Id $processId -Force
  Wait-Process -Id $processId -Timeout 10 -ErrorAction SilentlyContinue
}

function Invoke-Npm {
  param([string[]]$Arguments)
  Push-Location $ProjectRoot
  try { & npm.cmd @Arguments; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE } }
  finally { Pop-Location }
}

function Ensure-Dependencies {
  if (-not (Test-Path (Join-Path $ProjectRoot 'node_modules'))) {
    Write-Host 'Installing locked dependencies...'
    Invoke-Npm @('ci')
  }
}

if ($Action -in @('start', 'start-lan', 'restart', 'test', 'build', 'preview')) { Ensure-Dependencies }

switch ($Action) {
  'test' { Invoke-Npm @('run', 'check'); Invoke-Npm @('run', 'lint'); Invoke-Npm @('run', 'test'); exit 0 }
  'build' { Invoke-Npm @('run', 'build'); exit 0 }
  'stop' { Stop-CarSoundServer -ListenerPort $Port; exit 0 }
  'restart' { Stop-CarSoundServer -ListenerPort $Port }
  'preview' { $Port = 4173 }
}

$mutex = [System.Threading.Mutex]::new($false, $MutexName)
$ownsMutex = $false
try {
  $waitMs = if ($Action -eq 'restart') { 10000 } else { 0 }
  if (-not $mutex.WaitOne($waitMs, $false)) { Write-Host 'Car Sound Mod is already running through this launcher.' -ForegroundColor Yellow; exit 0 }
  $ownsMutex = $true
  if ($Action -eq 'start') {
    $existingProcessId = Get-ListenerProcessId -ListenerPort $Port
    if ($null -ne $existingProcessId) { Write-Host "A server is already listening on http://localhost:$Port (process $existingProcessId). Use restart to replace it." -ForegroundColor Yellow; exit 0 }
  }
  if ($Action -eq 'preview') { Write-Host "Starting production preview at http://localhost:$Port"; Invoke-Npm @('run', 'preview', '--', '--port', $Port, '--strictPort') }
  elseif ($Action -eq 'start-lan') { Write-Host "Starting LAN development server on port $Port"; Invoke-Npm @('run', 'dev:lan', '--', '--port', $Port, '--strictPort') }
  else { Write-Host "Starting development server at http://localhost:$Port"; Invoke-Npm @('run', 'dev', '--', '--port', $Port, '--strictPort') }
}
finally { if ($ownsMutex) { $mutex.ReleaseMutex() }; if ($mutex) { $mutex.Dispose() } }
