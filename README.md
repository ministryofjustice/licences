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
 

# SSO

There are two options for authentication:

* Run the IIS Mock SSO (available in GitHub) - user is automatically logged in via mock SSO

* Set the environment variables listed below to direct SSO requests to an instance of MoJ SSO


# Environment variables

The following environment variables are used and values should be supplied for correct operation but have defaults.


* CLIENT_ID - SSO Client ID
* CLIENT_SECRET - SSO Client secret
* TOKEN_HOST - SSO server host
* AUTHORIZE_PATH - SSO authorization endpoint, usually /oauth/authorize
* TOKEN_PATH - SSO token endpoint, usually /oauth/token
* USER_DETAILS_PATH - SSO user details endpoint, usually /api/user_details
* HEALTHCHECK_INTERVAL - how often to run the passive healthcheck and output to logs, in minutes
* APPINSIGHTS_INSTRUMENTATIONKEY - Key for Azure application inisghts logger
* APP_BASE_URL - Points to healthcheck endpoint

The following environment variables are used and a value MUST be supplied in production.

* SESSION_SECRET - Secure session configuration
