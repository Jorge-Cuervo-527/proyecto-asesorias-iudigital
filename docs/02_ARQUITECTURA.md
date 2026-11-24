# 🏗️ Arquitectura del Sistema — IUDigital

## 1. Patrón de Diseño Aplicado

El sistema implementa el patrón **MVC (Modelo-Vista-Controlador)** adaptado a APIs REST, donde la "Vista" es la respuesta JSON entregada al cliente HTTP:

| Capa | Componente | Responsabilidad |
|---|---|---|
| **Modelo** | `src/models/*.js` | Define la estructura de datos y validaciones con Mongoose |
| **Controlador** | `src/controllers/*.js` | Contiene la lógica de negocio y orquesta la respuesta |
| **Ruta (Router)** | `src/routes/*.js` | Mapea las URLs HTTP a los controladores correspondientes |
| **Middleware** | `src/middlewares/errorHandler.js` | Captura y formatea todos los errores del sistema |

---

## 2. Arquitectura Monolítica

### Diagrama de Capas

```mermaid
flowchart TD
    CL([Cliente HTTP\nPostman / Browser]) -->|HTTP Request| MW[Morgan Logger\nCORS / JSON Parser]
    MW --> RT[Router Layer\n5 Routers Express]
    RT --> CT[Controller Layer\n5 Controladores]
    CT --> MD[Model Layer\nMongoose Schemas]
    MD --> DB[(MongoDB\nasesorias_monolito_db\n:27017)]
    CT -->|Error| EH[errorHandler\nMiddleware]
    EH -->|HTTP Response JSON| CL
    MD -->|Success| CL
```

### Flujo de una Petición POST /api/proyectos

```mermaid
sequenceDiagram
    participant C as Cliente HTTP
    participant R as proyectoRoutes.js
    participant Ctrl as proyectoController.js
    participant M as Proyecto.js (Model)
    participant DB as MongoDB

    C->>R: POST /api/proyectos { body }
    R->>Ctrl: crearProyecto(req, res, next)
    Ctrl->>DB: Cliente.findById(clienteId)
    DB-->>Ctrl: cliente encontrado ✅
    Ctrl->>DB: TipoProyecto.findById(tipoId)
    DB-->>Ctrl: tipo encontrado ✅
    Ctrl->>DB: Universidad.findById(univId)
    DB-->>Ctrl: universidad encontrada ✅
    Ctrl->>DB: Etapa.findById(etapaId)
    DB-->>Ctrl: etapa encontrada ✅
    Ctrl->>M: Proyecto.create({...})
    M->>DB: insertOne(documento)
    DB-->>Ctrl: proyecto guardado
    Ctrl->>DB: Proyecto.findById().populate()
    DB-->>Ctrl: proyecto con relaciones
    Ctrl-->>C: 201 Created { success: true, data: {...} }
```

---

## 3. Arquitectura Desacoplada (Microservicios)

### Diagrama General

```mermaid
flowchart LR
    subgraph Red Docker iudigital-desacoplado-net
        subgraph SC[Servicio Catálogos :4001]
            SC_API[Express Router]
            SC_MOD[Models: TipoProyecto\nCliente, Universidad, Etapa]
            SC_VAL[/api/catalogos/validar]
        end

        subgraph SP[Servicio Proyectos :4002]
            SP_API[Express Router]
            SP_MOD[Model: Proyecto]
            SP_CLI[catalogosClient.js\naxios + timeout 3s]
        end

        subgraph DB[MongoDB :27017]
            DBC[(catalogos_db)]
            DBP[(proyectos_db)]
        end

        SC_API --> SC_MOD --> DBC
        SP_API --> SP_MOD --> DBP
        SP_CLI -->|GET /api/catalogos/validar| SC_VAL
        SC_VAL --> SC_MOD
    end

    C([Cliente HTTP]) -->|:4001| SC_API
    C -->|:4002| SP_API
```

### Flujo de Creación de Proyecto (Desacoplado)

