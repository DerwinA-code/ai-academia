@echo off
rem Builds "AI academia\Study hub.html" from the parts in this folder, in name order. No Python, nothing downloaded.
cd /d "%~dp0"
copy /b 1-head.html + 2-engine.js + 3-measure.js + 4-run.js + 5-agents.js + 6-memory.js + 7-systems.js + 9-boot.js "..\..\Study hub.html" >nul
echo wrote Study hub.html
