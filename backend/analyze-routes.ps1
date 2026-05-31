Clear-Host
Write-Host "Starting Route / Controller Analysis..." -ForegroundColor Cyan

$routePath = "./routes"
$controllerPath = "./controllers"

if (!(Test-Path $routePath)) {
    Write-Host "Routes folder not found: $routePath" -ForegroundColor Red
    exit
}

if (!(Test-Path $controllerPath)) {
    Write-Host "Controllers folder not found: $controllerPath" -ForegroundColor Red
    exit
}

$routeFiles = Get-ChildItem $routePath -Filter "*.js"

foreach ($route in $routeFiles) {

    Write-Host ""
    Write-Host "Analyzing $($route.Name)" -ForegroundColor Yellow

    $content = Get-Content $route.FullName

    # find controller imports
    $imports = $content | Select-String "../controllers"

    foreach ($imp in $imports) {

        $line = $imp.Line.Trim()
        Write-Host "Controller import found:" $line -ForegroundColor Green

        if ($line -match "controllers/(.*)'") {

            $controllerName = $Matches[1]
            $controllerFile = "$controllerPath/$controllerName.js"

            if (Test-Path $controllerFile) {

                Write-Host "Controller exists:" $controllerName -ForegroundColor Cyan

                $exports = Select-String -Path $controllerFile -Pattern "exports\."

                if ($exports.Count -eq 0) {
                    Write-Host "WARNING: No exports found in $controllerName.js" -ForegroundColor Magenta
                }
                else {
                    Write-Host "Exports found:" $exports.Count -ForegroundColor Gray
                }

            }
            else {

                Write-Host "ERROR: Missing controller file $controllerName.js" -ForegroundColor Red

            }

        }

    }

    # check router callbacks
    $routes = $content | Select-String "router."

    foreach ($r in $routes) {

        $line = $r.Line.Trim()

        if ($line -match "undefined") {

            Write-Host "ERROR: Undefined callback detected -> $line" -ForegroundColor Red

        }

    }

}

Write-Host ""
Write-Host "Analysis Complete." -ForegroundColor Cyan
