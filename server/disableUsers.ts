#!/usr/bin/env node

/**
 * Read a list of auth service usernames from stdin, one username per line.
 * Disable or enable the account for every username in the list, printing the resulting user state to stdout as JSON.
 * This script occurs twice, once as disableUsers.ts and again (via a soft link) as enableUsers.ts
 * The script chooses whether to enable or disable users from the value of process.argv[1]
 *
 * If this script is included in a Docker image (as it will be if deployed to the cluster environments)
 * it can be run in one of the deployed pods, with input redirected from a local file. That is, a file
 * hosted on the machine where the kubectl command is run. Running the script in a pod means that the
 * script will see correctly configured environment variables for that namespace.
 *
 * Such an invocation might look like:
 *
 * kubectl -n licences-prod exec -i licences-<pod_id> -- node server/disableUsers.js < usernames.txt
 *
 * Where pod_id is obtained from a previous kubectl get pods command and usernames.txt is a file in the current
 * directory which contains auth service usernames, one per line.
 */

import concat from 'concat-stream'
import { buildRestClient, clientCredentialsTokenSource, TokenSource } from './data/restClientBuilder'
import createSignInService from './authentication/signInService'
import config from './config'

/**
 * Always return the first token retrieved from the wrapped TokenSource.
 * Sufficient for a script that will complete within the cached token's expiry time.
 * Could extend this to refresh tokens when they expire which might be useful for
 * REST clients that use client credentials.
 */
const cachingTokenSource = (tokenSource: TokenSource): TokenSource => {
  let token: string
  return async () => {
    if (!token) {
      token = await tokenSource()
    }
    return token
  }
}

const oauthRestClient = buildRestClient(
  cachingTokenSource(clientCredentialsTokenSource(createSignInService(), 'nomis')),
  `${config.nomis.authUrl}`,
  'OAuth API',
  { timeout: config.nomis.timeout, agent: config.nomis.agent }
)

const disableAuthUser = (username) => oauthRestClient.putResource(`/api/authuser/${username}/disable`, {})
const enableAuthUser = (username) => oauthRestClient.putResource(`/api/authuser/${username}/enable`, {})
const getUser = (username) => oauthRestClient.getResource(`/api/authuser/${username}`)

const updateUser = async (username, disableUser: boolean) => {
  if (username) {
    try {
      await (disableUser ? disableAuthUser(username) : enableAuthUser(username))
      return getUser(username)
    } catch (error) {
      // Carry on...
    }
  }
  return undefined
}

const updateUsers = (usernames: string[], disableUsers = true) =>
  usernames.reduce(
    (promise, username) =>
      promise
        .then(() => updateUser(username, disableUsers))
        .then((data) => new Promise((resolve) => process.stdout.write(`${JSON.stringify(data)}\n`, () => resolve()))),
    Promise.resolve()
  )

const consumeInputBuffer = (buffer) => {
  const usernames = buffer.toString().split('\n')
  const disableUsers = !process.argv[1].includes('enableUsers')
  updateUsers(usernames, disableUsers)
    .then(() => process.stdout.write('Done\n'))
    .then(() => process.exit(0))
}

process.stdin.pipe(concat(consumeInputBuffer))
