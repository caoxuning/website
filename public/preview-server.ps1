param([switch]$NoBrowser)

$ErrorActionPreference = 'Stop'
$root = [System.IO.Path]::GetFullPath($PSScriptRoot)
$rootPrefix = $root.TrimEnd('\') + '\'
$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, 0)
$listener.Start()
$url = "http://127.0.0.1:$($listener.LocalEndpoint.Port)/"
Write-Output $url
if (-not $NoBrowser) { Start-Process $url }

try {
  while ($true) {
    $client = $listener.AcceptTcpClient()
    try {
      $client.ReceiveTimeout = 5000
      $client.SendTimeout = 5000
      $stream = $client.GetStream()
      $reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::ASCII, $false, 1024, $true)
      $request = $reader.ReadLine()
      if (-not $request) { continue }
      do { $line = $reader.ReadLine() } while ($null -ne $line -and $line.Length -gt 0)

      $parts = $request.Split(' ')
      $method = $parts[0]
      $status = '200 OK'
      $type = 'text/plain; charset=utf-8'
      $body = [byte[]]@()

      if ($parts.Length -lt 2 -or $method -notin @('GET', 'HEAD')) {
        $status = '405 Method Not Allowed'
      } else {
        $requestPath = [System.Uri]::UnescapeDataString(($parts[1] -split '[?#]')[0])
        $relative = $requestPath.TrimStart('/')
        if (-not $relative) { $relative = 'index.html' }
        $path = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($root, $relative.Replace('/', '\')))
        if (-not $path.StartsWith($rootPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
          $status = '403 Forbidden'
        } elseif (-not [System.IO.File]::Exists($path)) {
          $status = '404 Not Found'
        } else {
          $body = [System.IO.File]::ReadAllBytes($path)
          switch ([System.IO.Path]::GetExtension($path).ToLowerInvariant()) {
            '.html' { $type = 'text/html; charset=utf-8' }
            '.css' { $type = 'text/css; charset=utf-8' }
            '.js' { $type = 'text/javascript; charset=utf-8' }
            '.png' { $type = 'image/png' }
            '.jpg' { $type = 'image/jpeg' }
            '.woff2' { $type = 'font/woff2' }
          }
        }
      }

      if ($status -ne '200 OK') { $body = [System.Text.Encoding]::UTF8.GetBytes($status) }
      $header = "HTTP/1.1 $status`r`nContent-Type: $type`r`nContent-Length: $($body.Length)`r`nConnection: close`r`nCache-Control: no-store`r`n`r`n"
      $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
      $stream.Write($headerBytes, 0, $headerBytes.Length)
      if ($method -ne 'HEAD') { $stream.Write($body, 0, $body.Length) }
      $stream.Flush()
    } catch {
      Write-Warning $_.Exception.Message
    } finally {
      $client.Dispose()
    }
  }
} finally {
  $listener.Stop()
}
