# Автотесты (гонка take + тосты) — Windows
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..
bun test
