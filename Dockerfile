# Etapa 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copia os arquivos de dependência e instala
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

# Copia todo o código da aplicação
COPY . .

# Gera o build para produção
RUN pnpm build

# Etapa 2: Runtime
FROM node:20-alpine AS runner

WORKDIR /app

# Copia apenas o necessário da etapa de build
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.js ./

ENV NODE_ENV=production

# Porta padrão usada pelo Next.js
EXPOSE 3000

# Comando para iniciar o servidor Next.js
CMD ["pnpm", "start"]
