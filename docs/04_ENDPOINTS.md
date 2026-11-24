# 🔌 Diccionario de Endpoints REST — IUDigital

> [!NOTE]
> Todos los endpoints retornan respuestas en formato JSON. Los campos `fechaCreacion` y `fechaActualizacion` son generados automáticamente por el servidor.

**URL base Monolito:** `http://localhost:3000`
**URL base Catálogos:** `http://localhost:4001`
**URL base Proyectos:** `http://localhost:4002`

---

## 1. Módulo: Tipos de Proyecto

### GET /api/tipos-proyecto

Retorna la lista completa de tipos de proyecto registrados.

**Request:** Sin body ni parámetros.

**Response 200 OK:**
```json
{
  "success": true,
  "total": 2,
  "data": [
    {
      "_id": "6650a1b2c3d4e5f6a7b8c9d0",
      "nombre": "monografía",
      "fechaCreacion": "2026-01-15T10:00:00.000Z",
      "fechaActualizacion": "2026-01-15T10:00:00.000Z"
    }
  ]
}
```

| Código | Descripción |
|---|---|
| `200 OK` | Lista retornada correctamente |
| `500 Internal Server Error` | Error inesperado del servidor |

---

### POST /api/tipos-proyecto

Crea un nuevo tipo de proyecto.

**Body (JSON):**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `nombre` | String | ✅ Sí | Debe ser uno de los valores del enum |

**Valores válidos para `nombre`:**
- `"ensayo"`
- `"artículo"`
- `"monografía"`
- `"trabajo final de pregrado"`
- `"trabajo final de especialización"`

**Request:**
```json
{ "nombre": "monografía" }
```

**Response 201 Created:**
```json
{
  "success": true,
  "message": "Tipo de proyecto creado exitosamente",
  "data": {
    "_id": "6650a1b2c3d4e5f6a7b8c9d0",
    "nombre": "monografía",
    "fechaCreacion": "2026-11-23T16:00:00.000Z",
    "fechaActualizacion": "2026-11-23T16:00:00.000Z"
  }
}
```

**Response 400 Bad Request (enum inválido):**
```json
{
  "success": false,
  "message": "Error de validación en los datos enviados",
  "errors": ["Tipo de proyecto inválido. Valores permitidos: ensayo, artículo, monografía, trabajo final de pregrado, trabajo final de especialización"]
}
```

| Código | Descripción |
|---|---|
| `201 Created` | Tipo creado exitosamente |
| `400 Bad Request` | Campo requerido vacío o valor fuera del enum |
| `500 Internal Server Error` | Error inesperado |

---

### PUT /api/tipos-proyecto/:id

Actualiza el nombre de un tipo de proyecto existente.

**Parámetro URL:** `id` — ObjectId del tipo de proyecto.

**Body (JSON):**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `nombre` | String | ✅ Sí | Nuevo nombre (debe respetar el enum) |

**Request:**
```json
{ "nombre": "artículo" }
```

**Response 200 OK:**
```json
{
  "success": true,
  "message": "Tipo de proyecto actualizado exitosamente",
  "data": {
    "_id": "6650a1b2c3d4e5f6a7b8c9d0",
    "nombre": "artículo",
    "fechaCreacion": "2026-11-23T16:00:00.000Z",
    "fechaActualizacion": "2026-11-23T17:30:00.000Z"
  }
}
```

| Código | Descripción |
|---|---|
| `200 OK` | Actualización exitosa |
| `400 Bad Request` | Valor fuera del enum |
| `404 Not Found` | ID no encontrado en la base de datos |
| `500 Internal Server Error` | Error inesperado |

---

## 2. Módulo: Clientes

### GET /api/clientes

Retorna todos los clientes registrados.

**Response 200 OK:**
```json
{
  "success": true,
  "total": 1,
  "data": [
    {
      "_id": "6650b1c2d3e4f5a6b7c8d9e0",
      "nombre": "Carlos Mario Restrepo",
      "email": "carlos.restrepo@correo.com",
      "fechaCreacion": "2026-01-15T10:00:00.000Z",
      "fechaActualizacion": "2026-01-15T10:00:00.000Z"
    }
  ]
}
```

