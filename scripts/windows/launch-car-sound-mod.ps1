[CmdletBinding()]
param([int]$Port = 5173)

$ErrorActionPreference = 'Stop'
$listeners = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
foreach ($listener in $listeners) {
  Stop-Process -Id $listener.OwningProcess -Force
}

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
Set-Location $projectRoot
if (-not (Test-Path 'node_modules')) { npm install }
npm run dev -- --port $Port
