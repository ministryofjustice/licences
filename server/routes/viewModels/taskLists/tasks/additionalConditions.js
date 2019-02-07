const {standardAction} = require('./utils/actions');

module.exports = {
    getLabel: ({decisions, tasks}) => {
        const {standardOnly, bespoke, additional} = decisions;
        const {licenceConditions} = tasks;

        if (licenceConditions === 'DONE') {
            if (standardOnly) {
                return 'Standard conditions only';
            }
            const totalConditions = bespoke + additional;
            return `${totalConditions} condition${totalConditions > 1 ? 's' : ''} added`;
        }
        return 'Not completed';
    },

    getRoAction: ({tasks}) => {
        const {licenceConditions} = tasks;
        return standardAction(licenceConditions, '/hdc/licenceConditions/standard/');
    }
};
