# 🔧 Troubleshooting — Solución de Problemas Frecuentes

> [!NOTE]
> Este manual cubre los 10 problemas más comunes al trabajar con este proyecto. Para cada uno se detalla el síntoma exacto, la causa raíz y la solución paso a paso.

---

## Problema 1 — Puerto ya ocupado (EADDRINUSE)

### Síntoma

```
Error: listen EADDRINUSE: address already in use :::3000
```

O con Docker Compose:

```
Error response from daemon: Ports are not available:
listen tcp 0.0.0.0:3000: bind: address already in use
```

### Causa

Otro proceso (o un contenedor anterior) ya está usando el puerto `3000`, `4001`, `4002` o `27017`.

### Solución

```bash
# Windows: identificar qué proceso usa el puerto 3000
netstat -ano | findstr :3000
# El último número es el PID. Terminar el proceso:
taskkill /PID <numero_pid> /F

# Linux/Mac:
lsof -i :3000
kill -9 <PID>

# Si es un contenedor Docker anterior:
docker ps -a   # Ver todos los contenedores (incluso detenidos)
docker stop monolito-app
docker rm monolito-app

# O detener todos los compose activos:
docker compose -f docker/docker-compose.monolito.yml down
```

---

## Problema 2 — Error de conexión a MongoDB (ECONNREFUSED)

### Síntoma

```
[MongoDB Error] Error al conectar a la base de datos:
connect ECONNREFUSED 127.0.0.1:27017
```

O en Docker:

```
MongoNetworkError: connect ECONNREFUSED mongo:27017
```

### Causa

MongoDB no está corriendo, o el contenedor del monolito intentó conectarse antes de que MongoDB estuviera listo.

### Solución

```bash
# Si corre localmente: verificar que MongoDB esté activo
# Windows (servicios):
Get-Service MongoDB

# Linux:
sudo systemctl status mongod
sudo systemctl start mongod

# Si corre con Docker Compose: verificar el healthcheck
docker ps   # Columna STATUS debe decir "(healthy)" para mongo
docker logs mongo-monolito   # Ver logs de MongoDB

# Si el healthcheck falla, esperar y volver a intentar:
docker compose -f docker/docker-compose.monolito.yml down
docker compose -f docker/docker-compose.monolito.yml up

# Verificar que la MONGO_URI en .env sea correcta:
# Para local:   MONGO_URI=mongodb://localhost:27017/asesorias_monolito_db
# Para Docker:  MONGO_URI=mongodb://mongo:27017/asesorias_monolito_db
#                                      ↑ nombre del servicio en docker-compose
```

> [!WARNING]
> Dentro de Docker, `localhost` NO apunta a otro contenedor. Siempre usa el nombre del servicio (`mongo`, `servicio-catalogos`, etc.) como hostname.

---

## Problema 3 — Permiso denegado en Docker socket de Jenkins

### Síntoma

```
Got permission denied while trying to connect to the Docker daemon socket
at unix:///var/run/docker.sock: Post http://...
dial unix /var/run/docker.sock: connect: permission denied
```

### Causa

El usuario `jenkins` no tiene permisos para acceder al socket de Docker (`/var/run/docker.sock`).

### Solución

```bash
# Agregar el usuario jenkins al grupo docker
sudo usermod -aG docker jenkins

# Reiniciar Jenkins
sudo systemctl restart jenkins

# Verificar que el permiso fue aplicado
groups jenkins
# Debe aparecer "docker" en la lista

# Alternativa temporal (no recomendada en producción):
sudo chmod 666 /var/run/docker.sock

# Si Jenkins corre en Docker, verificar que el socket esté montado
# en docker-compose-jenkins.yml:
# volumes:
#   - /var/run/docker.sock:/var/run/docker.sock
```

---

## Problema 4 — Error de login en Docker Hub desde Jenkins

### Síntoma

En el Stage 4 del pipeline:

```
Error response from daemon: Get "https://registry-1.docker.io/v2/":
unauthorized: incorrect username or password
```

O:

```
error: credentials store not initialized
```

### Causa

Las credenciales `dockerhub-credentials` están mal configuradas en Jenkins, o el token de Docker Hub expiró.

### Solución

