import knex from 'knex'
import logger from './log'
import app from './server/index'
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
