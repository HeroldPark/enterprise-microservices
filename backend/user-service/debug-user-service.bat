@echo off
echo ========================================
echo Starting User Service in Debug Mode
echo Debug Port: 5005
echo ========================================

cd /d D:\Workspace\Workspace-iot\enterprise-microservices

set SPRING_DATASOURCE_URL=jdbc:mariadb://localhost:13306/user-db?useUnicode=true^&characterEncoding=UTF-8
set SPRING_DATASOURCE_USERNAME=rozeta
set SPRING_DATASOURCE_PASSWORD=rozeta123
set EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://localhost:8761/eureka/

echo.
echo Starting service... (Ctrl+C to stop)
echo Attach debugger from VS Code (Port 5005)
echo.

gradlew.bat :backend:user-service:bootRun ^
  -Dspring-boot.run.jvmArguments="-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005"