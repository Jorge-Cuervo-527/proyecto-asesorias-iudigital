#!/bin/bash
# ============================================================
# test_monolito.sh — Suite de Pruebas cURL para el Monolito
# Base URL: http://localhost:3000
# Uso: bash scripts/test_monolito.sh
# ============================================================

BASE="http://localhost:3000"
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
echo "   Suite de Pruebas - Monolito IUDigital"
echo "============================================================"

echo ""
echo ">> [1] Healthcheck"
R=$(curl -s $BASE/health)
check "Health retorna status UP" '"status":"UP"' "$R"

echo ""
echo ">> [2] TiposProyecto"
R=$(curl -s $BASE/api/tipos-proyecto)
check "GET /api/tipos-proyecto retorna success:true" '"success":true' "$R"

R=$(curl -s -X POST $BASE/api/tipos-proyecto \
  -H "Content-Type: application/json" \
  -d '{"nombre":"ensayo"}')
check "POST /api/tipos-proyecto crea tipo 'ensayo'" '"success":true' "$R"
TIPO_ID=$(echo $R | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)

R=$(curl -s -X POST $BASE/api/tipos-proyecto \
  -H "Content-Type: application/json" \
  -d '{"nombre":"invalido_x"}')
check "POST con enum inválido retorna 400" '"success":false' "$R"

echo ""
echo ">> [3] Clientes"
R=$(curl -s -X POST $BASE/api/clientes \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Test Cliente","email":"test@correo.com"}')
check "POST /api/clientes crea cliente" '"success":true' "$R"
CLIENTE_ID=$(echo $R | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)

R=$(curl -s -X POST $BASE/api/clientes \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Test Cliente","email":"test@correo.com"}')
check "POST cliente con email duplicado retorna 409" '"success":false' "$R"

R=$(curl -s -X POST $BASE/api/clientes \
  -H "Content-Type: application/json" \
  -d '{"nombre":"AB","email":"test2@correo.com"}')
check "POST cliente con nombre corto retorna 400" '"success":false' "$R"

echo ""
echo ">> [4] Universidades"
R=$(curl -s -X POST $BASE/api/universidades \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Universidad Test","direccion":"Calle 1","telefono":"123456"}')
check "POST /api/universidades crea universidad" '"success":true' "$R"
UNIV_ID=$(echo $R | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)

echo ""
echo ">> [5] Etapas"
R=$(curl -s -X POST $BASE/api/etapas \
  -H "Content-Type: application/json" \
  -d '{"nombre":"anteproyecto"}')
check "POST /api/etapas crea etapa" '"success":true' "$R"
ETAPA_ID=$(echo $R | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)

echo ""
echo ">> [6] Proyectos"
R=$(curl -s -X POST $BASE/api/proyectos \
  -H "Content-Type: application/json" \
  -d "{
    \"numero\":\"TEST-001\",
    \"titulo\":\"Proyecto de Prueba cURL\",
    \"fechaIniciacion\":\"2026-01-01\",
    \"fechaEntrega\":\"2026-12-31\",
    \"valor\":1500000,
    \"cliente\":\"$CLIENTE_ID\",
    \"tipoProyecto\":\"$TIPO_ID\",
    \"universidad\":\"$UNIV_ID\",
    \"etapa\":\"$ETAPA_ID\"
  }")
check "POST /api/proyectos crea proyecto" '"success":true' "$R"
PRY_ID=$(echo $R | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)

R=$(curl -s $BASE/api/proyectos)
check "GET /api/proyectos lista con populate" '"success":true' "$R"

R=$(curl -s -X PUT $BASE/api/proyectos/$PRY_ID \
  -H "Content-Type: application/json" \
  -d '{"etapa":"'"$ETAPA_ID"'"}')
check "PUT /api/proyectos/:id actualiza proyecto" '"success":true' "$R"

echo ""
echo "============================================================"
echo "  RESULTADOS: $PASS PASS / $FAIL FAIL"
echo "============================================================"
[ $FAIL -eq 0 ] && exit 0 || exit 1
