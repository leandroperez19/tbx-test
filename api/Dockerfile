FROM node:14-alpine

WORKDIR /usr/src/app

# Se copian primero los manifiestos para aprovechar la cache de capas:
# si no cambian las dependencias, npm ci no se vuelve a ejecutar.
COPY package*.json ./
RUN npm ci --only=production

COPY src ./src

EXPOSE 3000

CMD ["npm", "start"]
