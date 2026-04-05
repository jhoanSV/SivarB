FROM node:20

WORKDIR /app

# Copiamos archivos de dependencias
COPY package.json yarn.lock ./

# Instalamos dependencias con yarn
RUN yarn install

# Copiamos el resto del proyecto
COPY . .

EXPOSE 3000

CMD ["yarn", "run", "dev"]