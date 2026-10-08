$ErrorActionPreference = 'Continue'

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$runId = '{0}-{1}' -f (Get-Date -Format 'yyyyMMdd-HHmmss'), (Get-Random -Minimum 100000 -Maximum 999999)
$resultsDirectory = Join-Path $repoRoot "test-results/local-$runId"
New-Item -ItemType Directory -Path $resultsDirectory -Force | Out-Null

$script:checkResults = @()

function Invoke-LoggedCheck {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][string]$Command,
        [Parameter(Mandatory = $true)][string[]]$Arguments
    )

    $logPath = Join-Path $resultsDirectory "$Name.log"
    Write-Host "`n==> $Name"
    & $Command @Arguments 2>&1 | Tee-Object -FilePath $logPath
    $exitCode = $LASTEXITCODE
    $status = if ($exitCode -eq 0) { 'PASS' } else { 'FAIL' }
    $script:checkResults += [pscustomobject]@{ Name = $Name; Status = $status; ExitCode = $exitCode }
    Write-Host "$status ($exitCode): $Name"
}

$previousHtmlOutput = $env:PLAYWRIGHT_HTML_OUTPUT_DIR
Push-Location $repoRoot
try {
    Invoke-LoggedCheck -Name 'check' -Command 'npm' -Arguments @('run', 'check')
    Invoke-LoggedCheck -Name 'unit' -Command 'npm' -Arguments @('test')
    Invoke-LoggedCheck -Name 'build' -Command 'npm' -Arguments @('run', 'build')

    $env:PLAYWRIGHT_HTML_OUTPUT_DIR = Join-Path $resultsDirectory 'playwright-report'
    Invoke-LoggedCheck -Name 'playwright' -Command 'npm' -Arguments @('run', 'test:e2e', '--', '--reporter=list,html', '--output', (Join-Path $resultsDirectory 'playwright-artifacts'))
}
finally {
    $env:PLAYWRIGHT_HTML_OUTPUT_DIR = $previousHtmlOutput
    Pop-Location
}

$summaryLines = @(
    '# Local test run',
    '',
    "- Started: $(Get-Date -Date ([datetime]::ParseExact($runId.Substring(0, 15), 'yyyyMMdd-HHmmss', $null)) -Format 'o')",
    "- Results: ``test-results/local-$runId/``",
    '',
    '| Check | Result | Exit code | Log |',
    '| --- | --- | ---: | --- |'
)
foreach ($result in $script:checkResults) {
    $summaryLines += "| $($result.Name) | $($result.Status) | $($result.ExitCode) | ``$($result.Name).log`` |"
}
$summaryLines += @('', 'Playwright report: `playwright-report/index.html`')
$summaryPath = Join-Path $resultsDirectory 'summary.md'
Set-Content -Path $summaryPath -Value $summaryLines -Encoding UTF8

Write-Host "`nResults saved to: $resultsDirectory"
if ($script:checkResults.Status -contains 'FAIL') {
    exit 1
}
exit 0