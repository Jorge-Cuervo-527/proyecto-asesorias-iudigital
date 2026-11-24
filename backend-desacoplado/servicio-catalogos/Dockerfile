# ==========================================
# Dockerfile: Servicio Catálogos (Microservicio)
# Node.js Alpine optimizado y seguro
# ==========================================

FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev

FROM node:20-alpine

LABEL maintainer="Jorge <jorgedev@iudigital.edu.co>"
LABEL description="Microservicio de Catálogos - IUDigital"

ENV NODE_ENV=production
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
COPY src/ ./src/

RUN chown -R node:node /app
USER node

EXPOSE 4001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4001/health || exit 1

CMD ["node", "src/index.js"]
