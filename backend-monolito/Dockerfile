# ==========================================
# Dockerfile: Monolito de Asesorías Académicas
# Node.js Alpine optimizado y seguro
# ==========================================

FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias de producción
RUN npm install --omit=dev

# Etapa final de ejecución
FROM node:20-alpine

LABEL maintainer="Jorge <jorgedev@iudigital.edu.co>"
LABEL description="Servicio Monolítico de Asesorías - IUDigital"

ENV NODE_ENV=production
WORKDIR /app

# Copiar dependencias instaladas desde builder
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
COPY src/ ./src/

# Configurar permisos y usuario no root
RUN chown -R node:node /app
USER node

# Exponer puerto de la aplicación
EXPOSE 3000

# Healthcheck para validar disponibilidad
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "src/index.js"]
