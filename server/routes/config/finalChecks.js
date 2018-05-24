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
        pageDataMap: ['licence', 'finalChecks', 'refusal'],
        saveSection: ['finalChecks', 'refusal'],
        fields: [
            {decision: {}},
            {reason: {}},
            {outOfTimeReasons: {}}
        ],
        nextPath: {
            decisions: {
                discriminator: 'decision',
                Yes: '/hdc/finalChecks/refusal/'
            },
            path: '/hdc/taskList/'
        }
    },
    refusal: {
        pageDataMap: ['licence', 'finalChecks', 'refusal'],
        saveSection: ['finalChecks', 'refusal'],
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
