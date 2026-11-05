FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --no-fund
COPY . .
ARG NEXT_PUBLIC_API_URL=https://cs2.devkoala.com/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL NEXT_TELEMETRY_DISABLED=1
RUN npx tsc --noEmit --incremental false && npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ARG GIT_COMMIT_SHA=local
ENV NODE_ENV=production TZ=America/Sao_Paulo NEXT_TELEMETRY_DISABLED=1 GIT_COMMIT_SHA=$GIT_COMMIT_SHA HOSTNAME=0.0.0.0 PORT=3000
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
USER node
EXPOSE 3000
CMD ["node", "server.js"]
