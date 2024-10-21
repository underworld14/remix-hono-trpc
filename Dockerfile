# base node image
FROM node:20-alpine AS base

# set for base and all layer that inherit from it
ENV NODE_ENV=production
ENV PORT=8080

# Install pnpm
RUN npm install -g pnpm@9

# Install all node_modules, including dev dependencies
FROM base AS deps

WORKDIR /app

# Install necessary dependencies for pnpm and node-gyp
RUN apk add --no-cache libc6-compat python3 make g++

ADD package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod=false

# Setup production node_modules
FROM base AS production-deps

WORKDIR /app

COPY --from=deps /app/node_modules /app/node_modules
ADD package.json pnpm-lock.yaml ./
RUN pnpm prune --prod

# Build the app
FROM base AS build

WORKDIR /app

COPY --from=deps /app/node_modules /app/node_modules

ADD . .
RUN pnpm run build

# Finally, build the production image with minimal footprint
FROM base

WORKDIR /app

# You only need these for production
COPY --from=production-deps /app/node_modules /app/node_modules
COPY --from=build /app/build /app/build
COPY --from=build /app/package.json /app/package.json

CMD [ "pnpm", "run", "start" ]