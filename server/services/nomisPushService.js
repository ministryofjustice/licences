const logger = require('../../log.js');

module.exports = nomisClientBuilder => {

    async function pushStatus(bookingId, approvalDecision, systemToken) {
        const nomisClient = nomisClientBuilder(systemToken);

        const statusValues = {
            Yes: 'Approved',
            No: 'Rejected'
        };
        const status = statusValues[approvalDecision];

        if (!status) {
            logger.info('No approval status to push to nomis');
            return null;
        }

        return nomisClient.putApprovalStatus(bookingId, status, systemToken);
    }

    return {
        pushStatus
    };
};

