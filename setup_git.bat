@echo off
git init
git add .
git commit -m "Initial commit: Hydra-X System v1.0"
git branch -M main
git remote remove origin
git remote add origin https://github.com/Quantum-Fiend/Execor.git
git push -u origin main
