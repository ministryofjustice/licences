const moment = require('moment');
const templates = require('./config/notificationTemplates');
const {domain} = require('../config');

module.exports = function createNotificationService(notifyClient) {

    async function notifyRoOfNewCase(name) {
        const {templateId} = templates.sentToRo;
        const date = moment().format('Do MMMM YYYY');

        return notifyClient.sendEmail(templateId, 'matthew.whitfield@digital.justice.org.uk', {
            personalisation: {
                name,
                date,
                domain
            }
        });
    }

    return {
        notifyRoOfNewCase
    };
};

