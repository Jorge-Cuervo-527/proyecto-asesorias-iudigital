# ✅ Pruebas y Validación — IUDigital

## 1. Cargar Datos de Prueba (Seed)

Antes de ejecutar cualquier prueba, pobla la base de datos:

### Monolito

```bash
# Si corre localmente
cd backend-monolito
npm run seed

# Si corre en Docker
docker exec -it monolito-app node src/seed.js
```

**Salida esperada:**
```
[Seed] Conectando a la base de datos...
[MongoDB] Conectado exitosamente a: localhost/asesorias_monolito_db
[Seed] Limpiando colecciones existentes...
[Seed] Insertando Tipos de Proyecto...
[Seed] Insertando Clientes...
[Seed] Insertando Universidades...
[Seed] Insertando Etapas...
[Seed] Insertando Proyectos de Asesoría de Prueba...
[Seed] Datos poblados exitosamente:
- Tipos de Proyecto: 5
- Clientes: 3
- Universidades: 3
- Etapas: 4
- Proyectos: 2
[Seed] Conexión a BD cerrada.
```

### Microservicios

```bash
docker exec -it servicio-catalogos node src/seed.js
# El servicio-proyectos no tiene seed propio; los proyectos se crean vía API.
```

---

## 2. Ejecutar Scripts de Prueba Automatizados

```bash
# Pruebas del monolito (requiere el servidor en :3000)
bash scripts/test_monolito.sh

# Pruebas de microservicios (requiere :4001 y :4002)
bash scripts/test_desacoplado.sh
```

**Salida esperada:**
```
============================================================
   Suite de Pruebas - Monolito IUDigital
============================================================

>> [1] Healthcheck
  ✅ PASS: Health retorna status UP

>> [2] TiposProyecto
  ✅ PASS: GET /api/tipos-proyecto retorna success:true
  ✅ PASS: POST /api/tipos-proyecto crea tipo 'ensayo'
  ✅ PASS: POST con enum inválido retorna 400

...

============================================================
  RESULTADOS: 11 PASS / 0 FAIL
============================================================
```

---

## 3. Pruebas Manuales con cURL

### Prueba 1 — Healthcheck del monolito

```bash
curl http://localhost:3000/health
```

**Respuesta esperada (200 OK):**
```json
{
  "status": "UP",
  "service": "backend-monolito",
  "timestamp": "2026-11-23T16:00:00.000Z"
}
```

---

### Prueba 2 — Crear un tipo de proyecto (éxito)

```bash
curl -X POST http://localhost:3000/api/tipos-proyecto \
  -H "Content-Type: application/json" \
  -d '{"nombre": "ensayo"}'
```

**Respuesta esperada (201 Created):**
```json
{
  "success": true,
  "message": "Tipo de proyecto creado exitosamente",
  "data": {
    "_id": "6650a1b2c3d4e5f6a7b8c9d0",
    "nombre": "ensayo",
    "fechaCreacion": "2026-11-23T16:00:00.000Z",
    "fechaActualizacion": "2026-11-23T16:00:00.000Z"
  }
}
```

---

### Prueba 3 — Enum inválido (error esperado)

```bash
curl -X POST http://localhost:3000/api/tipos-proyecto \
  -H "Content-Type: application/json" \
  -d '{"nombre": "tesis_doctoral"}'
```

**Respuesta esperada (400 Bad Request):**
```json
{
  "success": false,
  "message": "Error de validación en los datos enviados",
  "errors": [
    "Tipo de proyecto inválido. Valores permitidos: ensayo, artículo, monografía, trabajo final de pregrado, trabajo final de especialización"
  ]
}
```

---

### Prueba 4 — Crear cliente y verificar email duplicado

```bash
# Primer registro (exitoso)
curl -X POST http://localhost:3000/api/clientes \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Jorge Hernandez", "email": "jorge@correo.com"}'

# Segundo registro con mismo email (debe fallar)
curl -X POST http://localhost:3000/api/clientes \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Otro Usuario", "email": "jorge@correo.com"}'
```

**Segunda respuesta esperada (409 Conflict):**
```json
{
  "success": false,
  "message": "El email 'jorge@correo.com' ya se encuentra registrado en el sistema",
  "campo": "email",
  "valor": "jorge@correo.com"
}
```

---

### Prueba 5 — Número de proyecto duplicado (error esperado)

```bash
# Primero crear el proyecto inicial (con IDs válidos de seed)
curl -X POST http://localhost:3000/api/proyectos \
  -H "Content-Type: application/json" \
  -d '{
    "numero": "PRY-TEST-001",
    "titulo": "Proyecto de Prueba",
    "fechaIniciacion": "2026-01-01",
    "fechaEntrega": "2026-12-31",
    "valor": 1000000,
    "cliente": "REEMPLAZA_CON_ID_REAL",
    "tipoProyecto": "REEMPLAZA_CON_ID_REAL",
    "universidad": "REEMPLAZA_CON_ID_REAL",
    "etapa": "REEMPLAZA_CON_ID_REAL"
  }'

# Intentar crear otro proyecto con el mismo número
# Respuesta esperada: 409 Conflict
```

