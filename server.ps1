param(
    [int]$Port = 8080
)

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")

try {
    $listener.Start()
    Write-Host "==================================================" -ForegroundColor Cyan
    Write-Host "  VEDASHRI GAVALI PORTFOLIO LOCAL SERVER" -ForegroundColor Green
    Write-Host "  URL: http://localhost:$Port/index.html" -ForegroundColor Yellow
    Write-Host "  Press Ctrl+C to stop the server" -ForegroundColor Gray
    Write-Host "==================================================" -ForegroundColor Cyan
    
    Start-Process "http://localhost:$Port/index.html"

    while ($listener.IsListening) {
        try {
            $context = $listener.GetContext()
            $request = $context.Request
            $response = $context.Response

            $localPath = $request.Url.LocalPath.TrimStart('/')
            if ([string]::IsNullOrWhiteSpace($localPath) -or $localPath -eq '/') {
                $localPath = "index.html"
            }

            $filePath = Join-Path $PSScriptRoot $localPath

            if (Test-Path $filePath -PathType Leaf) {
                $extension = [System.IO.Path]::GetExtension($filePath).ToLowerInvariant()
                $contentType = switch ($extension) {
                    ".html" { "text/html; charset=utf-8" }
                    ".css"  { "text/css; charset=utf-8" }
                    ".js"   { "application/javascript; charset=utf-8" }
                    ".json" { "application/json; charset=utf-8" }
                    ".png"  { "image/png" }
                    ".jpg"  { "image/jpeg" }
                    ".jpeg" { "image/jpeg" }
                    ".svg"  { "image/svg+xml" }
                    ".pdf"  { "application/pdf" }
                    default { "application/octet-stream" }
                }

                $response.ContentType = $contentType
                $bytes = [System.IO.File]::ReadAllBytes($filePath)
                $response.ContentLength64 = $bytes.Length

                if ($request.HttpMethod -ne 'HEAD') {
                    $response.OutputStream.Write($bytes, 0, $bytes.Length)
                }
            } else {
                $response.StatusCode = 404
                $notFoundBytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
                $response.ContentLength64 = $notFoundBytes.Length
                if ($request.HttpMethod -ne 'HEAD') {
                    $response.OutputStream.Write($notFoundBytes, 0, $notFoundBytes.Length)
                }
            }
            $response.Close()
        } catch {
            Write-Host "Request warning: $_" -ForegroundColor DarkGray
        }
    }
} catch {
    Write-Host "Server stopped: $_" -ForegroundColor Red
} finally {
    $listener.Stop()
}
