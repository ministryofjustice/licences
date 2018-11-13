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
    rejected: {
        licenceSection: 'bassRequest',
        pageDataMap: ['licence', 'bassReferral'],
        fields: [
            {enterAlternative: {}}
        ],
        nextPath: {
            decisions: {
                discriminator: 'enterAlternative',
                Yes: '/hdc/bassReferral/bassRequest/rejected/',
                No: '/hdc/taskList/'
            }
        }
    },
    bassAreaCheck: {
        licenceSection: 'bassAreaCheck',
        pageDataMap: ['licence', 'bassReferral'],
        fields: [
            {bassAreaSuitable: {}},
            {bassAreaReason: {}}
        ],
        nextPath: {
            path: '/hdc/taskList/',
            change: '/hdc/review/licenceDetails/'
        }
    },
    bassOffer: {
        licenceSection: 'bassOffer',
        pageDataMap: ['licence', 'bassReferral'],
        validateInPlace: true,
        fields: [
            {bassAccepted: {}},
            {bassArea: {dependentOn: 'bassAccepted', predicate: 'Yes'}},
            {addressLine1: {dependentOn: 'bassAccepted', predicate: 'Yes'}},
            {addressLine2: {dependentOn: 'bassAccepted', predicate: 'Yes'}},
            {addressTown: {dependentOn: 'bassAccepted', predicate: 'Yes'}},
            {postCode: {dependentOn: 'bassAccepted', predicate: 'Yes'}},
            {telephone: {dependentOn: 'bassAccepted', predicate: 'Yes'}}
        ],
        nextPath: {
            path: '/hdc/taskList/'
        }
    }
};