---

### POST /api/clientes

Crea un nuevo cliente.

**Body (JSON):**

| Campo | Tipo | Requerido | Validaciones |
|---|---|---|---|
| `nombre` | String | ✅ Sí | Mínimo 3 caracteres |
| `email` | String | ✅ Sí | Formato válido de email, único en el sistema |

**Request:**
```json
{
  "nombre": "Laura Marcela Gómez",
  "email": "laura.gomez@correo.com"
}
```

**Response 201 Created:**
```json
{
  "success": true,
  "message": "Cliente creado exitosamente",
  "data": {
    "_id": "6650b1c2d3e4f5a6b7c8d9e0",
    "nombre": "laura marcela gómez",
    "email": "laura.gomez@correo.com",
    "fechaCreacion": "2026-11-23T16:00:00.000Z",
    "fechaActualizacion": "2026-11-23T16:00:00.000Z"
  }
}
```

**Response 409 Conflict (email duplicado):**
```json
{
  "success": false,
  "message": "El email 'laura.gomez@correo.com' ya se encuentra registrado en el sistema",
  "campo": "email",
  "valor": "laura.gomez@correo.com"
}
```

| Código | Descripción |
|---|---|
| `201 Created` | Cliente creado exitosamente |
| `400 Bad Request` | Nombre menor a 3 chars o email con formato inválido |
| `409 Conflict` | Email ya registrado |
| `500 Internal Server Error` | Error inesperado |

---

### PUT /api/clientes/:id

Actualiza los datos de un cliente.

**Body (JSON):**

| Campo | Tipo | Requerido | Validaciones |
|---|---|---|---|
| `nombre` | String | No | Mínimo 3 caracteres si se envía |
| `email` | String | No | Formato válido y único si se envía |

**Request:**
```json
{ "email": "nuevo.email@correo.com" }
```

**Response 200 OK:**
```json
{
  "success": true,
  "message": "Cliente actualizado exitosamente",
  "data": { "_id": "...", "nombre": "Laura Marcela Gómez", "email": "nuevo.email@correo.com", "..." }
}
```

| Código | Descripción |
|---|---|
| `200 OK` | Actualización exitosa |
| `400 Bad Request` | Validación fallida |
| `404 Not Found` | Cliente no encontrado |
| `409 Conflict` | Email ya en uso por otro cliente |

---

## 3. Módulo: Universidades

### GET /api/universidades
Retorna todas las universidades. Sin parámetros.

### POST /api/universidades

**Body (JSON):**

| Campo | Tipo | Requerido | Validaciones |
|---|---|---|---|
| `nombre` | String | ✅ Sí | Único en el sistema |
| `direccion` | String | ✅ Sí | - |
| `telefono` | String | ✅ Sí | - |

**Request:**
```json
{
  "nombre": "Institución Universitaria Digital de Antioquia",
  "direccion": "Calle 52 # 41-38, Medellín, Antioquia",
  "telefono": "+57 604 520 0750"
}
```

**Response 201 Created:**
```json
{
  "success": true,
  "message": "Universidad creada exitosamente",
  "data": {
    "_id": "6650c1d2e3f4a5b6c7d8e9f0",
    "nombre": "Institución Universitaria Digital de Antioquia",
    "direccion": "Calle 52 # 41-38, Medellín, Antioquia",
    "telefono": "+57 604 520 0750",
    "fechaCreacion": "2026-11-23T16:00:00.000Z",
    "fechaActualizacion": "2026-11-23T16:00:00.000Z"
  }
}
```

| Código | Descripción |
|---|---|
| `201 Created` | Universidad creada exitosamente |
| `400 Bad Request` | Campo requerido vacío |
| `409 Conflict` | Nombre de universidad ya registrado |

