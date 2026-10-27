@echo off
setlocal
cd /d "%~dp0"
title Huzzah site editor

rem Find Node even if this window was opened before Node was installed
if exist "%ProgramFiles%\nodejs\node.exe" set "PATH=%ProgramFiles%\nodejs;%PATH%"
where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo  Node.js is not installed on this computer.
  echo  Install it by running this in a terminal:  winget install OpenJS.NodeJS.LTS
  echo  Then double-click this file again.
  echo.
  pause
  exit /b 1
)

rem If the editor is already running, just open it in the browser
netstat -ano | findstr /r /c:":4321 .*LISTENING" >nul 2>nul
if not errorlevel 1 (
  echo  The editor is already running. Opening it in your browser...
  if not defined NO_BROWSER start "" "http://localhost:4321/keystatic"
  timeout /t 3 >nul
  exit /b 0
)

if not exist node_modules (
  echo  First run on this computer: installing the site's tools. This takes a minute or two...
  call npm install
  if errorlevel 1 (
    echo.
    echo  The install failed. Check your internet connection and try again.
    pause
    exit /b 1
  )
)

echo.
echo  ===============================================================
echo   Starting the Huzzah editor...
echo   Your browser will open in a few seconds.
echo.
echo   - Make your changes and click Save in the editor.
echo   - Leave this window open while you work.
echo   - When you are done, close this window, then double-click
echo     "Publish site" to put your changes on the live website.
echo  ===============================================================
echo.
if not defined NO_BROWSER start "" /b cmd /c "ping -n 9 127.0.0.1 >nul & explorer http://localhost:4321/keystatic"
call npm run dev -- --port 4321
pause
