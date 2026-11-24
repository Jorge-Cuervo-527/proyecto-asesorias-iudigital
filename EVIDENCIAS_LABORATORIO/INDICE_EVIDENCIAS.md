# 📸 Índice de Evidencias de Laboratorio — Caso de Estudio 3
> **Institución Universitaria Digital de Antioquia (IUDigital)**  
> **Proyecto:** Sistema Monolítico, Desacoplamiento y Despliegue Continuo (CD) con Node.js, MongoDB, Docker y Jenkins

---

## 🗂️ Estructura del Repositorio de Evidencias

Las evidencias se organizan en las siguientes carpetas dentro de `EVIDENCIAS_LABORATORIO/`:

```
EVIDENCIAS_LABORATORIO/
├── INDICE_EVIDENCIAS.md
├── 01_MONOLITO/          # Evidencias del sistema monolítico inicial (Puerto 3000)
├── 02_DESACOPLAMIENTO/   # Evidencias de microservicios y validación cruzada (Puertos 4001 y 4002)
├── 03_DOCKER/            # Evidencias de contenedores, redes y volúmenes en Docker Desktop
├── 04_DOCKER_HUB/        # Evidencias de imágenes construidas, etiquetadas y publicadas
├── 05_JENKINS/           # Evidencias de configuración de credenciales, job y pipeline CD
└── 06_PRUEBAS_FINALES/   # Evidencias de pruebas de integración, errores controlados y smoke tests
```

---

## 📋 Catálogo Detallado de Capturas Requeridas

### 📁 Carpeta: `01_MONOLITO/`

| Código de Archivo | Fase | Finalidad / Qué debe mostrar la captura |
|---|:---:|---|
| `01_monolito_vscode_estructura.png` | Fase 1 | Estructura de carpetas de `backend-monolito` abierta en el explorador de VS Code (modelos, controladores, rutas). |
| `02_monolito_docker_up_terminal.png` | Fase 1 | Terminal con la ejecución exitosa de `docker compose -f docker/docker-compose.monolito.yml up` mostrando logs de inicio. |
| `03_monolito_healthcheck_browser.png` | Fase 1 | Navegador en `http://localhost:3000/health` mostrando respuesta JSON `{"status":"UP","service":"backend-monolito"}`. |
| `04_monolito_seed_terminal.png` | Fase 1 | Terminal con la ejecución exitosa de `docker exec -it monolito-app node src/seed.js` confirmando los 5 módulos poblados. |
| `05_monolito_get_proyectos_browser.png` | Fase 1 | Navegador o Postman en `http://localhost:3000/api/proyectos` mostrando los proyectos poblados con populate completo. |
| `06_monolito_get_catalogos_browser.png` | Fase 1 | Navegador o Postman consultando `http://localhost:3000/api/clientes` o `tipos-proyecto` con datos cargados. |

---

### 📁 Carpeta: `02_DESACOPLAMIENTO/`

| Código de Archivo | Fase | Finalidad / Qué debe mostrar la captura |
|---|:---:|---|
| `01_desacoplado_vscode_estructura.png` | Fase 2 | Estructura de `backend-desacoplado/` en VS Code mostrando `servicio-catalogos` y `servicio-proyectos`. |
| `02_desacoplado_catalogos_vacio.png` | Fase 2 | Navegador o Postman en `http://localhost:4001/api/clientes` confirmando `total: 0, data: []` antes del seed. |
| `03_desacoplado_catalogos_seed.png` | Fase 2 | Terminal ejecutando `docker exec -it servicio-catalogos node src/seed.js` con el reporte de datos insertados. |
| `04_desacoplado_catalogos_poblado.png` | Fase 2 | Navegador o Postman en `http://localhost:4001/api/clientes` confirmando los 3 clientes insertados. |
| `05_desacoplado_validacion_endpoint.png` | Fase 2 | Petición a `http://localhost:4001/api/catalogos/validar?...` mostrando `{ "valid": true }` con los datos consolidados. |
| `06_desacoplado_post_proyecto_exito.png` | Fase 2 | Petición POST a `http://localhost:4002/api/proyectos` retornando `201 Created` y demostrando la comunicación HTTP con Catálogos. |
| `07_desacoplado_post_proyecto_error404.png` | Fase 2 | Petición POST a `http://localhost:4002/api/proyectos` con un ID inexistente retornando `404 Not Found` desde Catálogos. |

