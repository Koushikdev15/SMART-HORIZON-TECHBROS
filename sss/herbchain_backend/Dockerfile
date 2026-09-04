FROM node:22-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
RUN npx tsc && cp -r src/seed/data dist/seed/data

EXPOSE 3000

CMD ["node", "dist/server.js"]
