const moment = require('moment')
const templates = require('./config/notificationTemplates')
const { domain } = require('../config')
const logger = require('../../log.js')

module.exports = function createNotificationService(notifyClient) {
    async function notifyRoOfNewCase(name) {
        const { templateId } = templates.sentToRo
        const date = moment().format('Do MMMM YYYY')

        try {
            notifyClient.sendEmail(templateId, 'some-email@someone.com', {
                personalisation: {
                    name,
                    date,
                    domain,
                },
            })
        } catch (error) {
            // TODO what do we want to do if notification fails?
            logger.error('Error sending notification email ', error.errors)
            return error.errors
        }
    }

    return {
        notifyRoOfNewCase,
    }
}
