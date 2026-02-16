@echo off
REM =======================================================================
REM Keycloak IAM Export Script (Windows)
REM Exports athyper realm configuration to mesh\config\iam\
REM =======================================================================

setlocal enabledelayedexpansion

set "SCRIPT_DIR=%~dp0"
set "MESH_DIR=%SCRIPT_DIR%.."
set "CONFIG_DIR=%MESH_DIR%\config\iam"
set "EXPORT_FILE=%CONFIG_DIR%\realm-demosetup.json"
set "TEMP_EXPORT_DIR=%TEMP%\keycloak-export-%RANDOM%"

echo.
echo === Keycloak Realm Export ===
echo Exporting athyper realm to: %EXPORT_FILE%
echo.

REM Ensure config directory exists
if not exist "%CONFIG_DIR%" mkdir "%CONFIG_DIR%"

REM Check if IAM container is running
docker ps --format "{{.Names}}" | findstr /C:"athyper-mesh-iam" >nul 2>&1
if errorlevel 1 (
    echo Error: Keycloak ^(IAM^) container is not running
    echo Start it with: cd mesh ^&^& up.bat --profile mesh
    exit /b 1
)

REM Get database credentials from running Keycloak container
echo Reading database credentials from Keycloak container...
for /f "tokens=*" %%i in ('docker exec athyper-mesh-iam-1 printenv KC_DB_URL 2^>nul') do set "IAM_DB_URL=%%i"
for /f "tokens=*" %%i in ('docker exec athyper-mesh-iam-1 printenv KC_DB_USERNAME 2^>nul') do set "IAM_DB_USERNAME=%%i"
for /f "tokens=*" %%i in ('docker exec athyper-mesh-iam-1 printenv KC_DB_PASSWORD 2^>nul') do set "IAM_DB_PASSWORD=%%i"

if "%IAM_DB_URL%"=="" set "IAM_DB_URL=jdbc:postgresql://dbpool-auth:6433/athyperauth_dev1"
if "%IAM_DB_USERNAME%"=="" set "IAM_DB_USERNAME=athyperadmin"

if "%IAM_DB_PASSWORD%"=="" (
    echo Error: Cannot determine database password
    echo Set IAM_DB_PASSWORD environment variable or check container
    exit /b 1
)

echo [1/4] Creating temporary export directory...
mkdir "%TEMP_EXPORT_DIR%" 2>nul

echo [2/4] Running Keycloak export...
docker run --rm ^
  --network athyper-mesh-edge ^
  -v "%TEMP_EXPORT_DIR%:/opt/keycloak/data/export" ^
  -e KC_DB=postgres ^
  -e KC_DB_URL=%IAM_DB_URL% ^
  -e KC_DB_USERNAME=%IAM_DB_USERNAME% ^
  -e KC_DB_PASSWORD=%IAM_DB_PASSWORD% ^
  quay.io/keycloak/keycloak:26.5.1 ^
  export ^
  --dir /opt/keycloak/data/export ^
  --users realm_file ^
  --realm athyper

if errorlevel 1 (
    echo Export failed!
    rmdir /s /q "%TEMP_EXPORT_DIR%" 2>nul
    exit /b 1
)

echo [3/4] Moving export to config directory...
if exist "%TEMP_EXPORT_DIR%\athyper-realm.json" (
    move /y "%TEMP_EXPORT_DIR%\athyper-realm.json" "%EXPORT_FILE%" >nul
) else (
    echo Error: Export file not found
    rmdir /s /q "%TEMP_EXPORT_DIR%" 2>nul
    exit /b 1
)

echo [4/4] Cleaning up...
rmdir /s /q "%TEMP_EXPORT_DIR%" 2>nul

echo.
echo Export completed successfully!
echo Exported to: %EXPORT_FILE%
echo.
echo What's exported:
echo   - Realm configuration (athyper)
echo   - Clients and client scopes
echo   - Roles (realm and client)
echo   - Groups and users
echo   - Authentication flows
echo   - Organizations
echo.
echo To import this configuration:
echo   initdb-iam.bat
echo.
