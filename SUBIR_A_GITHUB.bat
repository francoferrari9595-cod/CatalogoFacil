@echo off
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"
title Catalogo Facil V83 - Publicar y verificar
color 0A
set "REPO=https://github.com/francoferrari9595-cod/CatalogoFacil.git"

echo ============================================================
echo       CATALOGO FACIL V83 - SUBIDA Y VERIFICACION
echo ============================================================
echo.
echo Esta es la carpeta completa de la version V83.
echo No mezcles ni extraigas este ZIP dentro de una carpeta de versiones anteriores.
echo.
for /f "delims=" %%L in ('powershell -NoProfile -Command "(Get-Location).Path.Length"') do set "PATHLEN=%%L"
if defined PATHLEN if !PATHLEN! GEQ 100 goto MOVE_TO_SHORT_PATH

if not exist "package.json" goto ERROR_PROJECT
if not exist "src\main.tsx" goto ERROR_PROJECT
if not exist "public\api-config.js" goto ERROR_PROJECT

findstr /C:"catalogo-facil-publisher.francoferrari9595.workers.dev" "public\api-config.js" >nul
if errorlevel 1 (
 echo ERROR: no se encontro la configuracion del publicador en esta carpeta.
 goto FAIL
)

where git.exe >nul 2>&1
if errorlevel 1 goto NO_GIT

echo [1/6] Configurando Git y rutas largas...
git config --global core.longpaths true
git config core.longpaths true
if not exist ".git\" git init
if errorlevel 1 goto FAIL
git branch -M main >nul 2>&1
git config user.name "Catalogo Facil"
git config user.email "catalogo-facil@users.noreply.github.com"
git remote get-url origin >nul 2>&1
if errorlevel 1 git remote add origin "%REPO%"
git remote set-url origin "%REPO%"
if errorlevel 1 goto FAIL

echo [2/6] Comprobando acceso a GitHub...
git ls-remote "%REPO%" >"%TEMP%\cf_access.txt" 2>&1
if errorlevel 1 (
 type "%TEMP%\cf_access.txt"
 echo.
 echo Se intentara abrir el inicio de sesion de GitHub.
 git credential-manager github login
 if errorlevel 1 goto AUTH_FAIL
 git ls-remote "%REPO%" >nul 2>&1
 if errorlevel 1 goto AUTH_FAIL
)
echo Acceso OK.

echo [3/6] Preparando solamente esta carpeta...
git add -A
if errorlevel 1 goto FAIL
git diff --cached --quiet
if errorlevel 1 (
 git commit -m "Catalogo Facil V83 - nuevo diseno de catalogos, 15 temas Claude y visor de fotos"
 if errorlevel 1 goto FAIL
) else echo No habia cambios nuevos para confirmar.

echo [4/6] Publicando V83...
git push -u origin main --force
if errorlevel 1 goto PUSH_FAIL

echo [5/6] Verificando que GitHub recibio el codigo de esta carpeta...
git fetch origin main --quiet
for /f "delims=" %%H in ('git rev-parse HEAD:src/main.tsx 2^>nul') do set "LOCAL_HASH=%%H"
for /f "delims=" %%H in ('git rev-parse origin/main:src/main.tsx 2^>nul') do set "REMOTE_HASH=%%H"
if not defined REMOTE_HASH goto VERIFY_FAIL
if /i not "!LOCAL_HASH!"=="!REMOTE_HASH!" goto VERIFY_FAIL
git show origin/main:public/api-config.js | findstr /C:"catalogo-facil-publisher.francoferrari9595.workers.dev" >nul
if errorlevel 1 goto VERIFY_FAIL
echo GitHub remoto: V83 CONFIRMADA.

echo [6/6] Abriendo las acciones de GitHub...
start "" "https://github.com/francoferrari9595-cod/CatalogoFacil/actions"
echo.
echo Cuando la compilacion aparezca en verde, abre:
echo https://francoferrari9595-cod.github.io/CatalogoFacil/?editor=publish
echo Si ves una version vieja, presiona Ctrl+F5.
echo.
pause
exit /b 0

:MOVE_TO_SHORT_PATH
rem Copia el proyecto a una ruta corta automaticamente para evitar Filename too long.
set "SHORTROOT=C:\CatalogoFacilV83"
echo La ruta actual es demasiado larga. Copiando el proyecto a %SHORTROOT%...
if not exist "%SHORTROOT%" mkdir "%SHORTROOT%"
robocopy "%~dp0" "%SHORTROOT%" /E /R:1 /W:1 /XD ".git" "node_modules" "dist" /XF "*.log"
set "COPYRC=%ERRORLEVEL%"
if %COPYRC% GEQ 8 goto COPY_FAIL
if not exist "%SHORTROOT%\SUBIR_A_GITHUB.bat" goto COPY_FAIL
echo Proyecto copiado a una ruta corta. Continuando desde alli...
call "%SHORTROOT%\SUBIR_A_GITHUB.bat"
set "RUNRC=%ERRORLEVEL%"
echo.
if not "%RUNRC%"=="0" echo La publicacion desde la ruta corta no se completo.
pause
exit /b %RUNRC%
:COPY_FAIL
echo ERROR: no se pudo copiar el proyecto a %SHORTROOT%.
echo Verifica que la unidad C: tenga espacio y permisos de escritura.
goto FAIL
:NO_GIT
echo ERROR: Git no esta instalado. Instala Git for Windows y vuelve a intentarlo.
goto FAIL
:AUTH_FAIL
echo ERROR: no se pudo autenticar en GitHub.
goto FAIL
:PUSH_FAIL
echo ERROR: Git no pudo subir la version V83.
goto FAIL
:VERIFY_FAIL
echo ERROR: GitHub no coincide con los archivos de esta carpeta. No se confirma la subida.
goto FAIL
:ERROR_PROJECT
echo ERROR: este BAT no esta en la raiz completa del proyecto V83.
goto FAIL
:FAIL
echo.
echo ============================================================
echo PROCESO NO COMPLETADO - VENTANA ABIERTA
echo ============================================================
pause
exit /b 1
