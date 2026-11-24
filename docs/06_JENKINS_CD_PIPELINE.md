# ⚙️ Manual de Jenkins y Pipeline CD — IUDigital

## 1. Requisitos Previos

| Requisito | Descripción |
|---|---|
| Jenkins LTS | Instalado y accesible en `http://localhost:8080` |
| Plugin: Pipeline | Para pipelines declarativos |
| Plugin: Git | Para clonar repositorios |
| Plugin: Docker Pipeline | Para comandos Docker en el pipeline |
| Plugin: Credentials Binding | Para inyección segura de secretos |
| Docker instalado | En el servidor/agente donde corre Jenkins |
| Repositorio Git | Con el `Jenkinsfile` en `jenkins/Jenkinsfile` |
| Cuenta Docker Hub | Con credenciales configuradas en Jenkins |

---

## 2. Levantar Jenkins con Docker (Opcional)

Si no tienes Jenkins instalado, puedes levantarlo localmente:

```bash
docker compose -f jenkins/docker-compose-jenkins.yml up -d
```

Acceder en: `http://localhost:8080`

Para obtener la contraseña inicial de Jenkins:
```bash
docker exec jenkins-iudigital cat /var/jenkins_home/secrets/initialAdminPassword
```

---

## 3. Instalar Plugins Requeridos

Una vez en Jenkins:

```
Manage Jenkins → Plugins → Available Plugins
```

Buscar e instalar:
- ✅ **Pipeline**
- ✅ **Git**
- ✅ **Docker Pipeline**
- ✅ **Credentials Binding**

Reiniciar Jenkins después de la instalación.

---

## 4. Configurar Credenciales de Docker Hub

> [!IMPORTANT]
> Las credenciales NUNCA se escriben directamente en el `Jenkinsfile`. Se configuran en Jenkins y se referencian por ID.

### Paso 1 — Ir a credenciales

```
Manage Jenkins → Credentials → System → Global credentials → Add Credentials
```

### Paso 2 — Configurar

```
Kind:        Username with password
Scope:       Global
Username:    jorgedev
Password:    [tu token de Docker Hub]
ID:          dockerhub-credentials      ← Este ID exacto debe coincidir con el Jenkinsfile
Description: Docker Hub - jorgedev
```

### Paso 3 — Verificar

```
Credentials → Global → debe aparecer "dockerhub-credentials" en la lista
```

---

## 5. Configurar Permisos de Docker para Jenkins

Si Jenkins corre en Linux (fuera de Docker), el usuario `jenkins` necesita permiso para usar Docker:

```bash
# Agregar el usuario jenkins al grupo docker
sudo usermod -aG docker jenkins

# Reiniciar Jenkins para aplicar el cambio
sudo systemctl restart jenkins

# Verificar que jenkins puede usar docker
sudo -u jenkins docker ps
```

Si Jenkins corre **dentro de un contenedor Docker** (como en el `docker-compose-jenkins.yml`), el socket ya está montado:
```yaml
volumes:
  - /var/run/docker.sock:/var/run/docker.sock
```

---

## 6. Crear el Pipeline Job en Jenkins

### Paso 1 — Nuevo Item

```
Jenkins Dashboard → New Item
Nombre: asesorias-iudigital-cd
Tipo: Pipeline
→ OK
```

### Paso 2 — Configuración General

```
☑ Discard old builds
  Max # of builds to keep: 10
```

### Paso 3 — Pipeline Definition

```
Definition: Pipeline script from SCM
SCM: Git
Repository URL: https://github.com/tu-usuario/asesorias-iudigital.git
Credentials: (si el repo es privado, agregar credenciales SSH o HTTPS)
Branch Specifier: */main
Script Path: jenkins/Jenkinsfile   ← ruta exacta en el repositorio
```

### Paso 4 — Guardar y construir

```
Save → Build with Parameters → Seleccionar ARQUITECTURA → Build Now
```

---

## 7. Explicación de cada Stage del Jenkinsfile

### Stage 1: Checkout

```groovy
stage('1. Checkout') {
    steps {
        checkout scm   // Descarga el código del repositorio configurado en el Job
    }
}
```

**Qué hace:** Clona la rama configurada del repositorio Git al workspace de Jenkins. Jenkins guarda el código en `/var/jenkins_home/workspace/asesorias-iudigital-cd/`.

---

### Stage 2: Lint & Test

```groovy
stage('2. Lint & Test') {
    steps {
        sh 'cd backend-monolito && npm install --silent && npm test'
    }
}
```

**Qué hace:** Instala dependencias y ejecuta `npm test`. Si el test falla (`exit code != 0`), el pipeline se detiene aquí y marca el build como FAILURE.

