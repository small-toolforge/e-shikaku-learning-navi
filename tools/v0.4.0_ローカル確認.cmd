@echo off
setlocal EnableExtensions
chcp 65001 >nul

set "ROOT=%~dp0.."
set "PORT=8000"
set "URL=http://127.0.0.1:%PORT%/"

echo === E資格 学習ナビ v0.4.0 ローカル確認 ===
echo 配信フォルダ: %ROOT%
echo 接続先      : %URL%
echo.
echo Edgeで上記URLを開いてください。
echo 終了するときは、この画面で Ctrl+C を押します。
echo.

where py >nul 2>nul
if not errorlevel 1 (
  py -3 -m http.server %PORT% --bind 127.0.0.1 --directory "%ROOT%"
  goto :end
)

where python >nul 2>nul
if not errorlevel 1 (
  python -m http.server %PORT% --bind 127.0.0.1 --directory "%ROOT%"
  goto :end
)

if exist "%USERPROFILE%\anaconda3\python.exe" (
  "%USERPROFILE%\anaconda3\python.exe" -m http.server %PORT% --bind 127.0.0.1 --directory "%ROOT%"
  goto :end
)

if exist "%USERPROFILE%\miniconda3\python.exe" (
  "%USERPROFILE%\miniconda3\python.exe" -m http.server %PORT% --bind 127.0.0.1 --directory "%ROOT%"
  goto :end
)

echo [NG] Pythonを見つけられませんでした。
echo Anaconda Promptで次を実行してください。
echo   python -m http.server %PORT% --bind 127.0.0.1 --directory "%ROOT%"

:end
echo.
pause
