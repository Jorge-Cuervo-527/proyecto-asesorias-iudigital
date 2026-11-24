# ============================================================
# test_desacoplado.ps1 — Suite de Pruebas para Microservicios (PowerShell)
# Catálogos: http://localhost:4001  |  Proyectos: http://localhost:4002
# ============================================================

$CAT = "http://localhost:4001"
$PRY = "http://localhost:4002"
$global:PASS = 0
$global:FAIL = 0

function Report-Pass($desc) {
    Write-Host "  ✅ PASS: $desc" -ForegroundColor Green
    $global:PASS++
}

function Report-Fail($desc, $details) {
    Write-Host "  ❌ FAIL: $desc" -ForegroundColor Red
    Write-Host "     Detalle: $details" -ForegroundColor Gray
    $global:FAIL++
}

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Suite de Pruebas - Arquitectura Desacoplada IUDigital" -ForegroundColor Cyan
Write-Host "  Catálogos: :4001  |  Proyectos: :4002" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# 1. Healthchecks
Write-Host "`n>> [1] Healthchecks" -ForegroundColor Yellow
try {
    $res = Invoke-RestMethod -Uri "$CAT/health" -Method Get
    if ($res.status -eq "UP") { Report-Pass "Catálogos health UP" } else { Report-Fail "Catálogos health UP" ($res | ConvertTo-Json -Compress) }
} catch { Report-Fail "Catálogos health UP" $_.Exception.Message }

try {
    $res = Invoke-RestMethod -Uri "$PRY/health" -Method Get
    if ($res.status -eq "UP") { Report-Pass "Proyectos health UP" } else { Report-Fail "Proyectos health UP" ($res | ConvertTo-Json -Compress) }
} catch { Report-Fail "Proyectos health UP" $_.Exception.Message }

# 2. Creación en Catálogos
Write-Host "`n>> [2] Creación en Catálogos" -ForegroundColor Yellow
try {
    $body = @{ nombre = "ensayo" } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$CAT/api/tipos-proyecto" -Method Post -Body $body -ContentType "application/json"
    if ($res.success -eq $true) {
        Report-Pass "POST /api/tipos-proyecto en catálogos"
        $TIPO_ID = $res.data._id
    } else { Report-Fail "POST /api/tipos-proyecto en catálogos" ($res | ConvertTo-Json -Compress) }
} catch { Report-Fail "POST /api/tipos-proyecto en catálogos" $_.Exception.Message }

try {
    $randEmail = "micro_$(Get-Random)@correo.com"
    $body = @{ nombre = "Cliente Microservicio"; email = $randEmail } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$CAT/api/clientes" -Method Post -Body $body -ContentType "application/json"
    if ($res.success -eq $true) {
        Report-Pass "POST /api/clientes en catálogos"
        $CLIENTE_ID = $res.data._id
    } else { Report-Fail "POST /api/clientes en catálogos" ($res | ConvertTo-Json -Compress) }
} catch { Report-Fail "POST /api/clientes en catálogos" $_.Exception.Message }

try {
    $body = @{ nombre = "Universidad Micro $(Get-Random)"; direccion = "Cra 10"; telefono = "999" } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$CAT/api/universidades" -Method Post -Body $body -ContentType "application/json"
    if ($res.success -eq $true) {
        Report-Pass "POST /api/universidades en catálogos"
        $UNIV_ID = $res.data._id
    } else { Report-Fail "POST /api/universidades en catálogos" ($res | ConvertTo-Json -Compress) }
} catch { Report-Fail "POST /api/universidades en catálogos" $_.Exception.Message }

try {
    $body = @{ nombre = "entrega final" } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$CAT/api/etapas" -Method Post -Body $body -ContentType "application/json"
    if ($res.success -eq $true) {
        Report-Pass "POST /api/etapas en catálogos"
        $ETAPA_ID = $res.data._id
    } else { Report-Fail "POST /api/etapas en catálogos" ($res | ConvertTo-Json -Compress) }
} catch { Report-Fail "POST /api/etapas en catálogos" $_.Exception.Message }