**Consola esperada:**
```
[Monolito] >> Validando Monolito...
[Monolito] Validación de sintaxis exitosa
```

---

### Stage 3: Docker Build

```groovy
sh "docker build -t jorgedev/backend-monolito:42 -t jorgedev/backend-monolito:latest ./backend-monolito"
```

**Qué hace:** Construye la imagen Docker usando el `Dockerfile` del proyecto. La etiqueta `:42` corresponde al `BUILD_NUMBER` automático de Jenkins.

**Consola esperada:**
```
Step 1/10 : FROM node:20-alpine AS builder
Step 2/10 : WORKDIR /app
...
Successfully built abc123def456
Successfully tagged jorgedev/backend-monolito:42
Successfully tagged jorgedev/backend-monolito:latest
```

---

### Stage 4: Docker Hub Push

```groovy
withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', ...)]) {
    sh 'echo $DOCKER_LOGIN_PASS | docker login -u $DOCKER_LOGIN_USER --password-stdin'
    sh 'docker push jorgedev/backend-monolito:42'
    sh 'docker push jorgedev/backend-monolito:latest'
}
```

**Qué hace:** Autentica contra Docker Hub con las credenciales almacenadas en Jenkins (nunca visibles en logs) y sube las imágenes al registro público.

**Consola esperada:**
```
+ echo **** | docker login -u jorgedev --password-stdin   ← Password enmascarada
Login Succeeded
The push refers to repository [docker.io/jorgedev/backend-monolito]
42: digest: sha256:abc... size: 1234
latest: digest: sha256:def... size: 1234
```

---

### Stage 5: Deploy (CD)

```groovy
sh """
    export DOCKER_USER=jorgedev
    export TAG=42
    docker compose -f docker/docker-compose.cd.yml pull
    docker compose -f docker/docker-compose.cd.yml down --remove-orphans
    docker compose -f docker/docker-compose.cd.yml up -d --force-recreate
"""
```

**Qué hace:** Descarga las imágenes recién publicadas desde Docker Hub, detiene los contenedores anteriores y levanta los nuevos.

**Consola esperada:**
```
Pulling monolito-app ... done
Pulling servicio-catalogos ... done
Pulling servicio-proyectos ... done
Stopping monolito-cd ... done
Removing monolito-cd ... done
Creating monolito-cd ... done
Creating catalogos-cd ... done
Creating proyectos-cd ... done
```

---

### Stage 6: Smoke Test

```groovy
sh '''
    sleep 15
    curl -f http://localhost:3000/health || exit 1
    curl -f http://localhost:4001/health || exit 1
    curl -f http://localhost:4002/health || exit 1
'''
```

**Qué hace:** Espera 15 segundos para que los contenedores arranquen completamente y luego verifica que cada healthcheck responde `200 OK`.

**Consola esperada:**
```
>> Verificando Monolito...
{"status":"UP","service":"backend-monolito","timestamp":"2026-11-23T..."}
>> Monolito OK
>> Verificando Catálogos...
{"status":"UP","service":"servicio-catalogos","timestamp":"2026-11-23T..."}
>> Catálogos OK
>> Verificando Proyectos...
{"status":"UP","service":"servicio-proyectos","timestamp":"2026-11-23T..."}
>> Proyectos OK
```

---

### Post Actions

```groovy
post {
    success { sh 'docker image prune -f' }   // Limpia imágenes sin tag
    failure { echo "Build #42 fallido" }
    always  { sh 'docker logout || true' }   // Siempre cierra sesión
}
```

---

## 8. Verificar el Build en la Interfaz de Jenkins

Después de un build exitoso verás:

```
#42 ✅ (verde)
  Started by user admin
  Duration: 4 min 23 sec
  Stages:
    ✅ 1. Checkout       (3s)
    ✅ 2. Lint & Test    (28s)
    ✅ 3. Docker Build   (2m 10s)
    ✅ 4. Docker Hub Push (1m 05s)
    ✅ 5. Deploy (CD)    (22s)
    ✅ 6. Smoke Test     (18s)
```

Para ver los logs detallados: `Build #42 → Console Output`

---

## 9. Configurar Trigger Automático (Opcional)

Para que Jenkins ejecute el pipeline automáticamente en cada `git push`:

```
Job Configuration → Build Triggers
☑ Poll SCM
Schedule: H/5 * * * *   (revisa cada 5 minutos)

O con webhook de GitHub:
☑ GitHub hook trigger for GITScm polling
```

> [!TIP]
> Con webhooks el pipeline se dispara instantáneamente al hacer `git push`, sin esperar el polling.
