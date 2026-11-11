param([int]$port = 8000)

$listener = New-Object System.Net.HttpListener
$prefix = "http://localhost:$port/"
$listener.Prefixes.Add($prefix)
try {
    $listener.Start()
} catch {
    $port = 8080
    $prefix = "http://localhost:$port/"
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add($prefix)
    $listener.Start()
}

Write-Output "ALVI Local Web Server started at $prefix"
Write-Output "Open $prefix in your browser to access the prototype."

$root = $PSScriptRoot
if (-not $root) { $root = (Get-Location).Path }

$mimeMap = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".png"  = "image/png"
    ".svg"  = "image/svg+xml"
    ".webm" = "audio/webm"
    ".wav"  = "audio/wav"
    ".mp3"  = "audio/mpeg"
}

try {
    while ($listener.IsListening) {
        try {
            $context = $listener.GetContext()
            $request = $context.Request
            $response = $context.Response

            $path = $request.Url.LocalPath
            if ($path -eq "/" -or [string]::IsNullOrEmpty($path)) {
                $path = "/index.html"
            }

            $cleanPath = $path.TrimStart('/').Replace('/', [System.IO.Path]::DirectorySeparatorChar)
            $localFile = [System.IO.Path]::Combine($root, $cleanPath)

            if ([System.IO.File]::Exists($localFile)) {
                $ext = [System.IO.Path]::GetExtension($localFile).ToLower()
                $mime = if ($mimeMap.ContainsKey($ext)) { $mimeMap[$ext] } else { "application/octet-stream" }
                $response.ContentType = $mime
                $response.Headers.Add("Access-Control-Allow-Origin", "*")

                $bytes = [System.IO.File]::ReadAllBytes($localFile)
                $response.ContentLength64 = $bytes.Length
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            } else {
                $response.StatusCode = 404
                $buffer = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
                $response.OutputStream.Write($buffer, 0, $buffer.Length)
            }
            $response.OutputStream.Close()
        } catch {
            # Ignore individual aborted client requests and continue listening
        }
    }
} finally {
    $listener.Stop()
}

