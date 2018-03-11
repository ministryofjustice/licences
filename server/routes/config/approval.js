module.exports = {
    release: {
        licenceSection: 'release',
        fields: [
            {decision: {}},
            {reason: {dependentOn: 'decision', predicate: 'No'}}
        ],
        nextPath: {
            path: '/hdc/send/'
        }
    }
};
