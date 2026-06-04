FROM node:20-alpine AS base

# Etapa de dependencias
FROM base AS deps
WORKDIR /app
# Copiamos package.json desde la carpeta tech-flavor
COPY tech-flavor/package.json tech-flavor/package-lock.json* ./
RUN npm ci

# Etapa de construcción
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
# Copiamos todo el contenido de tech-flavor
COPY tech-flavor/ .
RUN npm run build

# Etapa final (ejecución)
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]