# Imagem leve, node 20 LTS
FROM node:20-slim

# Dependências nativas para compilar better-sqlite3
RUN apt-get update && apt-get install -y --no-install-recommends \
      python3 make g++ ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Instala deps de produção primeiro (cache layer)
COPY package*.json ./
RUN npm install --omit=dev

# Copia o resto do código
COPY . .

# O Railway (e outros) injetam a variável PORT
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Para que a BD SQLite viva num volume persistente, monta-o em /data
# e define DATABASE_PATH=/data/portal.db nas variáveis do serviço.

CMD ["node", "backend/server.js"]