---

### 📁 Carpeta: `03_DOCKER/`

| Código de Archivo | Fase | Finalidad / Qué debe mostrar la captura |
|---|:---:|---|
| `01_docker_desktop_containers.png` | Fase 3 | Panel de Docker Desktop mostrando los contenedores activos (`monolito-app`, `servicio-catalogos`, `servicio-proyectos`, `mongo-*`). |
| `02_docker_desktop_images.png` | Fase 3 | Panel de Docker Desktop mostrando las imágenes locales construidas (`node:20-alpine`, `mongo:7.0`, imágenes de app). |
| `03_docker_compose_files_vscode.png` | Fase 3 | VS Code con la carpeta `docker/` abierta mostrando `docker-compose.monolito.yml`, `desacoplado.yml` y `cd.yml`. |
| `04_docker_networks_terminal.png` | Fase 3 | Terminal ejecutando `docker network ls` mostrando `iudigital-monolito-net` e `iudigital-desacoplado-net`. |

---

### 📁 Carpeta: `04_DOCKER_HUB/`

| Código de Archivo | Fase | Finalidad / Qué debe mostrar la captura |
|---|:---:|---|
| `01_docker_tag_push_terminal.png` | Fase 3/4 | Terminal ejecutando `docker push` de las imágenes hacia el repositorio de Docker Hub (`jorgedev/*`). |
| `02_docker_hub_repositories.png` | Fase 3/4 | Navegador en `https://hub.docker.com/u/jorgedev` mostrando los repositorios públicos (`backend-monolito`, `servicio-catalogos`, `servicio-proyectos`). |
| `03_docker_hub_tags.png` | Fase 3/4 | Detalle de tags en Docker Hub mostrando etiquetas `latest` y números de build. |

---

### 📁 Carpeta: `05_JENKINS/`

| Código de Archivo | Fase | Finalidad / Qué debe mostrar la captura |
|---|:---:|---|
| `01_jenkins_dashboard.png` | Fase 4 | Interfaz principal de Jenkins en `http://localhost:8080` mostrando el Job `asesorias-iudigital-cd`. |
| `02_jenkins_credentials.png` | Fase 4 | Panel de credenciales en Jenkins mostrando la entrada `dockerhub-credentials` (sin revelar la contraseña). |
| `03_jenkins_job_config.png` | Fase 4 | Configuración del Job mostrando *Pipeline script from SCM*, repositorio Git y ruta `jenkins/Jenkinsfile`. |
| `04_jenkins_pipeline_success.png` | Fase 4 | Vista Stage View de Jenkins mostrando todos los stages en verde (Checkout, Lint&Test, Build, Push, Deploy, Smoke Test). |
| `05_jenkins_console_output.png` | Fase 4 | Logs finales de la consola de Jenkins con el mensaje de éxito del build y verificación de salud en los puertos asignados. |

---

### 📁 Carpeta: `06_PRUEBAS_FINALES/`

| Código de Archivo | Fase | Finalidad / Qué debe mostrar la captura |
|---|:---:|---|
| `01_test_script_monolito_terminal.png` | Fase 6 | Terminal con la ejecución de `bash scripts/test_monolito.sh` mostrando todos los checks en `PASS`. |
| `02_test_script_desacoplado_terminal.png` | Fase 6 | Terminal con la ejecución de `bash scripts/test_desacoplado.sh` mostrando todos los checks en `PASS`. |
| `03_validacion_enum_error_browser.png` | Fase 6 | Petición POST con enum inválido mostrando respuesta `400 Bad Request` controlada por el `errorHandler`. |
| `04_validacion_email_duplicado_browser.png` | Fase 6 | Petición POST con email duplicado mostrando respuesta `409 Conflict`. |

---

## 🔒 Reglas de Oro para la Captura de Evidencias

1. **Autenticidad:** Guardar capturas de pantalla reales en formato `.png`.
2. **Privacidad:** No capturar contraseñas, tokens de Docker Hub ni claves privadas de acceso.
3. **Nomenclatura:** Mantener estrictamente el nombre asignado en la tabla para facilitar la revisión del docente evaluador.
