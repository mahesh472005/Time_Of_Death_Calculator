@echo off
echo Starting TOD Calculator Backend...
cd /d "%~dp0.."
cd backend
echo.
echo Running Maven Spring Boot application...
echo API will be available at: http://localhost:8080
echo.
mvn clean spring-boot:run
pause
