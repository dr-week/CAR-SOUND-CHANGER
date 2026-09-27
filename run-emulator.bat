@echo off
title Android Infotainment Simulator
echo Starting Android Infotainment Simulator...
set ANDROID_HOME=%USERPROFILE%\AppData\Local\Android\Sdk
set PATH=%ANDROID_HOME%\emulator;%ANDROID_HOME%\platform-tools;%PATH%

start "" "%ANDROID_HOME%\emulator\emulator.exe" -avd medium_tablet
exit