### PUT /api/universidades/:id
Actualiza nombre, dirección o teléfono de una universidad.

---

## 4. Módulo: Etapas

### GET /api/etapas
Retorna todas las etapas. Sin parámetros.

### POST /api/etapas

**Body (JSON):**

| Campo | Tipo | Requerido | Valores válidos |
|---|---|---|---|
| `nombre` | String | ✅ Sí | `anteproyecto`, `entrega parcial 1`, `entrega parcial 2`, `entrega final` |

**Request:**
```json
{ "nombre": "anteproyecto" }
```

**Response 201 Created:**
```json
{
  "success": true,
  "message": "Etapa creada exitosamente",
  "data": {
    "_id": "6650d1e2f3a4b5c6d7e8f9a0",
    "nombre": "anteproyecto",
    "fechaCreacion": "2026-11-23T16:00:00.000Z",
    "fechaActualizacion": "2026-11-23T16:00:00.000Z"
  }
}
```

| Código | Descripción |
|---|---|
| `201 Created` | Etapa creada |
| `400 Bad Request` | Valor fuera del enum de etapas |

### PUT /api/etapas/:id
Actualiza la etapa respetando el enum permitido.

---

## 5. Módulo: Proyectos (Núcleo del Sistema)

### GET /api/proyectos

Retorna todos los proyectos con sus relaciones resueltas (populate).

**Response 200 OK:**
```json
{
  "success": true,
  "total": 1,
  "data": [
    {
      "_id": "6650e1f2a3b4c5d6e7f8a9b0",
      "numero": "PRY-2026-001",
      "titulo": "Plataforma Web para Telemedicina Comunitaria",
      "fechaIniciacion": "2026-01-01T00:00:00.000Z",
      "fechaEntrega": "2026-12-31T00:00:00.000Z",
      "valor": 3500000,
      "cliente": {
        "_id": "6650b1c2d3e4f5a6b7c8d9e0",
        "nombre": "carlos mario restrepo",
        "email": "carlos.restrepo@correo.com"
      },
      "tipoProyecto": {
        "_id": "6650a1b2c3d4e5f6a7b8c9d0",
        "nombre": "trabajo final de pregrado"
      },
      "universidad": {
        "_id": "6650c1d2e3f4a5b6c7d8e9f0",
        "nombre": "Institución Universitaria Digital de Antioquia",
        "direccion": "Calle 52 # 41-38, Medellín"
      },
      "etapa": {
        "_id": "6650d1e2f3a4b5c6d7e8f9a0",
        "nombre": "entrega parcial 1"
      },
      "fechaCreacion": "2026-11-23T16:00:00.000Z",
      "fechaActualizacion": "2026-11-23T16:00:00.000Z"
    }
  ]
}
```

---

### POST /api/proyectos

Crea un nuevo proyecto validando la existencia de todas las referencias foráneas.

**Body (JSON):**

| Campo | Tipo | Requerido | Validaciones |
|---|---|---|---|
| `numero` | String | ✅ Sí | Único en el sistema |
| `titulo` | String | ✅ Sí | Mínimo 5 caracteres |
| `fechaIniciacion` | Date (ISO) | ✅ Sí | Fecha válida |
| `fechaEntrega` | Date (ISO) | ✅ Sí | Debe ser posterior a `fechaIniciacion` |
| `valor` | Number | ✅ Sí | Mayor a 0 |
| `cliente` | ObjectId | ✅ Sí | Debe existir en la colección Cliente |
| `tipoProyecto` | ObjectId | ✅ Sí | Debe existir en la colección TipoProyecto |
| `universidad` | ObjectId | ✅ Sí | Debe existir en la colección Universidad |
| `etapa` | ObjectId | ✅ Sí | Debe existir en la colección Etapa |

