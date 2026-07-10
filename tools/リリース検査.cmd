@echo off
setlocal
cd /d "%~dp0.."
where py >nul 2>nul
if %errorlevel%==0 (
  py -3 "tools\リリース検査.py"
) else (
  python "tools\リリース検査.py"
)
echo.
pause