```mermaid
sequenceDiagram
    participant C as Cliente HTTP
    participant SP as servicio-proyectos :4002
    participant CC as catalogosClient.js
    participant SC as servicio-catalogos :4001
    participant DBP as MongoDB proyectos_db

    C->>SP: POST /api/proyectos { clienteId, tipoId, univId, etapaId, ... }
    SP->>CC: validarReferencias({ clienteId, tipoId, univId, etapaId })
    CC->>SC: GET /api/catalogos/validar?clienteId=...&tipoProyectoId=...
    
    alt Todas las referencias existen
        SC-->>CC: 200 { valid: true, datos: { cliente, tipo, univ, etapa } }
        CC-->>SP: { valid: true, datos: {...} }
        SP->>DBP: Proyecto.create({ ...campos, snapshotCatalogo: datos })
        DBP-->>SP: proyecto guardado
        SP-->>C: 201 Created { success: true, data: proyecto }
    else Alguna referencia no existe
        SC-->>CC: 404 { valid: false, faltantes: ["Cliente (id)"] }
        CC-->>SP: { valid: false, faltantes: [...] }
        SP-->>C: 404 Not Found { success: false, faltantes: [...] }
    else Catálogos no responde (timeout)
        CC-->>SP: { serviceUnavailable: true }
        SP-->>C: 503 Service Unavailable
    end
```

---

## 4. Diseño de Redes Docker

Cada entorno tiene su propia red aislada tipo `bridge`:

```mermaid
flowchart TD
    subgraph Host[Máquina Host]
        subgraph NET1[iudigital-monolito-net]
            M1[monolito-app\nhostname: monolito-app\n:3000]
            DB1[(mongo-monolito\nhostname: mongo\n:27017)]
            M1 <-->|Mongoose| DB1
        end

        subgraph NET2[iudigital-desacoplado-net]
            SC[servicio-catalogos\n:4001]
            SP[servicio-proyectos\n:4002]
            DB2[(mongo-desacoplado\nhostname: mongo\n:27017)]
            SC <-->|Mongoose| DB2
            SP <-->|Mongoose| DB2
            SP <-->|HTTP axios| SC
        end

        subgraph NET3[iudigital-cd-net]
            MC[monolito-cd\nimagen de DockerHub\n:3000]
            SCC[catalogos-cd\n:4001]
            SPC[proyectos-cd\n:4002]
            DB3[(mongo-cd\n:27017)]
        end

        H([Host / Jenkins]) -->|:3000| M1
        H -->|:4001 y :4002| SC & SP
        H -->|:3000 :4001 :4002| MC & SCC & SPC
    end
```

> [!NOTE]
> Los contenedores dentro de la misma red Docker se comunican usando el **nombre del servicio** definido en el `docker-compose.yml` como hostname. Por ejemplo, `servicio-proyectos` llama a `http://servicio-catalogos:4001` y Docker resuelve internamente la IP del contenedor.

---

## 5. Volúmenes Persistentes

Los datos de MongoDB se persisten en volúmenes Docker nombrados:

| Volumen | Usado en | Ruta en contenedor | Propósito |
|---|---|---|---|
| `mongo_monolito_data` | `docker-compose.monolito.yml` | `/data/db` | Datos del monolito |
| `mongo_desacoplado_data` | `docker-compose.desacoplado.yml` | `/data/db` | Datos de microservicios |
| `mongo_cd_data` | `docker-compose.cd.yml` | `/data/db` | Datos en entorno CD |

> [!IMPORTANT]
> Al ejecutar `docker compose down`, los contenedores se eliminan pero los **volúmenes persisten**. Para eliminar también los datos usa `docker compose down -v`.

---

## 6. Modelo de Datos (Entidad-Relación)

```mermaid
erDiagram
    TipoProyecto {
        ObjectId _id
        String nombre
        Date fechaCreacion
        Date fechaActualizacion
    }

    Cliente {
        ObjectId _id
        String nombre
        String email
        Date fechaCreacion
        Date fechaActualizacion
    }

    Universidad {
        ObjectId _id
        String nombre
        String direccion
        String telefono
        Date fechaCreacion
        Date fechaActualizacion
    }

    Etapa {
        ObjectId _id
        String nombre
        Date fechaCreacion
        Date fechaActualizacion
    }

    Proyecto {
        ObjectId _id
        String numero
        String titulo
        Date fechaIniciacion
        Date fechaEntrega
        Number valor
        ObjectId cliente
        ObjectId tipoProyecto
        ObjectId universidad
        ObjectId etapa
        Date fechaCreacion
        Date fechaActualizacion
    }

    Proyecto }o--|| Cliente : "pertenece a"
    Proyecto }o--|| TipoProyecto : "es de tipo"
    Proyecto }o--|| Universidad : "proviene de"
    Proyecto }o--|| Etapa : "se encuentra en"
```
