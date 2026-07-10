@echo off
setlocal EnableExtensions
chcp 65001 >nul
cd /d "%~dp0.."
set "SCRIPT=%~dp0リリース検査.py"

rem 1. Python Launcher
where py >nul 2>nul
if not errorlevel 1 (
  py -3 "%SCRIPT%"
  goto :finished
)

rem 2. PATH上のPython
where python >nul 2>nul
if not errorlevel 1 (
  python "%SCRIPT%"
  goto :finished
)
where python3 >nul 2>nul
if not errorlevel 1 (
  python3 "%SCRIPT%"
  goto :finished
)

rem 3. 一般的なAnaconda / Minicondaの配置
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

rem 4. .pyのファイル関連付けを最後に試す
call "%SCRIPT%"
if not errorlevel 9009 goto :finished

echo.
echo [NG] Pythonを見つけられませんでした。
echo Anaconda Promptを開き、次を実行してください。
echo   "%SCRIPT%"
set "RC=1"
goto :end

:finished
set "RC=%ERRORLEVEL%"

:end
echo.
pause
exit /b %RC%
