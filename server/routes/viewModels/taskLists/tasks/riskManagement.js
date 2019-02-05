const {standardAction} = require('./utils/actions');

module.exports = {
    getLabel: ({decisions, tasks}) => {
        const {addressUnsuitable, awaitingRiskInformation, riskManagementNeeded} = decisions;
        const {riskManagement} = tasks;

        if (addressUnsuitable) {
            return 'Address unsuitable';
        }

        if (riskManagement === 'DONE') {
            if (awaitingRiskInformation) {
                return 'WARNING||Still waiting for information';
            }
            return riskManagementNeeded ? 'Risk management required' : 'No risks';
        }

        return 'Not completed';
    },

    getRoAction: ({tasks}) => {
        const {riskManagement} = tasks;
        return standardAction(riskManagement, '/hdc/risk/riskManagement/');
    }
};


