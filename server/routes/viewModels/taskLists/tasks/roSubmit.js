const {continueBtn} = require('./utils/actions');

module.exports = {
    getLabel: ({allowedTransition}) => allowedTransition === 'roToCa' ? 'Ready to submit' : 'Tasks not yet complete',

    getRoAction: ({decisions}) => {
        const {optedOut} = decisions;
        return optedOut ? continueBtn('/hdc/send/optedOut/') : continueBtn('/hdc/review/licenceDetails/');
    }
};
