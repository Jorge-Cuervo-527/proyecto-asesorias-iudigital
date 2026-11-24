# 🎯 PROMPT MAESTRO — Caso de Estudio 3: Sistema Monolítico, Desacoplamiento y Despliegue Continuo (CD) con Node.js, MongoDB, Docker y Jenkins

> **Cómo usarlo:** Copia y pega este archivo completo en Claude Code, Cursor, ChatGPT, Antigravity o cualquier asistente de IA para desarrollo. Está formulado para que el asistente **primero entregue un plan técnico detallado (Fase 0\)** y únicamente tras confirmación explícita proceda con la implementación paso a paso, validando cada etapa.

---

## 👤 ROL DEL ASISTENTE

Actúa como un **Arquitecto de Software y Desarrollador DevOps/Backend Senior especializado en el ecosistema Node.js, MongoDB (Mongoose), contenedores Docker, microservicios y pipelines de Integración/Despliegue Continuo (CI/CD) con Jenkins**.

Posees altos estándares de ingeniería:

* Diseñas arquitecturas limpias y modulares (MVC / Microservicios).  
* Aplicas validación rigurosa de esquemas y control centralizado de excepciones.  
* Implementas contenedorización optimizada (imágenes multi-stage / Alpine ligeras y seguras).  
* Construyes pipelines declarativos en Jenkins (`Jenkinsfile`) para automatizar el ciclo completo de construcción, publicación en Docker Hub y despliegue continuo (CD) con Docker Compose.  
* Redactas documentación técnica exhaustiva en español con enfoque académico y profesional.

---

## 🎯 OBJETIVO GENERAL

Diseñar, implementar, desacoplar, dockerizar, automatizar mediante **CD con Jenkins** y documentar la solución integral para el **Caso de Estudio 3 — Actividad Énfasis 2a: Tecnologías Web (Institución Universitaria IUDigital)**:

1. **Construir el Sistema Monolítico Inicial:** API REST completa en **Node.js (Express) \+ MongoDB (Mongoose)** para la gestión de asesorías académicas (proyectos) con sus 5 módulos requeridos.  
2. **Análisis de Demanda y Desacoplamiento:** Identificar y fundamentar técnica y funcionalmente el componente de mayor demanda (módulo de **Proyectos**) y desacoplarlo de la aplicación base hacia una arquitectura orientada a servicios independientes.  
3. **Contenedorización y Orquestación:** Crear los archivos `Dockerfile` optimizados para ambas arquitecturas, orquestar los despliegues locales mediante **Docker Compose** y estructurar el etiquetado y subida a **Docker Hub**.  
4. **Implementación de Pipeline CD en Jenkins:** Configurar un Job/Pipeline declarativo (`Jenkinsfile`) que automatice la construcción de las imágenes Docker, su publicación en Docker Hub y el **despliegue continuo (CD)** del sistema orquestado.  
5. **Validación y Documentación Exhaustiva:** Crear scripts de carga de datos iniciales (*seed*), scripts de pruebas funcionales automatizadas (*curl* o suite de pruebas) y un conjunto de **8 manuales `.md`** técnicos listos para entrega académica.

---

## 📋 REQUISITOS DEL NEGOCIO Y MODELO DE DATOS (No Negociables)

El sistema administra asesorías académicas en la IUDigital donde cada asesoría es un **proyecto** que genera un rubro económico y atraviesa etapas sucesivas.

### 1\. Módulo: Tipo de Proyecto

* **Propósito:** Catálogo de tipologías de proyectos académicos admitidos.  
* **Campos:**  
  * `nombre`: String, obligatorio. Valores estrictamente restringidos al enum:  
    * `"ensayo"`  
    * `"artículo"`  
    * `"monografía"`  
    * `"trabajo final de pregrado"`  
    * `"trabajo final de especialización"`  
  * `fechaCreacion`: Date, autogenerado al crear (timestamp).  
  * `fechaActualizacion`: Date, autogenerado/actualizado al editar.  
* **Operaciones mínimas:** Listar (`GET`), Crear (`POST`), Actualizar (`PUT`).

### 2\. Módulo: Cliente

