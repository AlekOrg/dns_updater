FROM node:current-alpine3.19

COPY . /app

EXPOSE 80
EXPOSE 443

WORKDIR /app

RUN npm install

CMD node server.js