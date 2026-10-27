@echo off
setlocal EnableDelayedExpansion
cd /d "%~dp0"
title Publish the Huzzah site

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
where git >nul 2>nul
if errorlevel 1 (
  echo.
  echo  Git is not installed. Install Git for Windows or GitHub Desktop, then try again.
  echo.
  pause
  exit /b 1
)

set "GIT=git"
if defined DRYRUN (
  set "GIT=echo [dry run] git"
  echo.
  echo  *** DRY RUN: nothing will be saved or sent ***
)

echo.
echo  Step 1 of 3: checking the site for mistakes...
call npm run check
if errorlevel 1 (
  echo.
  echo  ---------------------------------------------------------------
  echo   Publishing STOPPED. The problems listed above need fixing.
  echo   Nothing was sent and the live website has not changed.
  echo   Ask Claude for help if a message is unclear.
  echo  ---------------------------------------------------------------
  echo.
  pause
  exit /b 1
)

echo  Step 2 of 3: looking for your changes...
set COUNT=0
for /f %%N in ('git status --short ^| find /c /v ""') do set COUNT=%%N
if "%COUNT%"=="0" (
  echo.
  echo  There is nothing new to publish.
  echo.
  pause
  exit /b 0
)
echo.
echo  %COUNT% file changed or added. The first few:
powershell -NoProfile -Command "git status --short | Select-Object -First 12"
if %COUNT% GTR 12 echo   and more...
echo.
set "MSG="
set /p "MSG= In a few words, what did you change? (Enter = Update site): "
if "!MSG!"=="" set "MSG=Update site"
set "MSG=!MSG:"='!"

echo.
echo  Step 3 of 3: publishing...
%GIT% add -A
%GIT% commit -m "!MSG!"
if errorlevel 1 (
  echo.
  echo  Could not save the changes. Ask Claude for help.
  pause
  exit /b 1
)
%GIT% pull --rebase origin main
if errorlevel 1 (
  echo.
  echo  Could not combine your changes with newer ones on GitHub. Ask Claude for help.
  pause
  exit /b 1
)
%GIT% push origin main
if errorlevel 1 (
  echo.
  echo  The upload to GitHub failed. Check your internet connection and run this again.
  pause
  exit /b 1
)

echo.
echo  ===============================================================
echo   Published. The live website updates in about 2 minutes.
echo   To watch it: Cloudflare, Workers and Pages, huzzah, Deployments.
echo  ===============================================================
echo.
pause
