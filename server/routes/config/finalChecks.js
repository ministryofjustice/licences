module.exports = {
    seriousOffence: {
        licenceSection: 'seriousOffence',
        validateInPlace: true,
        fields: [
            {decision: {}}
        ],
        nextPath: {
            path: '/hdc/finalChecks/onRemand/'
        }
    },
    onRemand: {
        licenceSection: 'onRemand',
        validateInPlace: true,
        fields: [
            {decision: {}}
        ],
        nextPath: {
            path: '/hdc/finalChecks/confiscationOrder/'
        }
    },
    confiscationOrder: {
        licenceSection: 'confiscationOrder',
        validateInPlace: true,
        fields: [
            {decision: {}},
            {confiscationUnitConsulted: {dependentOn: 'decision', predicate: 'Yes'}},
            {comments: {dependentOn: 'decision', predicate: 'Yes'}}
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
