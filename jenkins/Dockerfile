# ============================================================
# Dockerfile para Jenkins con Docker CLI integrado
# Permite a Jenkins ejecutar docker build, push y compose
# ============================================================

FROM jenkins/jenkins:lts

USER root

# Instalar Docker CLI y curl dentro de Jenkins
RUN apt-get update && \
    apt-get install -y docker.io curl && \
    rm -rf /var/lib/apt/lists/*

# Instalar Docker Compose v2 CLI plugin
RUN mkdir -p /usr/local/lib/docker/cli-plugins && \
    curl -SL https://github.com/docker/compose/releases/download/v2.26.1/docker-compose-linux-x86_64 -o /usr/local/lib/docker/cli-plugins/docker-compose && \
    chmod +x /usr/local/lib/docker/cli-plugins/docker-compose && \
    ln -s /usr/local/lib/docker/cli-plugins/docker-compose /usr/local/bin/docker-compose

USER root
