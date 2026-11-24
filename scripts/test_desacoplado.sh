#!/bin/bash
# ============================================================
# test_desacoplado.sh — Suite de Pruebas cURL para Microservicios
# Catálogos: http://localhost:4001  |  Proyectos: http://localhost:4002
# Uso: bash scripts/test_desacoplado.sh
# ============================================================

CAT="http://localhost:4001"
PRY="http://localhost:4002"
PASS=0
FAIL=0

check() {
  local desc="$1"
  local expected="$2"
  local actual="$3"
  if echo "$actual" | grep -q "$expected"; then
    echo "  ✅ PASS: $desc"
    PASS=$((PASS + 1))
  else
    echo "  ❌ FAIL: $desc"
    echo "     Esperado: $expected"
    echo "     Obtenido: $actual"
    FAIL=$((FAIL + 1))
  fi
}

echo "============================================================"
echo "  Suite de Pruebas - Arquitectura Desacoplada IUDigital"
echo "============================================================"

echo ""
echo ">> [1] Healthchecks"
R=$(curl -s $CAT/health)
check "Catálogos health UP" '"status":"UP"' "$R"
R=$(curl -s $PRY/health)
check "Proyectos health UP" '"status":"UP"' "$R"

echo ""
echo ">> [2] Creación en Catálogos"
R=$(curl -s -X POST $CAT/api/tipos-proyecto \
  -H "Content-Type: application/json" \
  -d '{"nombre":"monografía"}')
check "POST /api/tipos-proyecto en catálogos" '"success":true' "$R"
TIPO_ID=$(echo $R | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)

R=$(curl -s -X POST $CAT/api/clientes \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Cliente Microservicio","email":"microserv@correo.com"}')
check "POST /api/clientes en catálogos" '"success":true' "$R"
CLIENTE_ID=$(echo $R | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)

R=$(curl -s -X POST $CAT/api/universidades \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Universidad Micro","direccion":"Cra 10","telefono":"999"}')
check "POST /api/universidades en catálogos" '"success":true' "$R"
UNIV_ID=$(echo $R | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)

R=$(curl -s -X POST $CAT/api/etapas \
  -H "Content-Type: application/json" \
  -d '{"nombre":"entrega final"}')
check "POST /api/etapas en catálogos" '"success":true' "$R"
ETAPA_ID=$(echo $R | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)

echo ""
echo ">> [3] Validación cruzada de catálogos"
R=$(curl -s "$CAT/api/catalogos/validar?clienteId=$CLIENTE_ID&tipoProyectoId=$TIPO_ID&universidadId=$UNIV_ID&etapaId=$ETAPA_ID")
check "Validación con IDs válidos retorna valid:true" '"valid":true' "$R"

R=$(curl -s "$CAT/api/catalogos/validar?clienteId=000000000000000000000000")
check "Validación con ID inexistente retorna valid:false" '"valid":false' "$R"

echo ""
echo ">> [4] Creación de Proyecto en Microservicio Proyectos"
R=$(curl -s -X POST $PRY/api/proyectos \
  -H "Content-Type: application/json" \
  -d "{
    \"numero\":\"MICRO-001\",
    \"titulo\":\"Proyecto Microservicio Test\",
    \"fechaIniciacion\":\"2026-02-01\",
    \"fechaEntrega\":\"2026-11-30\",
    \"valor\":2000000,
    \"clienteId\":\"$CLIENTE_ID\",
    \"tipoProyectoId\":\"$TIPO_ID\",
    \"universidadId\":\"$UNIV_ID\",
    \"etapaId\":\"$ETAPA_ID\"
  }")
check "POST /api/proyectos en servicio-proyectos" '"success":true' "$R"
PRY_ID=$(echo $R | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)

R=$(curl -s -X POST $PRY/api/proyectos \
  -H "Content-Type: application/json" \
  -d "{
    \"numero\":\"MICRO-001\",
    \"titulo\":\"Duplicado Test\",
    \"fechaIniciacion\":\"2026-02-01\",
    \"fechaEntrega\":\"2026-11-30\",
    \"valor\":1000,
    \"clienteId\":\"$CLIENTE_ID\",
    \"tipoProyectoId\":\"$TIPO_ID\",
    \"universidadId\":\"$UNIV_ID\",
    \"etapaId\":\"$ETAPA_ID\"
  }")
check "POST proyecto duplicado retorna 409" '"success":false' "$R"

R=$(curl -s $PRY/api/proyectos)
check "GET /api/proyectos lista proyectos" '"success":true' "$R"

echo ""
echo "============================================================"
echo "  RESULTADOS: $PASS PASS / $FAIL FAIL"
echo "============================================================"
[ $FAIL -eq 0 ] && exit 0 || exit 1
