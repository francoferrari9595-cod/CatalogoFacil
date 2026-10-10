$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

Write-Host '============================================================' -ForegroundColor Green
Write-Host '      CATALOGO FACIL - PUBLICADOR SIN WRANGLER' -ForegroundColor Green
Write-Host '============================================================' -ForegroundColor Green
Write-Host ''
Write-Host 'Esta configuracion se hace SOLO UNA VEZ por el propietario.' -ForegroundColor Yellow
Write-Host 'Los clientes NO tendran que usar tokens, GitHub ni Cloudflare.' -ForegroundColor Yellow
Write-Host ''

$workerFile = Join-Path $PSScriptRoot 'publisher\worker.js'
$configFile = Join-Path $PSScriptRoot 'public\api-config.js'

Write-Host '[1/3] Abriendo Cloudflare Workers...' -ForegroundColor Cyan
Start-Process 'https://dash.cloudflare.com/?to=/:account/workers-and-pages'
Start-Process notepad.exe $workerFile

Write-Host ''
Write-Host '============================================================' -ForegroundColor Yellow
Write-Host 'CONFIGURACION UNICA EN CLOUDFLARE' -ForegroundColor Yellow
Write-Host '============================================================' -ForegroundColor Yellow
Write-Host ''
Write-Host 'En Cloudflare:' -ForegroundColor White
Write-Host '1) Workers & Pages -> Create -> Worker.'
Write-Host '2) Nombre: catalogo-facil-publisher (o el que quieras).'
Write-Host '3) Deploya el Worker de ejemplo.'
Write-Host '4) En Edit code, reemplaza el codigo por publisher\worker.js.'
Write-Host '5) En Settings -> Bindings, agrega una KV Namespace binding:'
Write-Host '      Variable name: CATALOGS'
Write-Host '      Namespace: crea una nueva llamada CATALOGO_FACIL'
Write-Host '6) Guarda y vuelve a Deploy.'
Write-Host '7) Copia la URL publica del Worker.'
Write-Host ''
Write-Host 'La URL puede ser *.workers.dev o un dominio propio del Worker.' -ForegroundColor Cyan
Write-Host 'No hace falta crear ningun token para los clientes.' -ForegroundColor Green
Write-Host 'Esta configuracion es solamente del propietario.' -ForegroundColor Green
Write-Host ''

$workerUrl = Read-Host 'Pegá aqui la URL PUBLICA DEL WORKER (Enter = usar la URL ya configurada)'

# Si se deja vacio, conserva la URL configurada por defecto.
$workerUrl = [string]$workerUrl
if ([string]::IsNullOrWhiteSpace($workerUrl)) { $workerUrl = 'https://catalogo-facil-publisher.francoferrari9595.workers.dev' }
$workerUrl = $workerUrl.Trim()
$workerUrl = $workerUrl.Trim('"', "'")
$workerUrl = $workerUrl.Trim()

try {
    $uri = [System.Uri]$workerUrl
} catch {
    throw "La URL ingresada no es valida. Debe comenzar con https://"
}

if ($uri.Scheme -ne 'https' -or [string]::IsNullOrWhiteSpace($uri.Host)) {
    throw "La URL debe ser una direccion HTTPS completa, por ejemplo: https://catalogo-facil-publisher.tucuenta.workers.dev"
}

$normalizedUrl = $uri.GetLeftPart([System.UriPartial]::Path).TrimEnd('/')

# Guardar sin ninguna comprobacion de workers.dev.
Set-Content -LiteralPath $configFile -Value ("window.CATALOGO_FACIL_API='" + $normalizedUrl.Replace("'", "\\'") + "';") -Encoding UTF8

Write-Host ''
Write-Host '============================================================' -ForegroundColor Green
Write-Host 'PUBLICADOR CONFIGURADO CORRECTAMENTE' -ForegroundColor Green
Write-Host '============================================================' -ForegroundColor Green
Write-Host ('URL guardada: ' + $normalizedUrl) -ForegroundColor White
Write-Host ''
Write-Host 'Ahora ejecuta SUBIR_A_GITHUB.bat' -ForegroundColor Cyan
Write-Host 'El cliente final NO necesitara tokens ni Cloudflare.' -ForegroundColor Green
Write-Host ''
Read-Host 'Presiona ENTER para cerrar'
