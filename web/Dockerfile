FROM node:16-alpine

WORKDIR /usr/src/app

# Se actualiza npm por el mismo motivo que en la API: compatibilidad con el
# formato del package-lock.json generado por versiones recientes de npm.
RUN npm install -g npm@9

COPY package*.json ./
RUN npm ci

COPY .babelrc webpack.config.js jest.config.js ./
COPY public ./public
COPY src ./src

EXPOSE 8080

CMD ["npm", "start"]