# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS web-deps
WORKDIR /app
COPY apps/web/package.json ./package.json
COPY apps/web/package-lock.json ./package-lock.json
RUN test -s package-lock.json && npm ci

FROM web-deps AS web-build
ARG NEXT_PUBLIC_API_URL
ARG DEPLOYMENT_ENVIRONMENT=hosted-staging
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV DEPLOYMENT_ENVIRONMENT=${DEPLOYMENT_ENVIRONMENT}
COPY apps/web/next.config.ts apps/web/tsconfig.json apps/web/next-env.d.ts apps/web/postcss.config.mjs ./
COPY apps/web/public ./public
COPY apps/web/src ./src
RUN npm run build

FROM node:22-alpine AS web-runtime
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0
COPY --from=web-build --chown=node:node /app/public ./public
COPY --from=web-build --chown=node:node /app/.next/standalone ./
COPY --from=web-build --chown=node:node /app/.next/static ./.next/static
USER node
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
