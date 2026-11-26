# Multi-stage build for Online Ticket Booking API
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev 2>/dev/null || npm install --omit=dev
COPY tsconfig.json ./
COPY src ./src
RUN npx tsc || true

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev 2>/dev/null || npm install --omit=dev
COPY --from=build /app/dist ./dist
COPY src ./src
EXPOSE 8080
CMD ["node", "dist/WebAPI/server.js"]
