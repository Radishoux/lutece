
$instancesIndex = $args.IndexOf("--instances")
if ($instancesIndex -ne -1 -and $instancesIndex -lt ($args.Count - 1)) {
  $instancesValue = $args[$instancesIndex + 1]
  Write-Host "Value after --instances flag: $instancesValue"
} else {
  Write-Host "No value found after --instances flag so default value is used (1)"
  $instancesValue = 1
}

# Start express server
$expressProcess = Start-Process -FilePath "node" -ArgumentList "../express/index.js" -PassThru

# Start worker
$workerProcess = Start-Process -FilePath "node" -ArgumentList ("../worker/index.js", $instancesValue) -PassThru

# Wait for both processes to complete
$expressProcess.WaitForExit()
$workerProcess.WaitForExit()

# Get the exit codes if needed
$expressExitCode = $expressProcess.ExitCode
$workerExitCode = $workerProcess.ExitCode

# Display the exit codes
Write-Host "Express server exit code: $expressExitCode"
Write-Host "Worker exit code: $workerExitCode"

