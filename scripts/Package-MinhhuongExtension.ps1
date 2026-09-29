param(
  [ValidatePattern('^https?://[^/]+(?::\d+)?$')]
  [string]$ApiUrl = 'http://localhost:4000'
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$extensionRoot = Join-Path $projectRoot 'minhhuongextension'
$outputRoot = Join-Path $projectRoot 'output\minhhuongextension'
New-Item -ItemType Directory -Force -Path $outputRoot | Out-Null
$fileNames = @('manifest.json', 'rules.json', 'background.js', 'content.js', 'policy.mjs', 'popup.html', 'popup.js', 'blocked.html', 'blocked.js', 'style.css', 'README.md')
$manifest = Get-Content -Raw (Join-Path $extensionRoot 'manifest.json') | ConvertFrom-Json
$archive = Join-Path $outputRoot "minhhuongextension-$($manifest.version).zip"
$staging = Join-Path $outputRoot ("package-staging-" + [guid]::NewGuid().ToString('N'))
$resolvedOutput = [IO.Path]::GetFullPath($outputRoot).TrimEnd([IO.Path]::DirectorySeparatorChar) + [IO.Path]::DirectorySeparatorChar
$resolvedStaging = [IO.Path]::GetFullPath($staging)
if (-not $resolvedStaging.StartsWith($resolvedOutput, [StringComparison]::OrdinalIgnoreCase)) {
  throw 'Unsafe extension staging path.'
}

try {
  New-Item -ItemType Directory -Path $staging | Out-Null
  foreach ($fileName in $fileNames) {
    Copy-Item -LiteralPath (Join-Path $extensionRoot $fileName) -Destination (Join-Path $staging $fileName)
  }

  $popupPath = Join-Path $staging 'popup.html'
  $popup = Get-Content -Raw $popupPath
  $escapedApiUrl = [System.Net.WebUtility]::HtmlEncode($ApiUrl.TrimEnd('/'))
  $popup = $popup.Replace('value="http://localhost:4000"', "value=`"$escapedApiUrl`"")
  [IO.File]::WriteAllText($popupPath, $popup, [Text.UTF8Encoding]::new($false))

  Compress-Archive -Path (Join-Path $staging '*') -DestinationPath $archive -Force
  Write-Output "Extension package: $archive"
  Write-Output "API origin embedded in package: $ApiUrl"
} finally {
  if (Test-Path -LiteralPath $staging) {
    Remove-Item -LiteralPath $staging -Recurse -Force
  }
}
