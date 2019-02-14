const {standardAction} = require('./utils/actions');

module.exports = {
    getLabel: ({decisions, tasks}) => {
        const {bassAreaSpecified, bassAreaSuitable} = decisions;
        const {bassAreaCheck} = tasks;

        if (bassAreaCheck === 'DONE') {
            if (bassAreaSpecified) {
                return bassAreaSuitable ? 'BASS area suitable' : 'BASS area is not suitable';
            }
            return 'No specific BASS area requested';
        }
        return 'Not completed';
    },

    getRoAction: ({tasks}) => {
        const {bassAreaCheck} = tasks;
        return standardAction(bassAreaCheck, '/hdc/bassReferral/bassAreaCheck/');
    }
};
