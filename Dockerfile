# Use uma imagem base do Node.js
FROM node:20-slim

# Defina o diretório de trabalho no container
WORKDIR /app

# Defina as variáveis ARG para todas as envs necessárias
ARG POSTGRES_URL
ARG STRIPE_SECRET_KEY
ARG STRIPE_WEBHOOK_SECRET
ARG BASE_URL
ARG AUTH_SECRET
ARG POSTGRES_USER
ARG POSTGRES_PASSWORD
ARG POSTGRES_DB

# Torne as variáveis disponíveis no ambiente de runtime
ENV POSTGRES_URL=$POSTGRES_URL
ENV STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY
ENV STRIPE_WEBHOOK_SECRET=$STRIPE_WEBHOOK_SECRET
ENV BASE_URL=$BASE_URL
ENV AUTH_SECRET=$AUTH_SECRET
ENV POSTGRES_USER=$POSTGRES_USER
ENV POSTGRES_PASSWORD=$POSTGRES_PASSWORD
ENV POSTGRES_DB=$POSTGRES_DB

# Instale o pnpm globalmente
RUN npm install -g pnpm

# Limpar cache do pnpm para evitar dependências corrompidas
RUN pnpm store prune

# Copiar o arquivo de lock e o package.json primeiro
COPY package.json pnpm-lock.yaml ./

# Instalar dependências com pnpm
RUN pnpm install --frozen-lockfile

# Copiar o restante dos arquivos da aplicação
COPY . .

# Rodar o build da aplicação
RUN pnpm run build

# Expor a porta da aplicação
EXPOSE 3000

# Rodar migrations na inicialização do container
CMD ["sh", "-c", "pnpm db:migrate && pnpm start"]