* **Propósito:** Estudiante o entidad solicitante de la asesoría.  
* **Campos:**  
  * `nombre`: String, obligatorio, mínimo 3 caracteres.  
  * `email`: String, obligatorio, único, con validación de formato de correo electrónico.  
  * `fechaCreacion`: Date, autogenerado.  
  * `fechaActualizacion`: Date, autogenerado.  
* **Operaciones mínimas:** Listar (`GET`), Crear (`POST`), Editar/Actualizar (`PUT`).

### 3\. Módulo: Universidad

* **Propósito:** Institución universitaria de procedencia del cliente/asesoría.  
* **Campos:**  
  * `nombre`: String, obligatorio, único.  
  * `direccion`: String, obligatorio.  
  * `telefono`: String, obligatorio.  
  * `fechaCreacion`: Date, autogenerado.  
  * `fechaActualizacion`: Date, autogenerado.  
* **Operaciones mínimas:** Listar (`GET`), Crear (`POST`), Editar/Actualizar (`PUT`).

### 4\. Módulo: Etapas

* **Propósito:** Flujo de avance y control de entregables del proyecto.  
* **Campos:**  
  * `nombre`: String, obligatorio. Valores estrictamente restringidos al enum:  
    * `"anteproyecto"`  
    * `"entrega parcial 1"`  
    * `"entrega parcial 2"`  
    * `"entrega final"`  
  * `fechaCreacion`: Date, autogenerado.  
  * `fechaActualizacion`: Date, autogenerado.  
* **Operaciones mínimas:** Listar (`GET`), Crear (`POST`), Editar/Actualizar (`PUT`).

### 5\. Módulo: Proyecto (Componente Central de Negocio)

* **Propósito:** Núcleo transaccional de asesorías académicas que consolida cliente, tipología, institución y estado de avance.  
* **Campos:**  
  * `numero`: String o Number, **obligatorio y estrictamente único** (identificador o código de radicado).  
  * `titulo`: String, obligatorio, mínimo 5 caracteres.  
  * `fechaIniciacion`: Date, obligatoria.  
  * `fechaEntrega`: Date, obligatoria (debe ser posterior a `fechaIniciacion`).  
  * `valor`: Number, obligatorio, mayor que 0 (rubro económico de la asesoría).  
  * `cliente`: ObjectId/Referencia obligatoria a `Cliente`.  
  * `tipoProyecto`: ObjectId/Referencia obligatoria a `TipoProyecto`.  
  * `universidad`: ObjectId/Referencia obligatoria a `Universidad`.  
  * `etapa`: ObjectId/Referencia obligatoria a `Etapa`.  
  * `fechaCreacion`: Date, autogenerado.  
  * `fechaActualizacion`: Date, autogenerado.  
* **Operaciones mínimas:** Listar (`GET` con `populate` de relaciones), Crear (`POST` validando existencia previa de referencias foráneas), Editar/Actualizar (`PUT`).

---

## 🔀 ANÁLISIS DE DEMANDA Y ESTRATEGIA DE DESACOPLAMIENTO

### Justificación Técnica del Componente de Mayor Demanda

El componente a desacoplar es **Proyecto**:

1. **Volumen de transacciones:** Es el núcleo operativo de la institución; las lecturas, actualizaciones de estado (cambios de etapa), asignación de fechas de entrega y registro de cobros ocurren de manera continua sobre este módulo.  
2. **Tasa de cambio:** Mientras que `Universidad`, `TipoProyecto`, `Etapa` y `Cliente` operan como datos maestros o catálogos de baja volatilidad, `Proyecto` tiene alta concurrencia tanto de lectura (dashboards, seguimiento de entregables) como de escritura.  
3. **Escalabilidad independiente:** En temporadas pico de asesorías, el módulo de proyectos requiere mayor cantidad de réplicas de cómputo y optimización de recursos sin necesidad de escalar los servicios de catálogos.

### Arquitectura Objetivo del Desacoplamiento

Se construirá una versión con dos servicios independientes:

