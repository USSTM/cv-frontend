# Build stage
FROM node:24-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# Final stage
FROM node:24-alpine
WORKDIR /app

COPY --from=builder /app/.output ./.output

ENV PORT=3000
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
