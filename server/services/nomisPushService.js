const logger = require('../../log.js');
const {keys, intersection} = require('../utils/functionalHelpers');

module.exports = nomisClientBuilder => {

    async function pushStatus(bookingId, dataObject, systemToken) {
        const nomisClient = nomisClientBuilder(systemToken);

        const statusMethods = {
            approval: getApprovalStatus,
            postpone: getPostponeStatus
        };
        const methodKey = intersection(keys(dataObject), keys(statusMethods))[0];
        const status = statusMethods[methodKey](dataObject);

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

function getApprovalStatus({approval}) {
    const statusValues = {
        Yes: 'Approved',
        No: 'Rejected'
    };
    return statusValues[approval];
}

function getPostponeStatus({postpone, postponeReason}) {
    if (postpone === 'Yes') {
        const statusValues = {
            investigation: 'Postponed Investigation',
            outstandingRisk: 'Postponed Outstanding Risk'
        };
        return statusValues[postponeReason];
    }
    return null;
}