```bash
# Paso 1: Verificar las credenciales en Jenkins
# Manage Jenkins → Credentials → Global
# Verificar que existe el ID exacto: "dockerhub-credentials"

# Paso 2: Probar login manualmente en el servidor Jenkins
docker login -u jorgedev
# Si falla, el token puede haber expirado

# Paso 3: Generar nuevo Access Token en Docker Hub
# Docker Hub → Account Settings → Security → New Access Token
# Nombre: jenkins-iudigital
# Permisos: Read & Write

# Paso 4: Actualizar la credencial en Jenkins
# Credentials → dockerhub-credentials → Update
# Password: (nuevo token)
# Save

# Paso 5: Re-ejecutar el pipeline
```

> [!IMPORTANT]
> Se recomienda usar **Access Tokens** de Docker Hub en lugar de la contraseña principal. Los tokens pueden revocarse individualmente sin afectar la cuenta.

---

## Problema 5 — Contenedor reiniciándose continuamente (Crash Loop)

### Síntoma

```bash
docker ps
# STATUS: Restarting (1) 10 seconds ago
```

```bash
docker logs monolito-app
# Error: Cannot find module './config/db'
# O: Error: listen EADDRINUSE
```

### Causa

La aplicación Node.js falla al iniciar por: módulo no encontrado, error de sintaxis, variable de entorno faltante, o puerto ocupado.

### Solución

```bash
# Ver los logs del contenedor para identificar el error exacto
docker logs monolito-app --tail=50

# Error frecuente 1: módulo no encontrado
# Causa: el Dockerfile no copió todos los archivos necesarios
# Solución: revisar el COPY en el Dockerfile y reconstruir
docker compose -f docker/docker-compose.monolito.yml up --build

# Error frecuente 2: variable de entorno faltante
# Verificar que el docker-compose.yml tenga todas las variables:
# environment:
#   - MONGO_URI=mongodb://mongo:27017/asesorias_monolito_db

# Error frecuente 3: MongoDB no está listo todavía
# Verificar el depends_on con condition: service_healthy en el docker-compose.yml

# Forzar recreación del contenedor
docker compose -f docker/docker-compose.monolito.yml down
docker compose -f docker/docker-compose.monolito.yml up --build --force-recreate
```

---

## Problema 6 — Error 11000 Clave Duplicada en MongoDB

### Síntoma

Al hacer POST:

```json
{
  "success": false,
  "message": "El email 'jorge@correo.com' ya se encuentra registrado en el sistema",
  "campo": "email",
  "valor": "jorge@correo.com"
}
```

O al ejecutar el seed dos veces sin limpiar:

```
MongoServerError: E11000 duplicate key error collection: asesorias_monolito_db.clientes
index: email_1 dup key: { email: "carlos.restrepo@correo.com" }
```

### Causa

Se intenta insertar un documento con un valor que ya existe en un campo con índice único (`email` en Cliente, `nombre` en Universidad, `numero` en Proyecto).

### Solución

```bash
# Si es al ejecutar seed: el seed es idempotente (hace deleteMany primero)
# Si falla igualmente, limpiar la BD manualmente:
docker exec -it mongo-monolito mongosh asesorias_monolito_db --eval "db.clientes.deleteMany({})"

# En la API: si el cliente recibe 409, debe corregir el valor del campo
# duplicado antes de reintentar la petición.

# Para verificar qué documentos existen con ese valor:
docker exec -it mongo-monolito mongosh asesorias_monolito_db \
  --eval "db.clientes.findOne({email: 'jorge@correo.com'})"
```

---

## Problema 7 — ValidationError por Enum Inválido

### Síntoma

```json
{
  "success": false,
  "message": "Error de validación en los datos enviados",
  "errors": ["Tipo de proyecto inválido. Valores permitidos: ensayo, artículo, monografía, trabajo final de pregrado, trabajo final de especialización"]
}
```

### Causa

El valor enviado en el campo `nombre` para `TipoProyecto` o `Etapa` no coincide exactamente con los valores del enum (incluyendo tildes y espacios).

### Solución

Verificar que el valor enviado sea exactamente uno de los permitidos:

**TipoProyecto:**
- `"ensayo"`
- `"artículo"` ← con tilde
- `"monografía"` ← con tilde
- `"trabajo final de pregrado"` ← con espacios
- `"trabajo final de especialización"` ← con tilde

**Etapa:**
- `"anteproyecto"`
- `"entrega parcial 1"` ← con espacios y número
- `"entrega parcial 2"`
- `"entrega final"`

> [!TIP]
> El campo se guarda en **minúsculas** gracias a `lowercase: true` en el schema. Puedes enviar `"Ensayo"` o `"ENSAYO"` y Mongoose lo convertirá antes de validar.

