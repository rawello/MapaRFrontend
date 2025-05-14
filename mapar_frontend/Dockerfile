# Этап разработки (для live-перезагрузки)
FROM node:lts-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

ENV PORT 4000
EXPOSE 4000

CMD ["npm", "start"]