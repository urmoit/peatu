@echo off
REM Build APK for Peatu (Expo / EAS Build)
REM Usage: build-apk.bat [development|preview|production]

setlocal

cd /d "%~dp0"

set PROFILE=%1
if "%PROFILE%"=="" set PROFILE=development

echo ==========================================
echo Building Android APK
echo Profile: %PROFILE%
echo ==========================================

REM Ensure EAS CLI is available
where eas >nul 2>&1
if %errorlevel% neq 0 (
    echo EAS CLI not found. Installing...
    call npm install -g eas-cli
)

REM Build
call eas build -p android --profile %PROFILE% --non-interactive

echo.
echo Build finished. Check https://expo.dev/accounts/urmoit/projects/peatu-mobile/builds for details.
pause