---

## Problema 8 — Healthcheck Fallando en Docker Compose

### Síntoma

```bash
docker ps
# STATUS: Up 2 minutes (health: starting)
# O: Up 5 minutes (unhealthy)
```

El contenedor del servicio sube pero nunca pasa a `(healthy)`.

### Causa

El endpoint `/health` no responde dentro del tiempo configurado. Puede ser porque:
- La app está tardando más de `start_period` (20s) en arrancar.
- MongoDB no está listo y la app no puede iniciar.
- El endpoint `/health` tiene un bug.

### Solución

```bash
# Ver el detalle del healthcheck
docker inspect monolito-app | findstr -A 10 "Health"
# O en Linux:
docker inspect monolito-app | grep -A 10 "Health"

# Ver logs del contenedor
docker logs monolito-app -f

# Probar el endpoint manualmente desde dentro del contenedor
docker exec -it monolito-app wget --spider http://localhost:3000/health

# Si la app demora más en arrancar, aumentar start_period en docker-compose.yml:
# healthcheck:
#   start_period: 40s   ← Aumentar de 20s a 40s
```

---

## Problema 9 — Pipeline Jenkins No Encuentra el Jenkinsfile

### Síntoma

```
ERROR: Unable to find Jenkinsfile from git repository.
Tried path: Jenkinsfile
```

O:

```
org.jenkinsci.plugins.workflow.steps.FlowInterruptedException
No such file: jenkins/Jenkinsfile
```

### Causa

El "Script Path" configurado en el Job no coincide con la ubicación real del `Jenkinsfile` en el repositorio.

### Solución

```bash
# Verificar la ubicación del Jenkinsfile en el repositorio
git ls-files | grep Jenkinsfile
# Debe mostrar: jenkins/Jenkinsfile

# En Jenkins UI:
# Job Configuration → Pipeline → Script Path
# Cambiar el valor a: jenkins/Jenkinsfile
# (con la ruta exacta relativa a la raíz del repositorio)

# Verificar que el Jenkinsfile fue commiteado al repositorio:
git add jenkins/Jenkinsfile
git commit -m "feat: agregar Jenkinsfile"
git push
```

---

## Problema 10 — Servicio Proyectos No Puede Conectar con Catálogos (503)

### Síntoma

Al hacer `POST /api/proyectos` en el `servicio-proyectos`:

```json
{
  "success": false,
  "message": "Servicio de catálogos no disponible (timeout 3000ms). Reintente más tarde."
}
```

### Causa

`servicio-proyectos` no puede alcanzar `servicio-catalogos`. Causas posibles:
1. `servicio-catalogos` no está corriendo.
2. La variable `CATALOGOS_SERVICE_URL` apunta a una URL incorrecta.
3. Los dos servicios no están en la misma red Docker.

### Solución

```bash
# Paso 1: Verificar que servicio-catalogos está corriendo
docker ps | grep catalogos
# STATUS: Up N minutes (healthy)

# Paso 2: Verificar la variable de entorno en servicio-proyectos
docker exec -it servicio-proyectos env | grep CATALOGOS
# CATALOGOS_SERVICE_URL=http://servicio-catalogos:4001  ← debe ser así en Docker
# CATALOGOS_SERVICE_URL=http://localhost:4001           ← así si corre localmente

# Paso 3: Probar conectividad desde dentro del contenedor
docker exec -it servicio-proyectos wget --spider http://servicio-catalogos:4001/health
# Si falla, los contenedores no están en la misma red

# Paso 4: Verificar la red Docker
docker network inspect iudigital-desacoplado-net
# En "Containers" deben aparecer ambos: servicio-catalogos y servicio-proyectos

# Paso 5: Si están en redes distintas, asegurarse de levantar ambos
# con el MISMO docker-compose.yml:
docker compose -f docker/docker-compose.desacoplado.yml up --build
# (NO levantar cada servicio con su propio compose)

# Paso 6: Si el timeout es muy corto para tu entorno, aumentarlo en .env:
# CATALOGOS_TIMEOUT_MS=5000   (aumentar de 3000ms a 5000ms)
```

> [!WARNING]
> Cuando `servicio-proyectos` responde `503`, **no se debe crear el proyecto**. El cliente debe reintentar la operación unos segundos después, cuando el catálogo esté disponible nuevamente.
