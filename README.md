# Proyecto de Asesorías Académicas — IUDigital

API REST para la gestión integral de asesorías académicas de la **Institución Universitaria Digital de Antioquia**.

📚 Consulta la documentación completa en la carpeta [`docs/`](./docs/01_README.md).

## Inicio Rápido

```bash
# 1. Monolito local
cd backend-monolito && cp .env.example .env && npm install && npm run seed && npm start

# 2. Microservicios con Docker Compose
docker compose -f docker/docker-compose.desacoplado.yml up --build

# 3. Pipeline Jenkins (CD)
# Configurar Job > Pipeline > From SCM > Repositorio > Branch > Build Now
```
