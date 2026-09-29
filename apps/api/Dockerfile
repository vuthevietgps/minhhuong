# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS api-deps
WORKDIR /workspace/apps/api
COPY package.json /workspace/package.json
COPY package-lock.json /workspace/package-lock.json
COPY apps/api/package.json ./package.json
COPY apps/api/package-lock.json ./package-lock.json
RUN test -s package-lock.json && npm ci

FROM api-deps AS api-build
COPY apps/api/nest-cli.json apps/api/tsconfig.json apps/api/tsconfig.build.json apps/api/prisma.config.ts ./
COPY apps/api/prisma ./prisma
COPY apps/api/src ./src
RUN DATABASE_URL=postgresql://prisma_build:prisma_build@invalid:5432/prisma_build npm run prisma:generate && npm run build

FROM node:22-alpine AS api-production-deps
WORKDIR /workspace/apps/api
ENV NODE_ENV=production
COPY package.json /workspace/package.json
COPY package-lock.json /workspace/package-lock.json
COPY apps/api/package.json ./package.json
COPY apps/api/package-lock.json ./package-lock.json
COPY apps/api/prisma ./prisma
RUN test -s package-lock.json && npm ci --omit=dev && npm cache clean --force
COPY --from=api-build /workspace/apps/api/node_modules/.prisma ./node_modules/.prisma
COPY --from=api-build /workspace/apps/api/node_modules/@prisma/client ./node_modules/@prisma/client

FROM node:22-alpine AS api-runtime
WORKDIR /app
ENV NODE_ENV=production \
    API_PORT=4000
COPY --from=api-production-deps --chown=node:node /workspace/apps/api/node_modules ./node_modules
COPY --from=api-build --chown=node:node /workspace/apps/api/dist ./dist
COPY --chown=node:node apps/api/package.json ./package.json
RUN mkdir -p /app/uploads && chown node:node /app/uploads
USER node
EXPOSE 4000
HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.API_PORT||4000)+'/v1/health/live').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["node", "dist/src/main.js"]

FROM api-deps AS api-migrate
WORKDIR /app
COPY --from=api-deps /workspace/apps/api/package.json ./package.json
COPY --from=api-deps /workspace/apps/api/node_modules ./node_modules
RUN apk add --no-cache postgresql-client su-exec
COPY --chown=node:node apps/api/prisma ./prisma
COPY --chown=node:node apps/api/prisma.config.ts ./prisma.config.ts
COPY --chown=node:node apps/api/scripts/run-hosted-migration.mjs ./scripts/run-hosted-migration.mjs
COPY --chown=node:node deploy/hooks ./deploy/hooks
COPY deploy/migrate-entrypoint.sh /usr/local/bin/minhhuong-migrate-entrypoint
RUN DATABASE_URL=postgresql://prisma_build:prisma_build@invalid:5432/prisma_build npm run prisma:generate && chmod 0555 /usr/local/bin/minhhuong-migrate-entrypoint
ENTRYPOINT ["minhhuong-migrate-entrypoint"]
