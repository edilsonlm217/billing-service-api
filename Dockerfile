# Use uma imagem base do Node.js
FROM node:20-alpine

# Defina o diretório de trabalho no container
WORKDIR /app

# Instale o pnpm globalmente
RUN npm install -g pnpm

# Limpar cache do pnpm para evitar dependências corrompidas
RUN pnpm store prune

# Copiar o arquivo de lock e o package.json primeiro
# Isso é feito para que o Docker possa cachear essas camadas
COPY package.json pnpm-lock.yaml ./

# Instalar dependências com pnpm
RUN pnpm install --frozen-lockfile

# Copiar o restante dos arquivos da aplicação
COPY . .

# Rodar o build da aplicação
RUN pnpm run build

# Definir a porta que a aplicação vai expor
EXPOSE 3000

# Definir o comando para rodar a aplicação
CMD ["pnpm", "start"]
