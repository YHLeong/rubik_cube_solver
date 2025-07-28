@echo off
echo Starting Rubik's Cube Solver Server...
echo.
echo Installing dependencies...
.venv\Scripts\pip.exe install flask flask-cors kociemba

echo.
echo Starting server on http://localhost:5000
echo Press Ctrl+C to stop the server
echo.

.venv\Scripts\python.exe server.py

pause
