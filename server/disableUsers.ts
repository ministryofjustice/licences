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
import { buildRestClient, clientCredentialsTokenSource } from './data/restClientBuilder'
import SignInService from './authentication/signInService'
import config from './config'
import TokenStore from './data/tokenStore'
import { createRedisClient } from './data/redisClient'

const writeStdOut = (data) => new Promise<void>((resolve) => process.stdout.write(data, () => resolve()))

const oauthRestClient = buildRestClient(
  clientCredentialsTokenSource(new SignInService(new TokenStore(createRedisClient({ legacyMode: false }))), 'nomis'),
  `${config.nomis.authUrl}`,
  'OAuth API',
  { timeout: config.nomis.timeout, agent: config.nomis.agent }
)

const disableAuthUser = (username) => oauthRestClient.putResource(`/api/authuser/${username}/disable`, {})
const enableAuthUser = (username) => oauthRestClient.putResource(`/api/authuser/${username}/enable`, {})
const getUser = (username) => oauthRestClient.getResource(`/api/authuser/${username}`)

const updateUser = async (username, disableUser: boolean) => {
  if (username) {
    await (disableUser ? disableAuthUser(username) : enableAuthUser(username))
    return getUser(username)
  }
  return undefined
}

const updateUsers = async (usernames: string[], disableUsers = true) => {
  // eslint-disable-next-line no-restricted-syntax
  for (const username of usernames) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const user = await updateUser(username, disableUsers)
      // eslint-disable-next-line no-await-in-loop
      await writeStdOut(`${JSON.stringify(user)}\n`)
    } catch (error) {
      // eslint-disable-next-line no-await-in-loop
      await writeStdOut(`Caught error while updating user '${username}': ${JSON.stringify(error)}\n`)
    }
  }
}

const consumeInputBuffer = async (buffer) => {
  const usernames = buffer.toString().split('\n')
  const disableUsers = !process.argv[1].includes('enableUsers')
  await updateUsers(usernames, disableUsers)
  await writeStdOut('Done\n')
  process.exit(0)
}

process.stdin.pipe(concat(consumeInputBuffer))
