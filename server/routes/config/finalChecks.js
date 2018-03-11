module.exports = {
    seriousOffence: {
        licenceSection: 'seriousOffence',
        fields: [
            {decision: {}}
        ],
        nextPath: {
            path: '/hdc/finalChecks/onRemand/'
        }
    },
    onRemand: {
        licenceSection: 'onRemand',
        fields: [
            {decision: {}}
        ],
        nextPath: {
            path: '/hdc/taskList/'
        }
    },
    postpone: {
        licenceSection: 'postponed',
        fields: [
            {decision: {}}
        ],
        nextPath: {
            path: '/hdc/taskList/'
        }
    }
};
