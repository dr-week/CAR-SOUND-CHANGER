@echo off
setlocal enabledelayedexpansion

title Car Sound Mod Launcher

:: Set project root to parent directory of scripts folder
set "SCRIPTS_DIR=%~dp0"
for %%I in ("%SCRIPTS_DIR%..") do set "PROJECT_ROOT=%%~fI"

cd /d "%PROJECT_ROOT%"

if /i "%~1"=="start" goto :START_SESSION
if /i "%~1"=="test" goto :RUN_TESTS
if /i "%~1"=="stop" goto :STOP_SESSIONS
if /i "%~1"=="build" goto :RUN_BUILD

:MENU
cls
echo ========================================================
echo        CAR SOUND MOD - SINGLE LAUNCHER ^& SESSION MANAGER
echo ========================================================
echo.
echo  Select Action:
echo   [1] Start Development Server (Auto-Test + Session Check)
echo   [2] Run Unit Tests ^& Feedback
echo   [3] Stop Existing Server Sessions
echo   [4] Build Production App
echo   [5] Exit
echo.
set /p CHOICE="Enter choice [1-5]: "

if "%CHOICE%"=="1" goto :START_SESSION
if "%CHOICE%"=="2" goto :RUN_TESTS
if "%CHOICE%"=="3" goto :STOP_SESSIONS
if "%CHOICE%"=="4" goto :RUN_BUILD
if "%CHOICE%"=="5" exit /b 0
goto :MENU

:START_SESSION
echo.
echo [1/3] Running Automated Test Suite...
echo --------------------------------------------------------
call npm run test
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [X] TEST FEEDBACK ERROR: Unit tests failed. Aborting launch.
    pause
    exit /b 1
)
echo.
echo [OK] TEST FEEDBACK AUTO: All unit tests passed successfully!
echo --------------------------------------------------------
echo.

echo [2/3] Checking Active Server Sessions...
set PORT=5173
set DUP_FOUND=0

netstat -ano | findstr /R /C:":5173 .*LISTENING" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    set DUP_FOUND=1
    set PORT=5173
)

netstat -ano | findstr /R /C:":5174 .*LISTENING" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    set DUP_FOUND=1
    set PORT=5174
)

if "!DUP_FOUND!"=="1" (
    echo.
    echo [!] A Car Sound Mod session is already running on port !PORT!.
    echo [*] Opening existing session in your browser at http://localhost:!PORT!...
    start http://localhost:!PORT!
    echo.
    echo [OK] Attached to active session. Duplicate server prevented!
    exit /b 0
)

echo [3/3] Launching New Vite Dev Server on http://localhost:5173...
echo.
start http://localhost:5173
call npm run dev
exit /b 0

:RUN_TESTS
echo.
echo Running Unit Test Suite and Static Checks...
call npm run test
if "%~1"=="" pause
exit /b 0

:STOP_SESSIONS
echo.
echo Stopping node/vite sessions...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr /R /C:":5173 .*LISTENING"') do (
    echo Terminating PID %%a on port 5173...
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr /R /C:":5174 .*LISTENING"') do (
    echo Terminating PID %%a on port 5174...
    taskkill /F /PID %%a >nul 2>&1
)
echo [OK] Sessions stopped.
if "%~1"=="" pause
exit /b 0

:RUN_BUILD
echo.
echo Building Production Assets...
call npm run build
if "%~1"=="" pause
exit /b 0
