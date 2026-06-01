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
    logger.error('Knex migration failed', err)
  })

process.on('unhandledRejection', (err) => {
  logger.error('unhandledRejection at:', err)
})

process.on('uncaughtException', (err) => {
  logger.error('uncaughtException at:', err)
  throw err
})
