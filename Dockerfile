# Use a imagem oficial do Node.js como base
FROM node:18-alpine

# Cria e define o diretório de trabalho
WORKDIR /usr/src/

# Copia os arquivos de dependências
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o código fonte da aplicação
COPY . .

# Expõe a porta que a API vai usar
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "run", "start:prod"] 