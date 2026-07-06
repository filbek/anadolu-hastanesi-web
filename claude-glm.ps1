$envFile = Join-Path $PSScriptRoot ".env.glm"
if (-not (Test-Path $envFile)) {
    Write-Error ".env.glm not found next to this script."
    exit 1
}

Get-Content $envFile | ForEach-Object {
    if ($_ -match '^\s*([^#=]+)\s*=\s*(.*)\s*$') {
        [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
    }
}

Write-Host "GLM-5.2 aktif (ANTHROPIC_BASE_URL=$env:ANTHROPIC_BASE_URL, model=$env:ANTHROPIC_MODEL)" -ForegroundColor Cyan
claude @args