---

### Prueba 6 — Referencia foránea inexistente (error esperado)

```bash
curl -X POST http://localhost:3000/api/proyectos \
  -H "Content-Type: application/json" \
  -d '{
    "numero": "PRY-ERROR-001",
    "titulo": "Proyecto con ID inválido",
    "fechaIniciacion": "2026-01-01",
    "fechaEntrega": "2026-12-31",
    "valor": 500000,
    "cliente": "000000000000000000000000",
    "tipoProyecto": "000000000000000000000000",
    "universidad": "000000000000000000000000",
    "etapa": "000000000000000000000000"
  }'
```

**Respuesta esperada (404 Not Found):**
```json
{
  "success": false,
  "message": "Cliente con ID '000000000000000000000000' no encontrado"
}
```

---

### Prueba 7 — Listar proyectos con populate completo

```bash
curl http://localhost:3000/api/proyectos
```

**Respuesta esperada:** Los proyectos deben incluir los objetos completos de cliente, tipoProyecto, universidad y etapa (no solo sus IDs).

---

### Prueba 8 — Actualización de etapa de un proyecto (PUT)

```bash
# Reemplaza :id con un ObjectId real de un proyecto existente
curl -X PUT http://localhost:3000/api/proyectos/REEMPLAZA_CON_ID \
  -H "Content-Type: application/json" \
  -d '{"etapa": "REEMPLAZA_CON_ID_DE_ETAPA"}'
```

**Respuesta esperada (200 OK):**
```json
{
  "success": true,
  "message": "Proyecto actualizado exitosamente",
  "data": { "...": "proyecto con nueva etapa populada" }
}
```

---

### Prueba 9 — Validación de catálogos (arquitectura desacoplada)

```bash
# Con IDs reales del catálogo
curl "http://localhost:4001/api/catalogos/validar?clienteId=REEMPLAZA&tipoProyectoId=REEMPLAZA&universidadId=REEMPLAZA&etapaId=REEMPLAZA"
```

**Respuesta esperada (200 OK):**
```json
{
  "valid": true,
  "message": "Todas las referencias existen en el catálogo",
  "datos": { "cliente": {...}, "tipoProyecto": {...}, "universidad": {...}, "etapa": {...} }
}
```

---

### Prueba 10 — Fecha de entrega anterior a fecha de iniciación (error esperado)

```bash
curl -X POST http://localhost:3000/api/proyectos \
  -H "Content-Type: application/json" \
  -d '{
    "numero": "PRY-FECHA-001",
    "titulo": "Proyecto con fechas incorrectas",
    "fechaIniciacion": "2026-12-31",
    "fechaEntrega": "2026-01-01",
    "valor": 1000000,
    "cliente": "REEMPLAZA_CON_ID",
    "tipoProyecto": "REEMPLAZA_CON_ID",
    "universidad": "REEMPLAZA_CON_ID",
    "etapa": "REEMPLAZA_CON_ID"
  }'
```

**Respuesta esperada (400 Bad Request):**
```json
{
  "success": false,
  "message": "Error de validación en los datos enviados",
  "errors": ["La fecha de entrega debe ser posterior a la fecha de iniciación"]
}
```

---

## 4. Importar en Postman

Para crear una colección en Postman manualmente:

1. Abrir Postman → New Collection → "IUDigital Asesorías"
2. Crear carpetas: `TiposProyecto`, `Clientes`, `Universidades`, `Etapas`, `Proyectos`
3. Para cada endpoint agregar una Request con:
   - **Method:** GET / POST / PUT
   - **URL:** `http://localhost:3000/api/tipos-proyecto`
   - **Headers:** `Content-Type: application/json`
   - **Body → raw → JSON:** el payload correspondiente

> [!TIP]
> Puedes usar variables de entorno en Postman. Crea una variable `BASE_URL = http://localhost:3000` y úsala como `{{BASE_URL}}/api/tipos-proyecto`.

---

## 5. Checklist de Criterios de Aceptación

| # | Criterio | Estado |
|---|---|---|
| 1 | Los 5 módulos implementan GET, POST y PUT | ☑ |
| 2 | El campo `numero` en Proyecto es único (retorna 409) | ☑ |
| 3 | Los enums de TipoProyecto y Etapa rechazan valores inválidos (400) | ☑ |
| 4 | La validación de email rechaza formatos incorrectos y duplicados | ☑ |
| 5 | El módulo de Proyectos está analizado y desacoplado | ☑ |
| 6 | Ambos `docker-compose.yml` levantan con `up --build` | ☑ |
| 7 | El `Jenkinsfile` tiene sintaxis declarativa válida y stages completos | ☑ |
| 8 | El pipeline ejecuta Build, Push a Docker Hub y Deploy CD | ☑ |
| 9 | El script seed inserta datos consistentes sin errores | ☑ |
| 10 | Los 8 manuales `.md` están redactados completamente | ☑ |
| 11 | El código está documentado y comentado en español | ☑ |