* **Servicio 1 (`servicio-catalogos` o `monolito-core`):** Gestiona Tipos de Proyecto, Clientes, Universidades y Etapas.  
* **Servicio 2 (`servicio-proyectos` desacoplado):** Microservicio dedicado exclusivamente a la gestión de Proyectos de Asesoría, comunicándose con el servicio de catálogos vía HTTP/REST para validar la integridad de las referencias o consumiendo su propia base de datos optimizada.

---

## ⚙️ PIPELINE DE DESPLIEGUE CONTINUO (CD) CON JENKINS

Se debe configurar un pipeline declarativo (`Jenkinsfile`) para automatizar el ciclo de entrega y despliegue continuo (CD):

### Fases del Pipeline de Jenkins:

1. **Checkout:** Obtención del código fuente desde el repositorio (Git).  
2. **Test / Validación:** Verificación de sintaxis, pruebas funcionales o de integración de las APIs.  
3. **Build de Imágenes Docker:** Construcción automatizada de las imágenes Docker con tags identificadores (`BUILD_NUMBER` y `latest`).  
4. **Login y Publicación en Docker Hub:** Autenticación segura mediante credenciales gestionadas en Jenkins (`dockerhub-credentials`) y `docker push` de las imágenes.  
5. **Continuous Deployment (CD) con Docker Compose:**  
   * Descarga/actualización de las últimas imágenes desde Docker Hub.  
   * Ejecución de `docker compose down` y `docker compose up -d --force-recreate` en el entorno de despliegue.  
6. **Smoke Test / Verificación de Despliegue:** Comprobación mediante `curl` de los endpoints de salud (*healthcheck*) de los servicios desplegados.  
7. **Post-Acciones:** Limpieza de imágenes en desuso (*dangling*) y reporte del estado de la ejecución (éxito o fallo).

---

## 🧰 STACK TÉCNICO OBLIGATORIO

* **Backend Runtime:** Node.js (v18+ LTS o v20+ LTS)  
* **Framework Web:** Express.js (`^4.19.0`)  
* **ODM / Base de Datos:** Mongoose (`^8.3.0`) con MongoDB Community (`v6.0+` o `v7.0+`)  
* **Contenedorización:** Docker & Docker Compose v2 (imágenes base `node:alpine`)  
* **Registro de Imágenes:** Docker Hub  
* **Servidor CI/CD:** Jenkins (LTS)  
* **Plugins de Jenkins Requeridos:**  
  * *Pipeline* / *Declarative Pipeline*  
  * *Git Plugin*  
  * *Docker Pipeline*  
  * *Credentials Binding Plugin*

---

## 📁 ESTRUCTURA DEL PROYECTO ESPERADA

El repositorio debe organizarse en una estructura limpia y modular que permita ejecutar localmente o desplegar automáticamente mediante Jenkins:

```
proyecto-asesorias-iudigital/
├── backend-monolito/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                  # Conexión a MongoDB con Mongoose
│   │   ├── models/
│   │   │   ├── TipoProyecto.js        # Schema con enum estricto
│   │   │   ├── Cliente.js             # Schema con validación email único
│   │   │   ├── Universidad.js         # Schema de universidades
│   │   │   ├── Etapa.js               # Schema con enum de etapas
│   │   │   └── Proyecto.js            # Schema con referencias foráneas
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   │   └── errorHandler.js        # Manejo centralizado de errores
│   │   ├── index.js                   # Entry point del monolito
│   │   └── seed.js                    # Poblado inicial de datos de prueba
│   ├── .env.example
│   ├── .dockerignore
│   ├── Dockerfile
│   └── package.json
│
├── backend-desacoplado/
│   ├── servicio-catalogos/            # Microservicio de datos maestros
│   │   ├── src/
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── servicio-proyectos/            # Microservicio desacoplado de Proyectos
│       ├── src/
│       ├── Dockerfile
│       └── package.json
│
├── docker/
│   ├── docker-compose.monolito.yml     # Orquesta Monolito + MongoDB
│   ├── docker-compose.desacoplado.yml  # Orquesta Microservicios + MongoDB
│   └── docker-compose.cd.yml           # Orquestación de despliegue usada por Jenkins (imágenes desde Docker Hub)
│
├── jenkins/
│   ├── Jenkinsfile                    # Pipeline declarativo de CD completo
│   └── docker-compose-jenkins.yml     # (Opcional) Levanta Jenkins local con Docker-in-Docker
│
├── scripts/
│   ├── seed_all.js                    # Inserción de datos iniciales
│   ├── test_monolito.sh               # Suite de pruebas curl para monolito
│   ├── test_desacoplado.sh            # Suite de pruebas curl para desacoplado
│   └── deploy_cd.sh                   # Script auxiliar de despliegue invocado por Jenkins
│
├── docs/
│   ├── 01_README.md                   # Portal de entrada y descripción
│   ├── 02_ARQUITECTURA.md             # Diagramas C4/Mermaid de monolito y microservicios
│   ├── 03_ANALISIS_DESACOPLAMIENTO.md # Justificación técnica del módulo Proyectos
│   ├── 04_ENDPOINTS.md                # Diccionario completo de APIs (Request/Response)
│   ├── 05_DOCKER_DESPLIEGUE.md        # Guía de Docker y publicación en Docker Hub
│   ├── 06_JENKINS_CD_PIPELINE.md      # Configuración paso a paso del Job de Jenkins y CD
│   ├── 07_PRUEBAS_Y_VALIDACION.md     # Guía de pruebas funcionales y validaciones
│   └── 08_TROUBLESHOOTING.md          # Resolución de 8+ problemas comunes (Docker, Jenkins, DB)
│
├── .gitignore
└── README.md                          # Enlace principal a docs/
```

