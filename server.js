const knex = require('knex')
const logger = require('./log')
const config = require('./server/config')
const app = require('./server/index')
const healthcheck = require('./server/services/healthcheck')
const appInsights = require('./azure-appinsights')
const { flattenMeta } = require('./server/misc')
const knexfile = require('./knexfile')

if (config.healthcheckInterval) {
  reportHealthcheck()
  setInterval(reportHealthcheck, config.healthcheckInterval * 60 * 1000)
}

function reportHealthcheck() {
  healthcheck(recordHealthResult)
}

function recordHealthResult(err, results) {
  if (err) {
    logger.error('healthcheck failed', err)
    return
  }
  logger.info('healthcheck', results)
  if (results.healthy && appInsights) {
    appInsights.defaultClient.trackEvent('healthy', flattenMeta(results))
  }
}

logger.debug('Migration start')

knex({ ...knexfile })
  .migrate.latest()
  .then(() => {
    logger.debug('Migration finished')
    app.listen(app.get('port'), () => {
      logger.info(`Licences server listening on port ${app.get('port')}`)
    })
  })
  .catch(err => {
    logger.error('Knex migration failed', err)
  })
