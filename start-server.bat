@echo off
title Vedashri Portfolio Local Server
echo Starting local web server at http://localhost:8080/ ...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1" -Port 8080
pause
