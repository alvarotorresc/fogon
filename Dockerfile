FROM node:22-slim AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Copy workspace root files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json ./

# Copy only the packages needed for API
COPY packages/types/package.json packages/types/
COPY apps/api/package.json apps/api/

# Install dependencies
RUN pnpm install --frozen-lockfile --filter @fogon/api...

# Copy source
COPY packages/types/ packages/types/
COPY apps/api/ apps/api/

# Build
WORKDIR /app/apps/api
RUN pnpm build

# Production
FROM node:22-slim AS production
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY --from=base /app/pnpm-lock.yaml /app/pnpm-workspace.yaml /app/package.json ./
COPY --from=base /app/packages/types/package.json packages/types/
COPY --from=base /app/apps/api/package.json apps/api/

RUN pnpm install --frozen-lockfile --filter @fogon/api... --prod

COPY --from=base /app/packages/types/ packages/types/
COPY --from=base /app/apps/api/dist/ apps/api/dist/
COPY --from=base /app/apps/api/nest-cli.json apps/api/nest-cli.json

WORKDIR /app/apps/api
EXPOSE 3000
CMD ["node", "dist/main.js"]
