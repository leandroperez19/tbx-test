FROM node:14-alpine

WORKDIR /usr/src/app

# La imagen de Node 14 incluye npm 6, que no puede interpretar un
# package-lock.json con lockfileVersion 3. Se actualiza npm para que la
# instalación respete el lockfile en lugar de resolver versiones nuevas.
RUN npm install -g npm@9

# Se copian primero los manifiestos para aprovechar la cache de capas:
# si no cambian las dependencias, npm ci no se vuelve a ejecutar.
COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src

EXPOSE 3000

CMD ["npm", "start"]