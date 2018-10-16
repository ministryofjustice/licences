module.exports = {
    bassRequest: {
        licenceSection: 'bassRequest',
        pageDataMap: ['licence', 'bassReferral'],
        fields: [
            {bassRequested: {}},
            {proposedTown: {dependentOn: 'bassRequested', predicate: 'Yes'}},
            {proposedCounty: {dependentOn: 'bassRequested', predicate: 'Yes'}}
        ],
        nextPath: {
            path: '/hdc/taskList/',
            change: '/hdc/review/bassRequest/'
        }
    },
    bassAreaCheck: {
        licenceSection: 'bassAreaCheck',
        pageDataMap: ['licence', 'bassReferral'],
        fields: [
            {bassAreaSuitable: {}},
            {bassAreaReason: {dependentOn: 'bassAreaSuitable', predicate: 'No'}}
        ],
        nextPath: {
            path: '/hdc/taskList/',
            change: '/hdc/review/licenceDetails/'
        }
    }
};
