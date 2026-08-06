param(
  [string]$Version = "17.10",
  [string]$User = "minhhuong",
  [string]$Password = "minhhuong",
  [string]$Database = "minhhuong",
  [int]$Port = 5432
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$projectRoot = Split-Path -Parent $PSScriptRoot
$runtimeDir = Join-Path $projectRoot ".runtime"
$archivePath = Join-Path $runtimeDir "postgresql-$Version-1-windows-x64-binaries.zip"
$pgRoot = Join-Path $runtimeDir "postgresql-$Version"
$pgBin = Join-Path $pgRoot "pgsql\bin"
$dataDir = Join-Path $runtimeDir "pgdata"
$logPath = Join-Path $runtimeDir "postgresql.log"
$downloadUrl = "https://get.enterprisedb.com/postgresql/postgresql-$Version-1-windows-x64-binaries.zip"

New-Item -ItemType Directory -Force -Path $runtimeDir | Out-Null

if (!(Test-Path (Join-Path $pgBin "postgres.exe"))) {
  if (!(Test-Path $archivePath)) {
    Write-Host "Downloading PostgreSQL $Version portable binaries..."
    $curl = Get-Command curl.exe -ErrorAction SilentlyContinue
    if ($curl) {
      & $curl.Source -L -C - -o $archivePath $downloadUrl
    } else {
      Invoke-WebRequest -Uri $downloadUrl -OutFile $archivePath -UseBasicParsing
    }
  }

  if (Test-Path $pgRoot) {
    Remove-Item -LiteralPath $pgRoot -Recurse -Force
  }

  New-Item -ItemType Directory -Force -Path $pgRoot | Out-Null
  tar -xf $archivePath -C $pgRoot
}

if (!(Test-Path (Join-Path $dataDir "PG_VERSION"))) {
  $passwordFile = Join-Path $runtimeDir "pg-password.txt"
  Set-Content -Path $passwordFile -Value $Password -NoNewline -Encoding ascii
  New-Item -ItemType Directory -Force -Path $dataDir | Out-Null

  & (Join-Path $pgBin "initdb.exe") `
    -D $dataDir `
    -U $User `
    "--pwfile=$passwordFile" `
    "--auth=scram-sha-256" `
    "--encoding=UTF8" `
    "--locale=C"

  Remove-Item -LiteralPath $passwordFile -Force
}

$listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
  Select-Object -First 1

if ($listener) {
  $process = Get-Process -Id $listener.OwningProcess -ErrorAction SilentlyContinue
  if (!$process -or !$process.Path -or !$process.Path.StartsWith($pgRoot)) {
    throw "Port $Port is already used by another process. Stop it or choose a different port."
  }
} else {
  & (Join-Path $pgBin "pg_ctl.exe") -D $dataDir -l $logPath -o "-p $Port" start
}

$ready = $false
for ($i = 0; $i -lt 30; $i++) {
  & (Join-Path $pgBin "pg_isready.exe") -h localhost -p $Port -U $User | Out-Null
  if ($LASTEXITCODE -eq 0) {
    $ready = $true
    break
  }
  Start-Sleep -Seconds 1
}

if (!$ready) {
  throw "PostgreSQL did not become ready. Check $logPath."
}

$env:PGPASSWORD = $Password
$databaseExists = & (Join-Path $pgBin "psql.exe") `
  -h localhost `
  -p $Port `
  -U $User `
  -d postgres `
  -t `
  -A `
  -c "SELECT 1 FROM pg_database WHERE datname='$Database'"

if (($databaseExists | Select-Object -First 1) -ne "1") {
  & (Join-Path $pgBin "createdb.exe") -h localhost -p $Port -U $User $Database
}

Write-Host "PostgreSQL is ready on localhost:$Port, database '$Database'."
