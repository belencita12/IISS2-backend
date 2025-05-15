FROM node:22.14.0 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma migrate deploy
RUN npx prisma generate
RUN npm run build

FROM node:22.14.0

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.env .env
COPY --from=builder /app/prisma ./prisma

EXPOSE 8080

CMD ["node", "dist/main.js"]
