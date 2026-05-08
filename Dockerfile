# Build args available to all stages
ARG BUILD_NUMBER
ARG GIT_REF
ARG GIT_BRANCH

# Stage: build assets
FROM ghcr.io/ministryofjustice/hmpps-node:24-alpine AS build

ARG BUILD_NUMBER
ARG GIT_REF
ARG GIT_BRANCH

# Cache breaking and ensure required build / git args defined
RUN test -n "$BUILD_NUMBER" || (echo "BUILD_NUMBER not set" && false)
RUN test -n "$GIT_REF" || (echo "GIT_REF not set" && false)
RUN test -n "$GIT_BRANCH" || (echo "GIT_BRANCH not set" && false)

WORKDIR /app

COPY package*.json .allowed-scripts.mjs .npmrc ./
RUN CYPRESS_INSTALL_BINARY=0 NPM_CONFIG_AUDIT=false NPM_CONFIG_FUND=false SKIP_PRECOMMIT_INIT=true npm run setup
ENV NODE_ENV='production'

COPY . .
RUN npm run build

RUN npm prune --no-audit --no-fund --omit=dev

# Install AWS RDS Root cert for Postgres clients
ADD https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem /app/root.cert
RUN chown appuser:appgroup /app/root.cert && \
    chmod 0644 /app/root.cert

# Stage: copy production assets and dependencies
FROM ghcr.io/ministryofjustice/hmpps-node:24-alpine-runtime

ARG BUILD_NUMBER
ARG GIT_REF
ARG GIT_BRANCH

COPY --from=build --chown=appuser:appgroup \
        /app/package.json \
        /app/package-lock.json \
        /app/root.cert \
        /app/.allowed-scripts.mjs \
        /app/.npmrc \
        ./

COPY --from=build --chown=appuser:appgroup \
        /app/assets ./assets

COPY --from=build --chown=appuser:appgroup \
        /app/dist ./dist

COPY --from=build --chown=appuser:appgroup \
        /app/migrations ./migrations

COPY --from=build --chown=appuser:appgroup \
        /app/node_modules ./node_modules

COPY --from=build --chown=appuser:appgroup \
        /app/server/views ./server/views

EXPOSE 3000
ENV BUILD_NUMBER=${BUILD_NUMBER}
ENV GIT_REF=${GIT_REF}
ENV GIT_BRANCH=${GIT_BRANCH}
ENV NODE_ENV='production'
USER 2000

CMD [ "node", "dist/server.js" ]
