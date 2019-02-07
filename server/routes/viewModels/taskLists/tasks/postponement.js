module.exports = {
    getLabel: ({decisions}) => {
        const {postponed, confiscationOrder} = decisions;
        if (postponed) {
            return 'HDC application postponed';
        }
        if (confiscationOrder) {
            return 'Use this to indicate that the process is postponed if a confiscation order is in place';
        }
        return 'Postpone the case if you\'re waiting for information on risk management';
    },

    getAction: ({decisions}) => {
        const {postponed} = decisions;

        return {
            text: postponed ? 'Resume' : 'Postpone',
            href: '/hdc/finalChecks/postpone/',
            type: 'btn'
        };
    }
};