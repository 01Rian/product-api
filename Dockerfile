# Etapa de build
FROM node:18-alpine AS builder

# Define o diretório de trabalho
WORKDIR /usr/src/app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala todas as dependências (incluindo devDependencies)
RUN npm ci

# Copia o código fonte da aplicação
COPY . .

# Etapa de produção
FROM node:18-alpine

# Define o diretório de trabalho
WORKDIR /usr/src/app

# Copia apenas os arquivos necessários do estágio de build
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/src ./src

# Instala apenas as dependências de produção
RUN npm ci --only=production

# Define variáveis de ambiente para produção
ENV NODE_ENV=production

# Expõe a porta que a API vai usar
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "run", "start:prod"]