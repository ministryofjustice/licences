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
        licenceSection: 'postpone',
        fields: [
            {decision: {}}
        ],
        nextPath: {
            path: '/hdc/taskList/'
        }
    },
    refuse: {
        pageDataMap: ['licence', 'approval', 'release'],
        saveSection: ['approval', 'release'],
        fields: [
            {decision: {}},
            {reason: {}},
            {outOfTimeReasons: {}}
        ],
        nextPath: {
            decisions: {
                discriminator: 'decision',
                No: '/hdc/finalChecks/refusal/'
            },
            path: '/hdc/taskList/'
        }
    },
    refusal: {
        pageDataMap: ['licence', 'approval', 'release'],
        saveSection: ['approval', 'release'],
        fields: [
            {decision: {}},
            {reason: {}},
            {outOfTimeReasons: {}}
        ],
        nextPath: {
            path: '/hdc/taskList/'
        }
    }
};
