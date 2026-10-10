@echo off
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"
title Catalogo Facil - Publicar V38
color 0A
set "REPO=https://github.com/francoferrari9595-cod/CatalogoFacil.git"

echo ============================================================
echo       CATALOGO FACIL V38 - SUBIDA VERIFICADA
 echo ============================================================
echo.
echo ESTA CARPETA ES LA VERSION V38.
echo No uses otra carpeta ni otro BAT.
echo.
if not exist "package.json" goto ERROR_PROJECT
if not exist "src\main.tsx" goto ERROR_PROJECT
if not exist "public\api-config.js" goto ERROR_PROJECT

findstr /C:"catalogo-facil-publisher.francoferrari9595.workers.dev" "public\api-config.js" >nul
if errorlevel 1 (
 echo ERROR: publicador no configurado en esta carpeta.
 goto FAIL
)

echo [1/6] Configurando Git...
where git.exe >nul 2>&1
if errorlevel 1 goto NO_GIT
if not exist ".git\" git init
if errorlevel 1 goto FAIL
git branch -M main >nul 2>&1
git config user.name "Catalogo Facil"
git config user.email "catalogo-facil@users.noreply.github.com"
git remote get-url origin >nul 2>&1
if errorlevel 1 git remote add origin "%REPO%"
git remote set-url origin "%REPO%"

echo [2/6] Comprobando acceso a GitHub...
git ls-remote "%REPO%" >"%TEMP%\cf_access.txt" 2>&1
if errorlevel 1 (
 type "%TEMP%\cf_access.txt"
 echo.
 echo Se abrira Git Credential Manager para autorizar GitHub.
 git credential-manager github login
 if errorlevel 1 goto AUTH_FAIL
 git ls-remote "%REPO%" >nul 2>&1
 if errorlevel 1 goto AUTH_FAIL
)
echo Acceso OK.

echo [3/6] Subiendo exactamente esta carpeta...
git add -A
if errorlevel 1 goto FAIL
git diff --cached --quiet
if errorlevel 1 (
 git commit -m "Catalogo Facil V38 - publicador configurado"
 if errorlevel 1 goto FAIL
) else echo No habia cambios nuevos; se comprobara igualmente el remoto.
git push -u origin main --force
if errorlevel 1 goto PUSH_FAIL

echo [4/6] Verificando que GitHub recibio V38...
git fetch origin main --quiet
for /f "delims=" %%H in ('git rev-parse HEAD:src/main.tsx 2^>nul') do set "LOCAL_HASH=%%H"
for /f "delims=" %%H in ('git rev-parse origin/main:src/main.tsx 2^>nul') do set "REMOTE_HASH=%%H"
if not defined REMOTE_HASH goto VERIFY_FAIL
if /i not "!LOCAL_HASH!"=="!REMOTE_HASH!" goto VERIFY_FAIL

git show origin/main:src/main.tsx | findstr /C:"catalogo-facil-publisher.francoferrari9595.workers.dev" >nul
if errorlevel 1 goto VERIFY_FAIL

git show origin/main:public/api-config.js | findstr /C:"catalogo-facil-publisher.francoferrari9595.workers.dev" >nul
if errorlevel 1 goto VERIFY_FAIL

echo GitHub remoto: V38 CONFIRMADA.

echo [5/6] GitHub Pages puede tardar unos segundos en reconstruir.
echo.
echo IMPORTANTE: el BAT NO dira "correcto" si GitHub recibio otra version.
echo.
echo [6/6] ABRIENDO LA PAGINA DE ACCIONES...
start "" "https://github.com/francoferrari9595-cod/CatalogoFacil/actions"
echo.
echo Cuando el ultimo workflow aparezca en verde, abre:
echo https://francoferrari9595-cod.github.io/CatalogoFacil/?editor=publish
 echo.
echo Si el navegador sigue mostrando la pantalla vieja, presiona Ctrl+F5.
echo.
pause
exit /b 0

:NO_GIT
echo ERROR: Git no esta instalado.
goto FAIL
:AUTH_FAIL
echo ERROR: no se pudo autenticar GitHub.
goto FAIL
:PUSH_FAIL
echo ERROR: Git no pudo subir V38.
goto FAIL
:VERIFY_FAIL
echo ERROR GRAVE: el remoto NO coincide con esta V38.
echo No se continuara para evitar otro diagnostico falso.
goto FAIL
:ERROR_PROJECT
echo ERROR: ejecutaste este BAT fuera de la carpeta raiz de V38.
goto FAIL
:FAIL
echo.
echo ============================================================
echo PROCESO NO COMPLETADO - VENTANA ABIERTA
 echo ============================================================
pause
exit /b 1
