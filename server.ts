import './server/utils/azureAppInsights'

import knex from 'knex'
import app from './server/index'
// logger needs to be imported after app-insights to allow instrumentation
import logger from './log'
import knexfile from './knexfile'

logger.info('Migration start')

knex({ ...knexfile })
  .migrate.latest()
  .then(() => {
    logger.info('Migration finished')
    app.listen(app.get('port'), () => {
      logger.info(`Licences server listening on port ${app.get('port')}`)
    })
  })
  .catch((err) => {
    logger.error({ err }, 'Knex migration failed')
  })

process.on('unhandledRejection', (err) => {
  logger.error({ err }, 'unhandledRejection at:')
})

process.on('uncaughtException', (err) => {
  logger.error({ err }, 'uncaughtException at:')
  throw err
})
