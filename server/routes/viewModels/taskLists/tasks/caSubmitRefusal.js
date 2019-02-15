const {continueBtn} = require('./utils/actions');

module.exports = {
    getLabel: ({decisions}) => {
        const {optedOut} = decisions;
        return optedOut ? 'Submission unavailable - Offender has opted out of HDC' : 'Ready to submit for refusal';
    },

    getCaAction: ({decisions}) => {
        const {optedOut} = decisions;
        if (!optedOut) {
            return continueBtn('/hdc/send/refusal/');
        }
        return null;
    }
};
