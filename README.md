# Licences Application UI.

[![CircleCI](https://circleci.com/gh/ministryofjustice/licences/tree/main.svg?style=svg)](https://circleci.com/gh/ministryofjustice/licences)
[![Known Vulnerabilities](https://snyk.io/test/github/ministryofjustice/licences/badge.svg)](https://snyk.io/test/github/ministryofjustice/licences)

# Get Started

0. Install node and npm (check package.json for required versions)

- Node 14.16 or higher
- NPM 7.2.4 or higher

1. Install the dependencies required to run the service:

```
$ npm install
```

2. Supply environment variables. The required environment variables are defined in server/config.js.

These can be overridden by putting entries in a `.env` file.

3. Start the server

```
$ npm run start
```

Or, for development, build css and restart server on file changes:

```
$ npm run start:dev
```

To run locally you need:
- database
- redis
- auth server
- nomis
- delius api
- probation teams
- gotenberg
- nomis-user-roles-api

You can run local database, redis and configure the application to point to the T3/dev environment for other services.
Or these can be run locally using `docker-compose` and starting `mock-services`.
Or you can point to mock-services for a subset of services and T3/dev for others..

If you get a ‘You are not authorised to access this application’ when trying to run the app locally, 
Then login as NOMIS_BATCHLOAD user and go to ‘manage locations’ and then 'ABC probation area (ABC)' and ensure it is ticked.

4. Visit [localhost:3000](http://localhost:3000/)

## Developer Commands

- `npm run lint` -> style checks using eslint
- `npm run test` -> runs all unit tests
- `npm run clean` -> cleans previously generated files
- `npm run build` -> cleans and regenerates assets.
- `npm run typecheck` -> runs typescript type checking
- `npm run start:feature` -> runs the application configured to run integration tests

## Docker Compose Files
- [docker-compose.yml](./docker-compose.yml) -> used for integration tests. More information can be found in the [./licences-specs/Readme.md](./licences-specs/Readme.md).
- [docker-compose-full.yml](./docker-compose-full.yml) -> used to spin up the licences service and all dependencies locally.
- [docker-compose-minimal](./docker-compose-minimal.yml) -> used to spin up a local `Redis` and `Postgres` instance. Useful for when wanting to connect to a development environment for all other dependencies.

# Environment variables

To create a .env file, copy `feature.env` to `.env` and make any required changes.
This file is `.gitignore`d

`feature.env` contains defaults required for integration tests 

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

# Save and restore the licences table
There are two scripts in the server directory that take and restore snapshots of the licences table.
The scripts are called `saveLicences.js` and `loadLicences.js`.  Both scripts take database connection details from `server/config.js`
and hence from values in your `.env` file.

`saveLicences` takes one argument that should be a file path (without a .json suffix). It
reads the contents of the licences table and writes those values, as an array of JSON objects, to the named file.

`loadLicences` takes one argument that should be a path to a JSON file previously created by `saveLicences`. The path
should include the `.json` suffix (This helps with command completion). It truncates the licences table,
then writes every row in the JSON file into the table.

Running the command `npm link` will add these scripts to your PATH as `saveLicences` and `loadLicences`
You can then run either of these scripts from any location that has a suitably configured `.env` file.
