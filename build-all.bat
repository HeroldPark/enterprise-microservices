@echo off
echo ========================================
echo Building All Microservices
echo ========================================

cd /d D:\Workspace\Workspace-iot\enterprise-microservices

echo.
echo Building all services...
call gradlew.bat clean build -x test

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ========================================
    echo ERROR: Build failed!
    echo ========================================
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ========================================
echo All Services Built Successfully!
echo ========================================
echo.
echo Generated JARs:
echo.

for /r backend %%f in (*.jar) do (
    if not "%%~nxf"=="gradle-wrapper.jar" (
        echo %%f
    )
)

echo.
pause