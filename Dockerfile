FROM node:8.10
MAINTAINER HMPPS Digital Studio <info@digital.justice.gov.uk>
ARG BUILD_NUMBER
ARG GIT_REF

# Create app directory
RUN mkdir -p /app
WORKDIR /app
ADD . .

# Install AWS RDS Root cert
RUN curl https://s3.amazonaws.com/rds-downloads/rds-ca-2015-root.pem > /app/root.cert

RUN yarn --frozen-lockfile && \
    yarn run build && \
    export BUILD_NUMBER=${BUILD_NUMBER} && \
    export GIT_REF=${GIT_REF} && \
    yarn run record-build-info

ENV PORT=3000

EXPOSE 3000
CMD [ "yarn", "start" ]
