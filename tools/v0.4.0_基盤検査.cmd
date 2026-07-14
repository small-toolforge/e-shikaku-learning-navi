@echo off
setlocal EnableExtensions
chcp 65001 >nul
cd /d "%~dp0.."
set "SCRIPT=%~dp0v0.4.0_基盤検査.py"

where py >nul 2>nul
if not errorlevel 1 (
  py -3 "%SCRIPT%"
  goto :finished
)
where python >nul 2>nul
if not errorlevel 1 (
  python "%SCRIPT%"
  goto :finished
)
if exist "%USERPROFILE%\anaconda3\python.exe" (
  "%USERPROFILE%\anaconda3\python.exe" "%SCRIPT%"
  goto :finished
)
if exist "%USERPROFILE%\miniconda3\python.exe" (
  "%USERPROFILE%\miniconda3\python.exe" "%SCRIPT%"
  goto :finished
)
if exist "%LOCALAPPDATA%\anaconda3\python.exe" (
  "%LOCALAPPDATA%\anaconda3\python.exe" "%SCRIPT%"
  goto :finished
)
if exist "%LOCALAPPDATA%\miniconda3\python.exe" (
  "%LOCALAPPDATA%\miniconda3\python.exe" "%SCRIPT%"
  goto :finished
)

echo [NG] Pythonを見つけられませんでした。
echo Anaconda Promptから次を実行してください。
echo   "%SCRIPT%"
set "RC=1"
goto :end

:finished
set "RC=%ERRORLEVEL%"
:end
echo.
pause
exit /b %RC%