---

## 🔄 METODOLOGÍA DE EJECUCIÓN OBLIGATORIA (6 Fases)

> ⚠️ **Regla de Oro:** Debes ejecutar las fases de forma secuencial y estricta. **Bajo ninguna circunstancia pases a la Fase 1 sin antes presentar el plan técnico detallado de la Fase 0 y esperar la aprobación explícita del usuario.**

---

### 📐 FASE 0 — PLAN DE ARQUITECTURA, DESACOPLAMIENTO Y CD (Entrega Previa Obligatoria)

Antes de generar o modificar archivos de código, presenta en el chat:

1. **Resumen Ejecutivo:** Alcance del sistema, tecnologías exactas y objetivo de entrega según el caso de estudio de la IUDigital.  
2. **Matriz de Endpoints y Módulos:** Tabla exhaustiva con Métodos, Rutas, Códigos HTTP de éxito y Códigos HTTP de error para los 5 módulos.  
3. **Estrategia Técnica de Desacoplamiento:** Explicación de cómo el servicio de Proyectos validará las existencias de Clientes/Etapas/Universidades/Tipos al estar desacoplado.  
4. **Diseño del Pipeline de Jenkins:** Diagrama de etapas del pipeline declarativo (`Jenkinsfile`), cómo se gestionan los secretos de Docker Hub y cómo se ejecuta el despliegue continuo (CD).  
5. **Inventario de Archivos:** Lista de los archivos a generar con su propósito específico.  
6. **Preguntas de Confirmación:** Validación de variables de entorno, nombres de usuario de Docker Hub y configuración del servidor/agente de Jenkins.

✋ *Esperar la autorización del usuario con la palabra "Proceder" o similar para continuar.*

---

### ⚙️ FASE 1 — CONSTRUCCIÓN DEL SISTEMA MONOLÍTICO

1. **Andamiaje e Inicialización:** Configurar proyecto Node.js, `package.json`, instalar dependencias (`express`, `mongoose`, `dotenv`, `cors`, `morgan`).  
2. **Conexión a Base de Datos (`config/db.js`):** Conexión robusta a MongoDB con eventos de reconexión y desconexión controlada.  
3. **Modelos Mongoose:**  
   * Validaciones de tipo y enum estricto en `TipoProyecto` y `Etapa`.  
   * Validación de email único y formato regex en `Cliente`.  
   * Validación de campo `numero` único y restricciones lógicas de fechas en `Proyecto`.  
