@echo off
echo ========================================
echo  Iniciando Gestor Voucher ATO
echo ========================================
echo.
cd /d "%~dp0"
echo Directorio actual: %CD%
echo.
echo Instalando dependencias si es necesario...
call npm install
echo.
echo ========================================
echo  Iniciando servidor de desarrollo...
echo ========================================
echo.
echo El servidor estara disponible en:
echo   http://localhost:8080
echo.
echo Presiona Ctrl+C para detener el servidor
echo.
call npm run dev
pause



