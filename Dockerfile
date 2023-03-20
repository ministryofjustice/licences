# Stage: base image
FROM node:18.15-bullseye-slim as base

ARG BUILD_NUMBER=1_0_0
ARG GIT_REF=not-available

LABEL maintainer="HMPPS Digital Studio <info@digital.justice.gov.uk>"

ENV TZ=Europe/London
RUN ln -snf "/usr/share/zoneinfo/$TZ" /etc/localtime && echo "$TZ" > /etc/timezone

RUN addgroup --gid 2000 --system appgroup && \
        adduser --uid 2000 --system appuser --gid 2000

WORKDIR /app

# Cache breaking
ENV BUILD_NUMBER ${BUILD_NUMBER:-1_0_0}

RUN apt-get update && \
        apt-get upgrade -y 
        # apt-get autoremove -y && \
        # rm -rf /var/lib/apt/lists/*

RUN apt-get install -y curl

RUN curl https://s3.amazonaws.com/rds-downloads/rds-ca-2019-root.pem > /app/root.cert

# Stage: build assets
FROM base as build

ARG BUILD_NUMBER=1_0_0
ARG GIT_REF=not-available

RUN apt-get install -y make python3 g++

COPY package*.json ./
RUN npm ci --no-audit

COPY . .
RUN npm run build

RUN export BUILD_NUMBER=${BUILD_NUMBER} && \
        export GIT_REF=${GIT_REF} && \
        npm run record-build-info

RUN npm prune --no-audit --production

# Stage: copy production assets and dependencies
FROM base

COPY --from=build --chown=appuser:appgroup \
        /app/package.json \
        /app/package-lock.json \
        /app/root.cert \
        ./

COPY --from=build --chown=appuser:appgroup \
        /app/build-info.json ./dist/build-info.json

COPY --from=build --chown=appuser:appgroup \
        /app/dist ./dist

COPY --from=build --chown=appuser:appgroup \
        /app/assets ./assets

COPY --from=build --chown=appuser:appgroup \
        /app/node_modules ./node_modules

COPY --from=build --chown=appuser:appgroup \
      /app/server/views ./server/views

ENV PORT=3000
EXPOSE 3000
ENV NODE_ENV='production'
USER 2000

CMD [ "npm", "start" ]
