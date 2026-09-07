# Imagem leve, node 20 LTS
FROM node:20-slim

# Dependências nativas + Chromium para gerar os PDFs dos relatórios Meta
RUN apt-get update && apt-get install -y --no-install-recommends \
      python3 make g++ ca-certificates chromium \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

ENV NODE_ENV=production
ENV PORT=3000
ENV CHROMIUM_PATH=/usr/bin/chromium
EXPOSE 3000

# Para persistir BD e relatórios no Railway, usar DATABASE_PATH=/data/portal.db
# e manter o volume montado em /data. Os PDFs ficam em /data/meta-reports.
CMD ["node", "backend/run.js"]
