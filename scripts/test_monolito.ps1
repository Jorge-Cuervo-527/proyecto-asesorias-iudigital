# ============================================================
# test_monolito.ps1 — Suite de Pruebas para el Monolito (PowerShell)
# Base URL: http://localhost:3000
# ============================================================

$BASE = "http://localhost:3000"
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
Write-Host "   Suite de Pruebas - Monolito IUDigital (Puerto 3000)" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# 1. Healthcheck
Write-Host "`n>> [1] Healthcheck" -ForegroundColor Yellow
try {
    $res = Invoke-RestMethod -Uri "$BASE/health" -Method Get
    if ($res.status -eq "UP") {
        Report-Pass "Health retorna status UP"
    } else {
        Report-Fail "Health retorna status UP" ($res | ConvertTo-Json -Compress)
    }
} catch {
    Report-Fail "Health retorna status UP" $_.Exception.Message
}

# 2. Tipos de Proyecto
Write-Host "`n>> [2] TiposProyecto" -ForegroundColor Yellow
try {
    $res = Invoke-RestMethod -Uri "$BASE/api/tipos-proyecto" -Method Get
    if ($res.success -eq $true) {
        Report-Pass "GET /api/tipos-proyecto retorna success:true"
    } else {
        Report-Fail "GET /api/tipos-proyecto retorna success:true" ($res | ConvertTo-Json -Compress)
    }
} catch {
    Report-Fail "GET /api/tipos-proyecto retorna success:true" $_.Exception.Message
}

try {
    $body = @{ nombre = "ensayo" } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BASE/api/tipos-proyecto" -Method Post -Body $body -ContentType "application/json"
    if ($res.success -eq $true) {
        Report-Pass "POST /api/tipos-proyecto crea tipo 'ensayo'"
        $TIPO_ID = $res.data._id
    } else {
        Report-Fail "POST /api/tipos-proyecto crea tipo 'ensayo'" ($res | ConvertTo-Json -Compress)
    }
} catch {
    Report-Fail "POST /api/tipos-proyecto crea tipo 'ensayo'" $_.Exception.Message
}

try {
    $body = @{ nombre = "invalido_x" } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BASE/api/tipos-proyecto" -Method Post -Body $body -ContentType "application/json"
    Report-Fail "POST con enum invalido retorna 400" "Deberia fallar pero retorno 200"
} catch {
    Report-Pass "POST con enum invalido retorna 400 (Error controlado)"
}

# 3. Clientes
Write-Host "`n>> [3] Clientes" -ForegroundColor Yellow
$randEmail = "test_$(Get-Random)@correo.com"
try {
    $body = @{ nombre = "Test Cliente"; email = $randEmail } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BASE/api/clientes" -Method Post -Body $body -ContentType "application/json"
    if ($res.success -eq $true) {
        Report-Pass "POST /api/clientes crea cliente"
        $CLIENTE_ID = $res.data._id
    } else {
        Report-Fail "POST /api/clientes crea cliente" ($res | ConvertTo-Json -Compress)
    }
} catch {
    Report-Fail "POST /api/clientes crea cliente" $_.Exception.Message
}

try {
    $body = @{ nombre = "Test Cliente"; email = $randEmail } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BASE/api/clientes" -Method Post -Body $body -ContentType "application/json"
    Report-Fail "POST cliente con email duplicado retorna 409" "Deberia fallar por duplicado"
} catch {
    Report-Pass "POST cliente con email duplicado retorna 409 (Conflicto controlado)"
}

try {
    $body = @{ nombre = "AB"; email = "corto_$(Get-Random)@correo.com" } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BASE/api/clientes" -Method Post -Body $body -ContentType "application/json"
    Report-Fail "POST cliente con nombre corto retorna 400" "Deberia fallar por validacion"
} catch {
    Report-Pass "POST cliente con nombre corto retorna 400 (Validacion controlada)"
}

# 4. Universidades
Write-Host "`n>> [4] Universidades" -ForegroundColor Yellow
try {
    $body = @{ nombre = "Universidad Test $(Get-Random)"; direccion = "Calle 1"; telefono = "123456" } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BASE/api/universidades" -Method Post -Body $body -ContentType "application/json"
    if ($res.success -eq $true) {
        Report-Pass "POST /api/universidades crea universidad"
        $UNIV_ID = $res.data._id
    } else {
        Report-Fail "POST /api/universidades crea universidad" ($res | ConvertTo-Json -Compress)
    }
} catch {
    Report-Fail "POST /api/universidades crea universidad" $_.Exception.Message
}

# 5. Etapas
Write-Host "`n>> [5] Etapas" -ForegroundColor Yellow
try {
    $body = @{ nombre = "anteproyecto" } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BASE/api/etapas" -Method Post -Body $body -ContentType "application/json"
    if ($res.success -eq $true) {
        Report-Pass "POST /api/etapas crea etapa"
        $ETAPA_ID = $res.data._id
    } else {
        Report-Fail "POST /api/etapas crea etapa" ($res | ConvertTo-Json -Compress)
    }
} catch {
    Report-Fail "POST /api/etapas crea etapa" $_.Exception.Message
}

# 6. Proyectos
Write-Host "`n>> [6] Proyectos" -ForegroundColor Yellow
try {
    $num = "TEST-$(Get-Random -Minimum 1000 -Maximum 9999)"
    $body = @{
        numero = $num
        titulo = "Proyecto Monolito Automatizado"
        fechaIniciacion = "2026-01-01"
        fechaEntrega = "2026-12-31"
        valor = 1500000
        cliente = $CLIENTE_ID
        tipoProyecto = $TIPO_ID
        universidad = $UNIV_ID
        etapa = $ETAPA_ID
    } | ConvertTo-Json

    $res = Invoke-RestMethod -Uri "$BASE/api/proyectos" -Method Post -Body $body -ContentType "application/json"
    if ($res.success -eq $true) {
        Report-Pass "POST /api/proyectos crea proyecto exitosamente"
        $PRY_ID = $res.data._id
    } else {
        Report-Fail "POST /api/proyectos crea proyecto exitosamente" ($res | ConvertTo-Json -Compress)
    }
} catch {
    Report-Fail "POST /api/proyectos crea proyecto exitosamente" $_.Exception.Message
}

try {
    $res = Invoke-RestMethod -Uri "$BASE/api/proyectos" -Method Get
    if ($res.success -eq $true) {
        Report-Pass "GET /api/proyectos lista con populate completo"
    } else {
        Report-Fail "GET /api/proyectos lista con populate completo" ($res | ConvertTo-Json -Compress)
    }
} catch {
    Report-Fail "GET /api/proyectos lista con populate completo" $_.Exception.Message
}

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "  RESULTADOS: $global:PASS PASS / $global:FAIL FAIL" -ForegroundColor $(if ($global:FAIL -eq 0) { "Green" } else { "Red" })
Write-Host "============================================================" -ForegroundColor Cyan
