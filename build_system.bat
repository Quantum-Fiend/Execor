@echo off
echo ====================================
echo HYDRA-X: Advanced Distributed System
echo ====================================

echo [1/3] Building Control Plane...
cd control-plane
go build -o ../control-plane.exe ./cmd/server/main.go
if %errorlevel% neq 0 exit /b %errorlevel%
echo    SUCCESS.
cd ..

echo [2/3] Installing Dashboard Dependencies...
cd dashboard
call npm install
cd ..

echo [3/3] System Ready.
echo.
echo To run the system:
echo 1. Run 'control-plane.exe'
echo 2. cd dashboard && npm run dev
echo.
pause
