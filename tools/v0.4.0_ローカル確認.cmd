@echo off
setlocal EnableExtensions

set "ROOT=%~dp0.."
set "PORT=8000"
set "URL=http://127.0.0.1:%PORT%/"

echo ========================================
echo E-Shikaku Navi v0.4.0 local preview
echo Root: %ROOT%
echo URL : %URL%
echo Stop: Ctrl+C
echo ========================================
echo.

where python.exe >nul 2>nul
if not errorlevel 1 goto run_path_python

if exist "%USERPROFILE%\anaconda3\python.exe" goto run_user_anaconda
if exist "%USERPROFILE%\miniconda3\python.exe" goto run_user_miniconda
if exist "%LOCALAPPDATA%\anaconda3\python.exe" goto run_local_anaconda
if exist "%LOCALAPPDATA%\miniconda3\python.exe" goto run_local_miniconda
if exist "C:\ProgramData\anaconda3\python.exe" goto run_programdata_anaconda
if exist "C:\ProgramData\miniconda3\python.exe" goto run_programdata_miniconda

goto python_not_found

:run_path_python
python.exe -m http.server %PORT% --bind 127.0.0.1 --directory "%ROOT%"
goto finished

:run_user_anaconda
"%USERPROFILE%\anaconda3\python.exe" -m http.server %PORT% --bind 127.0.0.1 --directory "%ROOT%"
goto finished

:run_user_miniconda
"%USERPROFILE%\miniconda3\python.exe" -m http.server %PORT% --bind 127.0.0.1 --directory "%ROOT%"
goto finished

:run_local_anaconda
"%LOCALAPPDATA%\anaconda3\python.exe" -m http.server %PORT% --bind 127.0.0.1 --directory "%ROOT%"
goto finished

:run_local_miniconda
"%LOCALAPPDATA%\miniconda3\python.exe" -m http.server %PORT% --bind 127.0.0.1 --directory "%ROOT%"
goto finished

:run_programdata_anaconda
"C:\ProgramData\anaconda3\python.exe" -m http.server %PORT% --bind 127.0.0.1 --directory "%ROOT%"
goto finished

:run_programdata_miniconda
"C:\ProgramData\miniconda3\python.exe" -m http.server %PORT% --bind 127.0.0.1 --directory "%ROOT%"
goto finished

:python_not_found
echo [ERROR] Python was not found.
echo Open Anaconda Prompt, move to this tools folder, and run:
echo python -m http.server 8000 --bind 127.0.0.1 --directory ..
echo.
pause
exit /b 1

:finished
echo.
echo The local preview has stopped.
pause
endlocal
