# Сборка и/или dev на Windows (PowerShell)
param(
  [switch]$BuildOnly
)
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..
if (-not (Get-Command bun -ErrorAction SilentlyContinue)) {
  Write-Error "Установите Bun: https://bun.sh"
}
bun install
bun run db:migrate
bun run db:seed
if ($BuildOnly) {
  bun run build
  Write-Host "Сборка завершена."
  exit 0
}
bun run dev
