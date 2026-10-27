@echo off
cd /d "%~dp0"
where py >nul 2>&1
if %errorlevel%==0 (
  start "" "http://localhost:8765/dashboard.html"
  py -3 -m http.server 8765
  goto :eof
)
where python >nul 2>&1
if %errorlevel%==0 (
  start "" "http://localhost:8765/dashboard.html"
  python -m http.server 8765
  goto :eof
)
echo Python is required for the dashboard preview.
echo Install Python from python.org then run this file again.
pause
