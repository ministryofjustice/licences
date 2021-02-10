FROM node:14-buster as builder

ARG BUILD_NUMBER
ARG GIT_REF

RUN apt-get update && \
    apt-get upgrade -y

WORKDIR /app

RUN apt-get install -y curl

RUN curl https://s3.amazonaws.com/rds-downloads/rds-ca-2019-root.pem \
    > /app/root.cert


COPY . .

RUN PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true npm ci --no-audit && \
    npm run build && \
    export BUILD_NUMBER=${BUILD_NUMBER:-1_0_0} && \
    export GIT_REF=${GIT_REF:-dummy} && \
    npm run record-build-info

RUN npm prune --production

FROM node:14-buster-slim
LABEL maintainer="HMPPS Digital Studio <info@digital.justice.gov.uk>"

RUN apt-get update && \
    apt-get upgrade -y

# Install latest chrome dev package libs so that the bundled version of Chromium installed by Puppeteer will work
# https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md#running-puppeteer-in-docker
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable libxss1 dumb-init --no-install-recommends \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*

RUN addgroup --gid 2000 --system appgroup && \
    adduser --uid 2000 --system appuser --gid 2000

ENV TZ=Europe/London
RUN ln -snf "/usr/share/zoneinfo/$TZ" /etc/localtime && echo "$TZ" > /etc/timezone

# Create app directory
RUN mkdir /app && chown appuser:appgroup /app
USER 2000
WORKDIR /app

COPY --from=builder --chown=appuser:appgroup \
        /app/package.json \
        /app/package-lock.json \
        /app/dist \
        /app/root.cert \
        /app/build-info.json \
        ./

COPY --from=builder --chown=appuser:appgroup \
        /app/assets ./assets

COPY --from=builder --chown=appuser:appgroup \
        /app/node_modules ./node_modules

COPY --from=builder --chown=appuser:appgroup \
        /app/server/views ./server/views

ENV PORT=3000

EXPOSE 3000

ENV NODE_ENV='production' \
    CHROME_EXECUTABLE='/usr/bin/google-chrome'

USER 2000

ENTRYPOINT ["/usr/bin/dumb-init", "--"]

CMD [ "node", "server.js" ]
