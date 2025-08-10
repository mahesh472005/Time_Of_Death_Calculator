@echo off
echo Creating TOD Calculator ZIP package...
cd /d "%~dp0.."
echo.

REM Remove any existing ZIP file
if exist tod-calculator.zip (
    echo Removing existing tod-calculator.zip...
    del tod-calculator.zip
)

REM Create the ZIP file using PowerShell
echo Creating ZIP archive...
powershell -Command "Compress-Archive -Path 'backend', 'frontend', 'scripts', 'README.md' -DestinationPath 'tod-calculator.zip' -Force"

if exist tod-calculator.zip (
    echo.
    echo ✓ Successfully created tod-calculator.zip
    echo.
    dir tod-calculator.zip
) else (
    echo.
    echo ✗ Failed to create ZIP file
)

echo.
pause
