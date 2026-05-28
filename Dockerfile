FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache git bash

COPY package.json package-lock.json* ./

RUN npm install

COPY . .

EXPOSE 8081 19000 19001 19002

CMD ["npx", "expo", "start", "--host", "lan"]