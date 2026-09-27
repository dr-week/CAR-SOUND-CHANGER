param([switch]$Install, [string]$Serial = 'emulator-5554')
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$androidRoot = Join-Path $projectRoot 'android'
$configPath = Join-Path $androidRoot 'toolchain.local.json'
if (Test-Path $configPath) {
    $toolchain = Get-Content $configPath -Raw | ConvertFrom-Json
    $env:JAVA_HOME = $toolchain.javaHome
    $adbPath = $toolchain.adb
} else {
    $adbPath = 'adb'
}
if (-not $env:JAVA_HOME) { throw 'Set JAVA_HOME or configure android/toolchain.local.json.' }
Push-Location $androidRoot
try {
    # Gradle builds current web sources before packaging; never install after failure.
    & .\gradlew.bat assembleDebug --no-daemon --console plain
    if ($LASTEXITCODE -ne 0) { throw 'APK build failed; installed app left unchanged.' }
    $apk = Join-Path $androidRoot 'app/build/outputs/apk/debug/app-debug.apk'
    Write-Output "APK: $apk"
    if ($Install) {
        & $adbPath -s $Serial get-state
        if ($LASTEXITCODE -ne 0) { throw "Existing device $Serial is not ready. No emulator will be created." }
        & $adbPath -s $Serial install -r $apk
        if ($LASTEXITCODE -ne 0) { throw 'Install failed; no uninstall or data wipe attempted.' }
        & $adbPath -s $Serial shell am start -S -W -n com.carsoundmod.launcher/.MainActivity
        if ($LASTEXITCODE -ne 0) { throw 'App launch failed.' }
    }
} finally { Pop-Location }