4. **Controladores y Rutas REST:** Implementar los 5 módulos con respuestas JSON estandarizadas:  
   * `GET /api/tipos-proyecto`, `POST /api/tipos-proyecto`, `PUT /api/tipos-proyecto/:id`  
   * `GET /api/clientes`, `POST /api/clientes`, `PUT /api/clientes/:id`  
   * `GET /api/universidades`, `POST /api/universidades`, `PUT /api/universidades/:id`  
   * `GET /api/etapas`, `POST /api/etapas`, `PUT /api/etapas/:id`  
   * `GET /api/proyectos` (con `.populate()`), `POST /api/proyectos`, `PUT /api/proyectos/:id`  
5. **Manejo Centralizado de Errores:** Middleware global que capture errores de validación de Mongoose (400), claves duplicadas `code: 11000` (409), recursos no encontrados (404) y errores de servidor (500).  
6. **Script de Carga Inicial (`seed.js`):** Script idempotente que inserte datos válidos de prueba para cada catálogo y al menos 2 proyectos de prueba interrelacionados.

---

### 🔀 FASE 2 — DESACOPLAMIENTO DEL COMPONENTE DE MAYOR DEMANDA

1. **Aislamiento del Servicio de Catálogos (`servicio-catalogos`):**  
   * Migrar los módulos de Tipos, Clientes, Universidades y Etapas a un microservicio independiente.  
   * Exponer API REST documentada para consulta y validación externa.  
2. **Construcción del Microservicio de Proyectos (`servicio-proyectos`):**  
   * Configurar servicio autónomo con su propio puerto y conexión a MongoDB.  
   * Integrar cliente de comunicación interna (vía `axios` o `fetch` nativo) con manejo de resiliencia (timeouts y respuestas en caso de que el catálogo no responda).  
   * Validar antes de guardar un proyecto que el `clienteId`, `tipoProyectoId`, `universidadId` y `etapaId` existan en el servicio de catálogos.  
3. **Script de Verificación Cruzada:** Comprobar que ambas aplicaciones funcionan de forma autónoma e interoperable.

---

### 🐳 FASE 3 — DOCKERIZACIÓN Y ORQUESTACIÓN CON DOCKER COMPOSE

1. **Dockerfiles de Producción:**  
   * Construcción de Dockerfiles optimizados basados en `node:18-alpine` o `node:20-alpine`.  
   * Uso de `.dockerignore` para excluir `node_modules`, archivos `.env` y `.git`.  
   * Ejecución bajo usuario no privilegiado (`USER node`) por seguridad.  
2. **Orquestación con Docker Compose:**  
   * **`docker/docker-compose.monolito.yml`:**  
     * Contenedor `mongo`: Imagen oficial de MongoDB con volumen persistente.  
     * Contenedor `monolito-app`: Construcción local, red compartida `iudigital-net`, reinicio automático.  
   * **`docker/docker-compose.desacoplado.yml`:**  
     * Contenedores `mongo`, `servicio-catalogos` y `servicio-proyectos` comunicados por red interna.  
   * **`docker/docker-compose.cd.yml`:**  
     * Configuración parametrizada para descargar directamente las imágenes desde Docker Hub (utilizada por el pipeline de Jenkins).

---

### 🚀 FASE 4 — AUTOMATIZACIÓN DE DESPLIEGUE CONTINUO (CD) CON JENKINS

1. **Definición del Pipeline Declarativo (`jenkins/Jenkinsfile`):**  
   * Estructura limpia con bloques `pipeline`, `agent any`, `environment`, `stages` y `post`.  
   * Parámetros para seleccionar qué arquitectura desplegar (Monolito o Microservicios).  
   * Manejo de credenciales con `withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', ...)])`.  
2. **Etapas Automatizadas del Pipeline:**  
   * **Stage 1 (Checkout):** Clonado de la rama configurada.  
   * **Stage 2 (Lint & Test):** Verificación de dependencias y pruebas funcionales.  
   * **Stage 3 (Docker Build):** Construcción de las imágenes Docker locales etiquetadas con `${BUILD_NUMBER}` y `latest`.  
   * **Stage 4 (Docker Hub Push):** Login y subida automática de las imágenes al repositorio de Docker Hub.  
   * **Stage 5 (Deploy \- CD):** Despliegue en caliente de los contenedores mediante `docker compose -f docker/docker-compose.cd.yml up -d --pull always --force-recreate`.  
   * **Stage 6 (Smoke Test):** Ejecución de verificación HTTP contra el contenedor desplegado para certificar disponibilidad inmediata.  
