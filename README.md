# Licences Application UI.

[![CircleCI](https://circleci.com/gh/noms-digital-studio/licences/tree/master.svg?style=svg)](https://circleci.com/gh/noms-digital-studio/licences/tree/master)
[![Known Vulnerabilities](https://snyk.io/test/github/noms-digital-studio/licences/badge.svg)](https://snyk.io/test/github/noms-digital-studio/licences)

# Get Started

1. Install the dependencies required to run the service:

  ```
  $ yarn
  ```  
2. Supply environment variables. The required environment variables are defined in server/config.js.


3. Start the server

  ```   
  $ yarn run start
  ```

   Or, for development, run inspections, tests, watch for changes and start the server:
   
  ```   
  $ yarn run dev
  ```
  
4. Visit [localhost:3000](http://localhost:3000/)

## Developer Commands

 - `yarn run lint` -> style checks using eslint
 - `yarn run test` -> runs all unit tests
 - `yarn run clean` -> cleans previously generated files
 - `yarn run build` -> cleans and regenerates assets.
 

# Environment variables

The following environment variables are used and values should be supplied for correct operation but have defaults.

* NOMIS_API_URL - url for nomis elite2 api entry point eg http://localhost:9090/elite2api
* NOMIS_GW_TOKEN - MoJ dev token for nomis elite2 access
* NOMIS_GW_KEY - Base64 encoded private key corresponding to the public key used when generating the NOMIS_GW_TOKEN

For the database:

* DB_USER - username for DB access
* DB_PASS - password for DB access
* DB_SERVER - DB server host
* DB_NAME - DB name
* DB_SSL_ENABLED - set to false for local

For the PDF generator service

* PDF_TEMPLATE_NAME - Name of template to use eg 'hdc_ap_pss'
* PDF_SERVICE_HOST - Root of PDF generator service eg 'http://localhost:8081' or 'http://localhost:9090' if using wiremock

# AWS database access

When accessing the AWS Postgres databases eg for the stage env, SSL must be enabled (DB_SSL_ENABLED=true) and you
need a file in the root of the project called root.cert containing the AWS RDS root certificate

see https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.SSL.html

## Migrations

Migrations are managed using [knex](http://knexjs.org/#Migrations-CLI) and [knex-migrate](https://github.com/sheerun/knex-migrate)

Execute migration

```
yarn migrate
```

Other migration commands

```
yarn run knex-migrate <command>
```

Commands
* pending   Lists all pending migrations
* list      Lists all executed migrations
* up        Performs all pending migrations
* down      Rollbacks last migration
* rollback  Rollbacks last batch of migrations
* redo      Rollbacks last batch and performs all migrations

Create a new migration script

```
yarn run knex migrate:make <script-name>
```

## Seed data

Execute seed scripts to populate DB with test data

```
yarn seed
```

Create a new seed file

```
yarn run knex seed:make <script-name>
```

## Local database set up

```
CREATE DATABASE licences CONTAINMENT = PARTIAL
``` 
