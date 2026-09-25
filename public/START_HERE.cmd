@echo off
title cartabio local preview
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0preview-server.ps1"
if errorlevel 1 pause
