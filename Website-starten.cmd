@echo off
cd /d "%~dp0"
if not exist "out\index.html" (
  echo Die Website muss einmal gebaut werden. Bitte npm.cmd run export ausfuehren.
  pause
  exit /b 1
)
node scripts\vorschau.mjs --open
pause
