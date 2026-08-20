FROM node:16-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY .babelrc webpack.config.js ./
COPY public ./public
COPY src ./src

EXPOSE 8080

CMD ["npm", "start"]