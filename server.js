const knex = require('knex')
const logger = require('./log')
const app = require('./server/index')
const knexfile = require('./knexfile')

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
