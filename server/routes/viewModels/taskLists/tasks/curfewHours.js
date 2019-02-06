const {standardAction} = require('./utils/actions');

module.exports = {
    getLabel: ({decisions, tasks}) => {
        const {curfewHours} = tasks;
        return curfewHours === 'DONE' ? 'Confirmed' : 'Not completed';
    },

    getRoAction: ({tasks}) => {
        const {curfewHours} = tasks;
        return standardAction(curfewHours, '/hdc/curfew/curfewHours/');
    }
};
