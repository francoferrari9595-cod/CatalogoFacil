@echo off
setlocal
cd /d "%~dp0"
title Catalogo Facil - Configurar publicador
color 0A
echo ============================================================
echo       CATALOGO FACIL - CONFIGURAR PUBLICADOR
echo ============================================================
echo.
echo ESTA ES LA CONFIGURACION DEL PROPIETARIO.
echo No instala Wrangler, workerd, Node ni npm.
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0CONFIGURAR_PUBLICADOR.ps1"
set "ERR=%ERRORLEVEL%"
echo.
if not "%ERR%"=="0" (
  echo ============================================================
  echo ERROR: %ERR%
  echo ============================================================
  echo.
  echo El error queda visible. Esta ventana NO se cerrara sola.
  echo.
  pause
) else (
  echo Configuracion finalizada.
  echo.
  pause
)
endlocal
