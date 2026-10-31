@echo off
setlocal
cd /d "%~dp0"
set "MATERIAL_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if exist "%MATERIAL_NODE%" goto run
set "MATERIAL_NODE=%ProgramFiles%\nodejs\node.exe"
if exist "%MATERIAL_NODE%" goto run
where node >nul 2>nul
if errorlevel 1 goto missing
set "MATERIAL_NODE=node"
:run
echo Material Lab : http://127.0.0.1:4173/
echo Gardez cette fenetre ouverte pendant l'utilisation.
"%MATERIAL_NODE%" "%~dp0server.cjs"
pause
exit /b
:missing
echo Node.js est introuvable. Installez Node.js ou corrigez MATERIAL_NODE dans ce fichier.
pause
exit /b 1