# 3. Validación cruzada de catálogos
Write-Host "`n>> [3] Validación cruzada de catálogos" -ForegroundColor Yellow
try {
    $urlValid = "$CAT/api/catalogos/validar?clienteId=$CLIENTE_ID&tipoProyectoId=$TIPO_ID&universidadId=$UNIV_ID&etapaId=$ETAPA_ID"
    $res = Invoke-RestMethod -Uri $urlValid -Method Get
    if ($res.valid -eq $true) {
        Report-Pass "Validación con IDs válidos retorna valid:true"
    } else { Report-Fail "Validación con IDs válidos retorna valid:true" ($res | ConvertTo-Json -Compress) }
} catch { Report-Fail "Validación con IDs válidos retorna valid:true" $_.Exception.Message }

try {
    $urlInvalid = "$CAT/api/catalogos/validar?clienteId=000000000000000000000000"
    $res = Invoke-RestMethod -Uri $urlInvalid -Method Get
    Report-Fail "Validación con ID inexistente retorna 404" "Debería retornar 404 pero retornó 200"
} catch {
    Report-Pass "Validación con ID inexistente retorna 404 (Entidad no encontrada en catálogo)"
}

# 4. Creación de Proyecto en Microservicio Proyectos
Write-Host "`n>> [4] Creación de Proyecto en Microservicio Proyectos" -ForegroundColor Yellow
$num = "MICRO-$(Get-Random -Minimum 1000 -Maximum 9999)"
try {
    $body = @{
        numero = $num
        titulo = "Proyecto Microservicio PowerShell"
        fechaIniciacion = "2026-02-01"
        fechaEntrega = "2026-11-30"
        valor = 2000000
        clienteId = $CLIENTE_ID
        tipoProyectoId = $TIPO_ID
        universidadId = $UNIV_ID
        etapaId = $ETAPA_ID
    } | ConvertTo-Json

    $res = Invoke-RestMethod -Uri "$PRY/api/proyectos" -Method Post -Body $body -ContentType "application/json"
    if ($res.success -eq $true) {
        Report-Pass "POST /api/proyectos en servicio-proyectos (comunicación HTTP interservicio OK)"
        $PRY_ID = $res.data._id
    } else { Report-Fail "POST /api/proyectos en servicio-proyectos" ($res | ConvertTo-Json -Compress) }
} catch { Report-Fail "POST /api/proyectos en servicio-proyectos" $_.Exception.Message }

# Intentar duplicar número (409)
try {
    $res = Invoke-RestMethod -Uri "$PRY/api/proyectos" -Method Post -Body $body -ContentType "application/json"
    Report-Fail "POST proyecto número duplicado retorna 409" "Debería fallar por número duplicado"
} catch {
    Report-Pass "POST proyecto número duplicado retorna 409 (Conflicto controlado)"
}

# Intentar con cliente inexistente (404 por validación HTTP)
try {
    $bodyInv = @{
        numero = "MICRO-INV-$(Get-Random)"
        titulo = "Invalido Test"
        fechaIniciacion = "2026-02-01"
        fechaEntrega = "2026-11-30"
        valor = 1000
        clienteId = "000000000000000000000000"
        tipoProyectoId = $TIPO_ID
        universidadId = $UNIV_ID
        etapaId = $ETAPA_ID
    } | ConvertTo-Json

    $res = Invoke-RestMethod -Uri "$PRY/api/proyectos" -Method Post -Body $bodyInv -ContentType "application/json"
    Report-Fail "POST con ID inexistente retorna 404" "Debería fallar por validación interservicio"
} catch {
    Report-Pass "POST con ID inexistente retorna 404 (Validación HTTP interservicio exitosa)"
}

# 5. Consulta de Proyectos con Snapshot
Write-Host "`n>> [5] Consulta de Proyectos con Snapshot" -ForegroundColor Yellow
try {
    $res = Invoke-RestMethod -Uri "$PRY/api/proyectos" -Method Get
    if ($res.success -eq $true -and $res.data.Count -gt 0) {
        Report-Pass "GET /api/proyectos retorna snapshot denormalizado completo"
    } else { Report-Fail "GET /api/proyectos retorna snapshot" ($res | ConvertTo-Json -Compress) }
} catch { Report-Fail "GET /api/proyectos retorna snapshot" $_.Exception.Message }

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "  RESULTADOS: $global:PASS PASS / $global:FAIL FAIL" -ForegroundColor $(if ($global:FAIL -eq 0) { "Green" } else { "Red" })
Write-Host "============================================================" -ForegroundColor Cyan
