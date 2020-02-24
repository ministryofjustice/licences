# Licences Application UI.

[![CircleCI](https://circleci.com/gh/ministryofjustice/licences/tree/master.svg?style=svg)](https://circleci.com/gh/ministryofjustice/licences)
[![Known Vulnerabilities](https://snyk.io/test/github/ministryofjustice/licences/badge.svg)](https://snyk.io/test/github/ministryofjustice/licences)

# Get Started

0. Install node and npm (check package.json for required versions)

- Node 10.15 or higher
- NPM 5.6 or higher

1. Install the dependencies required to run the service:

```
$ npm install
```

2. Supply environment variables. The required environment variables are defined in server/config.js.

3) Start the server

```
$ npm run start
```

Or, for development, build css and restart server on file changes:

```
$ npm run start:dev
```

To run locally you also need the database, the Nomis API mocks, and the auth server. These can all be started by running

```
docker-compose up
```

4. Visit [localhost:3000](http://localhost:3000/)

## Developer Commands

- `npm run lint` -> style checks using eslint
- `npm run test` -> runs all unit tests
- `npm run clean` -> cleans previously generated files
- `npm run build` -> cleans and regenerates assets.
- `npm run typecheck` -> runs typescript type checking

# Environment variables

The following environment variables are used and values should be supplied for correct operation but have defaults.
The easiest way to supply them is to create a .env file in the project root.

- NOMIS_API_URL - url for nomis elite2 api entry point eg http://localhost:8080/elite2api
- NOMIS_AUTH_URL - url for nomis oauth server eg http://localhost:9090/auth
- AUTH_STRATEGY - local if running locally else oauth
- DOMAIN - domain where the app is running eg http://localhost:3000

Oauth config:

- API_CLIENT_SECRET
- ADMIN_API_CLIENT_SECRET
- API_CLIENT_ID
- ADMIN_API_CLIENT_ID

For the database:

- DB_USER - username for DB access
- DB_PASS - password for DB access
- DB_SERVER - DB server host
- DB_NAME - DB name
- DB_SSL_ENABLED - set to false for local

Other

- ENABLE_TEST_UTILS=true to enable test utils such as resetting DB
- 2019_CONDITIONS=yes turns on the new licence conditions
- PUSH_TO_NOMIS=yes to send approval status updates to nomis

# AWS database access

When accessing the AWS Postgres databases eg for the stage env, SSL must be enabled (DB_SSL_ENABLED=true) and you
need a file in the root of the project called root.cert containing the AWS RDS root certificate

see https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.SSL.html

## Migrations

Migrations are managed using [knex-migrate](https://github.com/sheerun/knex-migrate)

Migration commands

```
npm run db:knex-migrate <command>
```

Commands

- pending Lists all pending migrations
- list Lists all executed migrations
- up Performs all pending migrations
- down Rollbacks last migration
- rollback Rollbacks last batch of migrations
- redo Rollbacks last batch and performs all migrations

## Seed data

Execute seed scripts to populate DB with test data

```
npm run db:seed
```

# Feature specs

Feature specs are in /licences-specs which has its own README

# Snyk

To explicitly ignore a dependency, first authenticate: `npx snyk auth`
This will open a browser and allow authenticating against snyk account (using github as auth provider)

To ignore a dependency:

```
npx snyk ignore --id='npm:jquery:1.12.4' --expiry='2020-04-01' --reason='Required for legacy browser support'
```

And then commit generated file.
