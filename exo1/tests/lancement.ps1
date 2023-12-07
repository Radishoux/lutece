# Find the index of "--instances" in the command line arguments
$instancesIndex = $args.IndexOf("--instances")

# Check if "--instances" is present and if there is a value after it
if ($instancesIndex -ne -1 -and $instancesIndex -lt ($args.Count - 1)) {
  # Get the value after "--instances" flag
  $instancesValue = $args[$instancesIndex + 1]
  Write-Host "Value after --instances flag: $instancesValue"
} else {
  # Use the default value if no value is found after "--instances" flag
  Write-Host "No value found after --instances flag so default value is used (1)"
  $instancesValue = 1
}

# Start the Express server
$expressProcess = Start-Process -FilePath "node" -ArgumentList "../express/index.js" -PassThru

# Start the worker with the specified number of instances
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
