@echo off
setlocal

REM =====================================================
REM athyper Mesh - Local TLS Certificate Generator
REM =====================================================

echo.
echo ==========================================
echo  athyper Mesh - mkcert TLS Generator
echo ==========================================
echo.

REM Resolve directories safely
set SCRIPT_DIR=%~dp0
for %%I in ("%SCRIPT_DIR%\..") do set MESH_DIR=%%~fI
set CERT_DIR=%MESH_DIR%\config\gateway\certs

REM Ensure mkcert.exe exists (NOT this script)
where mkcert.exe >nul 2>&1
if errorlevel 1 (
  echo ❌ mkcert.exe not found in PATH
  echo 👉 Install from https://github.com/FiloSottile/mkcert
  exit /b 1
)

REM Create cert directory
if not exist "%CERT_DIR%" (
  echo Creating cert directory:
  echo   %CERT_DIR%
  mkdir "%CERT_DIR%"
)

REM Install local CA (idempotent)
echo.
echo Installing mkcert local CA...
mkcert.exe -install

REM Generate certificate
echo.
echo Generating mesh TLS certificates...
mkcert.exe ^
  -cert-file "%CERT_DIR%\mesh.tls.local.crt" ^
  -key-file  "%CERT_DIR%\mesh.tls.local.key" ^
  mesh.gateway.local ^
  mesh.iam.local ^
  mesh.objectstorage.local ^
  mesh.objectstorage.console.local ^
  mesh.memorycache.local ^
  mesh.telemetry.local ^
  mesh.metrics.local ^
  mesh.traces.local ^
  mesh.logs.local ^
  athyper.local ^
  athyper.api.local

if errorlevel 1 (
  echo ❌ Certificate generation failed
  exit /b 1
)

echo.
echo ✅ Certificates generated successfully
echo 📂 %CERT_DIR%
echo.
endlocal