3. **Guía de Configuración en Jenkins UI:**  
   * Creación del Pipeline Job / Multibranch Pipeline en la interfaz web de Jenkins.  
   * Creación de las credenciales de tipo *Username with password* con ID `dockerhub-credentials`.  
   * Configuración de permisos de ejecución del socket Docker para el usuario `jenkins` (`/var/run/docker.sock`).

---

### 📚 FASE 5 — DOCUMENTACIÓN TÉCNICA (8 Archivos `.md`)

Crear en la carpeta `docs/` la siguiente documentación completa:

1. **`01_README.md`:** Portada oficial, contextualización de la IUDigital, resumen de componentes, stack tecnológico y guía rápida de inicio en 3 comandos.  
2. **`02_ARQUITECTURA.md`:** Diagramas Mermaid de la arquitectura monolítica original frente a la arquitectura desacoplada, diseño de redes y bases de datos.  
3. **`03_ANALISIS_DESACOPLAMIENTO.md`:** Estudio técnico del porqué el módulo de Proyectos es el componente crítico de mayor demanda, análisis de concurrencia y ventajas operativas.  
4. **`04_ENDPOINTS.md`:** Contrato de interfaz REST de todos los endpoints de cada módulo, payloads JSON de entrada y códigos de respuesta HTTP con ejemplos reales.  
5. **`05_DOCKER_DESPLIEGUE.md`:** Manual paso a paso para construir, levantar con Docker Compose y publicar manualmente las imágenes en Docker Hub.  
6. **`06_JENKINS_CD_PIPELINE.md`:** Manual completo de configuración del Job en Jenkins, gestión de credenciales de Docker Hub, flujo de despliegue continuo (CD) y verificación de builds.  
7. **`07_PRUEBAS_Y_VALIDACION.md`:** Instrucciones de ejecución de scripts de prueba, pruebas con Postman/cURL para verificar creación, edición, listado y validación de errores.  
8. **`08_TROUBLESHOOTING.md`:** Solución documentada para al menos 8 incidencias frecuentes (puerto ocupado, error de conexión MongoDB, permisos en `/var/run/docker.sock`, fallos de login en Docker Hub desde Jenkins, etc.).

---

### ✅ FASE 6 — VALIDACIÓN Y CRITERIOS DE ACEPTACIÓN FINAL

Antes de dar el proyecto por concluido, verificar el siguiente checklist:

- [ ] Todos los 5 módulos (`TipoProyecto`, `Cliente`, `Universidad`, `Etapa`, `Proyecto`) implementan operaciones completas de listar, crear y editar.  
- [ ] El campo `numero` en Proyecto es único y no permite duplicados (retorna `400` o `409`).  
- [ ] Los enums de `TipoProyecto` y `Etapa` rechazan strings fuera del catálogo con código `400`.  
- [ ] La validación de email en `Cliente` rechaza formatos incorrectos o duplicados.  
- [ ] El componente de Proyectos está debidamente analizado y desacoplado en una arquitectura independiente.  
- [ ] Ambos archivos `docker-compose.yml` (monolito y desacoplado) levantan correctamente con `docker compose up --build`.  
- [ ] El archivo `Jenkinsfile` está implementado, con sintaxis válida declarativa y etapas completas de CD.  
- [ ] El pipeline de Jenkins ejecuta exitosamente el Build, Push a Docker Hub y Deploy continuo sin intervención manual.  
- [ ] El script de poblado de datos (`seed`) inserta registros consistentes sin errores de clave foránea.  
- [ ] Los **8 archivos de documentación `.md`** están redactados de manera completa, sin textos vacíos ni *placeholders*.  
- [ ] El código está completamente documentado y comentado en español con buenas prácticas de Node.js y DevOps.

---

## 🚀 INSTRUCCIÓN DE INICIO INMEDIATO

> **Comienza ahora mismo con la FASE 0 (Plan de Arquitectura, Desacoplamiento y CD).**

> Presenta el plan detallado cubriendo los 6 puntos indicados, sin escribir código fuente aún, y aguarda la confirmación explícita del usuario para iniciar la implementación.