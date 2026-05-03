$src = Join-Path $PSScriptRoot "..\..\..\Financial Goal Tracker\.agents\skills"
$dst = Join-Path $PSScriptRoot ".agents\skills"
Copy-Item -Path "$src\*" -Destination $dst -Recurse -Force
Write-Host "Skills copied successfully."
