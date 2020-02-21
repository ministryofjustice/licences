FROM node:10-buster-slim
LABEL maintainer="HMPPS Digital Studio <info@digital.justice.gov.uk>"
ARG BUILD_NUMBER
ARG GIT_REF

RUN addgroup --gid 2000 --system appgroup && \
    adduser --uid 2000 --system appuser --gid 2000

# Create app directory
WORKDIR /app
COPY --chown=appuser:appgroup . .

# Install latest chrome dev package libs so that the bundled version of Chromium installed by Puppeteer will work
# https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md#running-puppeteer-in-docker    
RUN apt-get update \
    && apt-get install -y wget curl gnupg gnupg1 gnupg2 \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-unstable --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Install AWS RDS Root cert
RUN curl https://s3.amazonaws.com/rds-downloads/rds-ca-2019-root.pem > /app/root.cert

RUN npm install --production && \
    npm run build && \
    export BUILD_NUMBER=${BUILD_NUMBER:-1_0_0} && \
    export GIT_REF=${GIT_REF:-dummy} && \
    npm run record-build-info

ENV PORT=3000

EXPOSE 3000

USER 2000

CMD [ "npm", "start" ]
