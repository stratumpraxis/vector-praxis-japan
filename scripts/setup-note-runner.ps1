param(
  [string]$Repo = "stratumpraxis/vector-praxis-japan",
  [string]$RunnerName = ("vector-note-" + $env:COMPUTERNAME),
  [string]$RunnerDir = "C:\vector-note-runner",
  [string]$ProfileDir = "C:\vector-note-profile"
)

$ErrorActionPreference = "Stop"

function Write-Step([string]$Message) {
  Write-Host ""
  Write-Host "==> $Message" -ForegroundColor Cyan
}

function Ensure-Directory([string]$Path) {
  if (-not (Test-Path $Path)) {
    New-Item -ItemType Directory -Force -Path $Path | Out-Null
  }
}

Write-Step "Checking GitHub CLI"
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  if (Get-Command winget -ErrorAction SilentlyContinue) {
    Write-Host "GitHub CLI not found. Installing with winget..."
    winget install --id GitHub.cli --exact --accept-package-agreements --accept-source-agreements
    $env:Path += ";$env:ProgramFiles\GitHub CLI"
  } else {
    throw "GitHub CLI (gh) is required. Install it from https://cli.github.com/ and run this script again."
  }
}

Write-Step "Checking GitHub authentication"
$authOk = $false
try {
  gh auth status -h github.com 2>$null | Out-Null
  if ($LASTEXITCODE -eq 0) { $authOk = $true }
} catch {}

if (-not $authOk) {
  Write-Host "A GitHub login window will open. Log in with the admin account for $Repo."
  gh auth login --hostname github.com --web --git-protocol https
  if ($LASTEXITCODE -ne 0) { throw "GitHub login failed." }
}

Write-Step "Confirming repository admin access"
$repoJson = gh api "repos/$Repo"
if ($LASTEXITCODE -ne 0) { throw "Could not access $Repo." }
$repoObj = $repoJson | ConvertFrom-Json
if (-not $repoObj.permissions.admin) { throw "The current GitHub account does not have admin permission for $Repo." }

Write-Step "Preparing runner folders"
Ensure-Directory $RunnerDir
Ensure-Directory $ProfileDir
Set-Location $RunnerDir

if (Test-Path (Join-Path $RunnerDir ".runner")) {
  Write-Host "This folder already contains a configured runner." -ForegroundColor Yellow
  Write-Host "Skipping download/configuration and starting the existing runner."
} else {
  Write-Step "Finding latest GitHub Actions Runner for Windows x64"
  $release = Invoke-RestMethod -Uri "https://api.github.com/repos/actions/runner/releases/latest" -Headers @{ "User-Agent" = "Vector-Note-Runner-Setup" }
  $asset = $release.assets | Where-Object { $_.name -match "^actions-runner-win-x64-.*\.zip$" } | Select-Object -First 1
  if (-not $asset) { throw "Could not find a Windows x64 runner package." }
  $zipPath = Join-Path $RunnerDir $asset.name

  Write-Step "Downloading $($asset.name)"
  Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $zipPath -UseBasicParsing

  Write-Step "Extracting runner"
  Expand-Archive -Path $zipPath -DestinationPath $RunnerDir -Force
  Remove-Item $zipPath -Force

  Write-Step "Creating repository runner registration token"
  $registrationToken = gh api --method POST "repos/$Repo/actions/runners/registration-token" --jq ".token"
  if (-not $registrationToken) { throw "Could not create a runner registration token." }

  Write-Step "Registering runner"
  & ".\config.cmd" --url "https://github.com/$Repo" --token $registrationToken --name $RunnerName --labels "note-operator" --work "_work" --unattended --replace
  if ($LASTEXITCODE -ne 0) { throw "Runner configuration failed." }
}

Write-Step "Runner setup complete"
Write-Host "Runner name : $RunnerName"
Write-Host "Runner dir  : $RunnerDir"
Write-Host "note profile: $ProfileDir"
Write-Host ""
Write-Host "A new PowerShell window will start the runner." -ForegroundColor Green
Write-Host "Keep that window open while using Note Operator." -ForegroundColor Yellow

$runCmd = Join-Path $RunnerDir "run.cmd"
if (-not (Test-Path $runCmd)) { throw "run.cmd not found in $RunnerDir" }

Start-Process powershell.exe -ArgumentList @("-NoExit","-ExecutionPolicy","Bypass","-Command","& \"$runCmd\"")

Write-Host ""
Write-Host "Next:" -ForegroundColor Cyan
Write-Host "1. Wait until the runner window says it is listening for jobs."
Write-Host "2. Open GitHub Actions > Note Operator."
Write-Host "3. Run workflow with mode=bootstrap-login."
Write-Host "4. Log in to note in the browser that opens."