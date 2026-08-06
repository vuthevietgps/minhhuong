param(
  [string]$Version = "17.10"
)

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$runtimeDir = Join-Path $projectRoot ".runtime"
$pgRoot = Join-Path $runtimeDir "postgresql-$Version"
$pgCtl = Join-Path $pgRoot "pgsql\bin\pg_ctl.exe"
$dataDir = Join-Path $runtimeDir "pgdata"

if (!(Test-Path $pgCtl) -or !(Test-Path (Join-Path $dataDir "PG_VERSION"))) {
  Write-Host "Local PostgreSQL runtime is not initialized."
  exit 0
}

& $pgCtl -D $dataDir -m fast stop
