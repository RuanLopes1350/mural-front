# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

ARG NEXT_PUBLIC_AMBIENTE=production
ENV NEXT_PUBLIC_AMBIENTE=$NEXT_PUBLIC_AMBIENTE
ARG NEXT_PUBLIC_API_URL=https://api.mural.fslab.dev
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY package.json package-lock.json ./
RUN npm ci --silent

COPY . .

# Build-time args

RUN npm run build

# Production stage
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Criar usuário não-root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copiar arquivos necessários
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
