# 🐳 Guía de Docker y Despliegue — IUDigital

## Requisitos Previos

| Herramienta | Versión mínima | Verificar con |
|---|---|---|
| Docker Desktop | 24.x | `docker --version` |
| Docker Compose | v2.x | `docker compose version` |
| Cuenta Docker Hub | - | [hub.docker.com](https://hub.docker.com) |

---

## 1. Despliegue del Monolito con Docker Compose

### Paso 1 — Construir y levantar

```bash
# Desde la raíz del proyecto
docker compose -f docker/docker-compose.monolito.yml up --build
```

La flag `--build` reconstruye las imágenes cada vez. Para levantarlo sin reconstruir:

```bash
docker compose -f docker/docker-compose.monolito.yml up
```

Para ejecutar en segundo plano (modo detached):

```bash
docker compose -f docker/docker-compose.monolito.yml up -d --build
```

### Paso 2 — Verificar que todo está corriendo

```bash
docker ps
# Deberías ver:
# CONTAINER ID  IMAGE              STATUS        PORTS
# abc123        monolito-app       Up (healthy)  0.0.0.0:3000->3000/tcp
# def456        mongo:7.0          Up (healthy)  0.0.0.0:27017->27017/tcp
```

### Paso 3 — Verificar el healthcheck

```bash
curl http://localhost:3000/health
# Respuesta esperada:
# {"status":"UP","service":"backend-monolito","timestamp":"..."}
```

### Paso 4 — Cargar datos de prueba (seed)

```bash
# Ejecutar el seed dentro del contenedor del monolito
docker exec -it monolito-app node src/seed.js
```

### Paso 5 — Detener el monolito

```bash
docker compose -f docker/docker-compose.monolito.yml down
# Para eliminar también los volúmenes (datos de MongoDB):
docker compose -f docker/docker-compose.monolito.yml down -v
```

---

## 2. Despliegue de Microservicios con Docker Compose

### Paso 1 — Levantar arquitectura desacoplada

```bash
docker compose -f docker/docker-compose.desacoplado.yml up --build -d
```

### Paso 2 — Verificar los tres contenedores

```bash
docker ps
# CONTAINER ID  IMAGE                  PORTS
# aaa111        servicio-catalogos     0.0.0.0:4001->4001/tcp
# bbb222        servicio-proyectos     0.0.0.0:4002->4002/tcp
# ccc333        mongo:7.0              0.0.0.0:27018->27017/tcp
```

### Paso 3 — Verificar healthchecks

```bash
curl http://localhost:4001/health
# {"status":"UP","service":"servicio-catalogos",...}

curl http://localhost:4002/health
# {"status":"UP","service":"servicio-proyectos",...}
```

### Paso 4 — Cargar datos de catálogos

```bash
docker exec -it servicio-catalogos node src/seed.js
```

> [!IMPORTANT]
> El seed del `servicio-catalogos` debe ejecutarse **antes** de crear proyectos en `servicio-proyectos`, ya que este valida que los IDs existan en el catálogo.

### Paso 5 — Detener microservicios

```bash
docker compose -f docker/docker-compose.desacoplado.yml down
```

---

## 3. Construir Imágenes Manualmente

Si quieres construir y etiquetar las imágenes sin Docker Compose:

```bash
# Monolito
docker build -t jorgedev/backend-monolito:latest ./backend-monolito
docker build -t jorgedev/backend-monolito:1.0.0  ./backend-monolito

# Servicio Catálogos
docker build -t jorgedev/servicio-catalogos:latest ./backend-desacoplado/servicio-catalogos

# Servicio Proyectos
docker build -t jorgedev/servicio-proyectos:latest ./backend-desacoplado/servicio-proyectos
```

Verificar imágenes creadas:

```bash
docker images | grep jorgedev
# jorgedev/backend-monolito      latest    abc123   2 min ago   118MB
# jorgedev/servicio-catalogos    latest    def456   1 min ago   115MB
# jorgedev/servicio-proyectos    latest    ghi789   1 min ago   116MB
```

---

## 4. Publicar Imágenes en Docker Hub

### Paso 1 — Iniciar sesión en Docker Hub

```bash
docker login
# Username: jorgedev
# Password: (tu token de acceso de Docker Hub)
# Login Succeeded
```

> [!TIP]
> Se recomienda usar un **Access Token** en lugar de tu contraseña. Créalo en Docker Hub: Account Settings → Security → New Access Token.

### Paso 2 — Publicar las imágenes

```bash
# Monolito
docker push jorgedev/backend-monolito:latest

# Microservicios
docker push jorgedev/servicio-catalogos:latest
docker push jorgedev/servicio-proyectos:latest
```

### Paso 3 — Verificar en Docker Hub

```bash
# Ver las imágenes publicadas
docker search jorgedev
# O ingresa a: https://hub.docker.com/u/jorgedev
```

### Paso 4 — Etiquetar con versión específica y publicar

```bash
docker tag jorgedev/backend-monolito:latest jorgedev/backend-monolito:1.0.0
docker push jorgedev/backend-monolito:1.0.0
```

### Paso 5 — Cerrar sesión

```bash
docker logout
```

---

## 5. Despliegue con Imágenes de Docker Hub (CD)

Simula lo que hace Jenkins en el Stage 5:

```bash
# Configurar variables
export DOCKER_USER=jorgedev
export TAG=latest

# Descargar imágenes
docker compose -f docker/docker-compose.cd.yml pull

# Detener versión anterior
docker compose -f docker/docker-compose.cd.yml down --remove-orphans

# Levantar nueva versión
docker compose -f docker/docker-compose.cd.yml up -d --force-recreate
```

---

## 6. Comandos de Diagnóstico y Limpieza

```bash
# Ver logs de un contenedor
docker logs monolito-app -f            # -f = seguimiento en tiempo real
docker logs servicio-catalogos --tail=50  # Últimas 50 líneas

# Entrar al shell de un contenedor
docker exec -it monolito-app sh

# Ver uso de recursos
docker stats

# Inspeccionar red Docker
docker network ls
docker network inspect iudigital-monolito-net

# Ver volúmenes
docker volume ls
docker volume inspect mongo_monolito_data

# Limpieza general
docker image prune -f          # Elimina imágenes sin tag (dangling)
docker container prune -f      # Elimina contenedores detenidos
docker volume prune -f         # Elimina volúmenes sin usar (¡cuidado con datos!)
docker system prune -f         # Limpieza completa del sistema Docker
```

> [!CAUTION]
> `docker system prune -f` elimina **todo** lo que no esté en uso: imágenes, contenedores, redes y caché de build. No ejecutar en producción sin revisar qué se va a eliminar primero.
