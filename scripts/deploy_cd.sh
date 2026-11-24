#!/bin/bash
# ============================================================
# deploy_cd.sh — Script auxiliar de despliegue invocado por Jenkins
# Variables requeridas: DOCKER_USER, TAG, COMPOSE_FILE
# ============================================================

DOCKER_USER="${DOCKER_USER:-jorgedevsoft}"
TAG="${TAG:-latest}"
COMPOSE_FILE="${COMPOSE_FILE:-docker/docker-compose.cd.yml}"

echo "=== Deploy CD — IUDigital Asesorías ==="
echo "DOCKER_USER: $DOCKER_USER"
echo "TAG: $TAG"
echo "COMPOSE_FILE: $COMPOSE_FILE"

export DOCKER_USER TAG

echo ">> Descargando imágenes desde Docker Hub..."
docker compose -f "$COMPOSE_FILE" pull

echo ">> Deteniendo contenedores anteriores..."
docker compose -f "$COMPOSE_FILE" down --remove-orphans

echo ">> Levantando nueva versión..."
docker compose -f "$COMPOSE_FILE" up -d --force-recreate

echo ">> Esperando 15 segundos para disponibilidad..."
sleep 15

echo ">> Smoke Test..."
curl -f http://localhost:3000/health && echo "Monolito OK" || echo "WARN: Monolito no respondió"
curl -f http://localhost:4001/health && echo "Catálogos OK" || echo "WARN: Catálogos no respondió"
curl -f http://localhost:4002/health && echo "Proyectos OK" || echo "WARN: Proyectos no respondió"

echo ">> Limpieza de imágenes sin usar..."
docker image prune -f

echo "=== Deploy CD completado ==="