**Request:**
```json
{
  "numero": "PRY-2026-003",
  "titulo": "Análisis de Microservicios en la Nube",
  "fechaIniciacion": "2026-02-01",
  "fechaEntrega": "2026-11-30",
  "valor": 2500000,
  "cliente": "6650b1c2d3e4f5a6b7c8d9e0",
  "tipoProyecto": "6650a1b2c3d4e5f6a7b8c9d0",
  "universidad": "6650c1d2e3f4a5b6c7d8e9f0",
  "etapa": "6650d1e2f3a4b5c6d7e8f9a0"
}
```

**Response 201 Created:**
```json
{
  "success": true,
  "message": "Proyecto de asesoría creado exitosamente",
  "data": { "...": "objeto completo con populate de las 4 relaciones" }
}
```

**Response 404 Not Found (referencia inexistente):**
```json
{
  "success": false,
  "message": "Cliente con ID '6650b1c2d3e4f5a6b7c8d9e0' no encontrado"
}
```

**Response 409 Conflict (número duplicado):**
```json
{
  "success": false,
  "message": "El numero 'PRY-2026-003' ya se encuentra registrado en el sistema",
  "campo": "numero",
  "valor": "PRY-2026-003"
}
```

| Código | Descripción |
|---|---|
| `201 Created` | Proyecto creado exitosamente |
| `400 Bad Request` | Validación fallida (título corto, fechas inconsistentes, valor ≤ 0) |
| `404 Not Found` | Alguna referencia foránea no existe |
| `409 Conflict` | Número de proyecto duplicado |
| `500 Internal Server Error` | Error inesperado |

---

### PUT /api/proyectos/:id

Actualiza parcialmente un proyecto existente.

**Parámetro URL:** `id` — ObjectId del proyecto.

**Body (JSON):** Puede incluir uno o más campos a actualizar.

**Request (cambio de etapa):**
```json
{ "etapa": "6650d1e2f3a4b5c6d7e8f9a1" }
```

**Response 200 OK:**
```json
{
  "success": true,
  "message": "Proyecto actualizado exitosamente",
  "data": { "...": "proyecto completo con nuevas relaciones populadas" }
}
```

| Código | Descripción |
|---|---|
| `200 OK` | Actualización exitosa |
| `400 Bad Request` | Validación de campos fallida |
| `404 Not Found` | Proyecto no encontrado o referencia foránea inexistente |
| `409 Conflict` | Número de proyecto duplicado |

---

## 6. Endpoint de Validación (Solo Arquitectura Desacoplada)

### GET /api/catalogos/validar

Endpoint exclusivo del `servicio-catalogos`. Permite al `servicio-proyectos` verificar la existencia de múltiples referencias en una sola llamada HTTP.

**Parámetros de consulta (query params):**

| Parámetro | Tipo | Requerido | Descripción |
|---|---|---|---|
| `clienteId` | String (ObjectId) | No | ID del cliente a validar |
| `tipoProyectoId` | String (ObjectId) | No | ID del tipo de proyecto a validar |
| `universidadId` | String (ObjectId) | No | ID de la universidad a validar |
| `etapaId` | String (ObjectId) | No | ID de la etapa a validar |

**Request:**
```
GET /api/catalogos/validar?clienteId=6650b1c2...&tipoProyectoId=6650a1b2...&universidadId=6650c1d2...&etapaId=6650d1e2...
```

**Response 200 OK (todos existen):**
```json
{
  "valid": true,
  "message": "Todas las referencias existen en el catálogo",
  "datos": {
    "cliente":      { "_id": "...", "nombre": "Carlos Restrepo" },
    "tipoProyecto": { "_id": "...", "nombre": "monografía" },
    "universidad":  { "_id": "...", "nombre": "IUDigital" },
    "etapa":        { "_id": "...", "nombre": "anteproyecto" }
  }
}
```

**Response 404 Not Found (alguno no existe):**
```json
{
  "valid": false,
  "message": "Las siguientes entidades referenciadas no existen en catálogos: Cliente (6650b1...)",
  "faltantes": ["Cliente (6650b1c2d3e4f5a6b7c8d9e0)"]
}
```
