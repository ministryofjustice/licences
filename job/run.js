const logger = require('../log')
const job = require('./gatherActiveLdus')

job().catch(error => logger.error(error, 'Problem polling for reminders'))
