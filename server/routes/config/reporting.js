module.exports = {
    reportingInstructions: {
        licenceSection: 'reportingInstructions',
        fields: [
            {name: {}},
            {buildingAndStreet1: {}},
            {buildingAndStreet2: {}},
            {townOrCity: {}},
            {postcode: {}},
            {telephone: {}}
        ],
        nextPath: {
            path: '/hdc/taskList/'
        }
    },
    reportingDate: {
        licenceSection: 'reportingDate',
        fields: [
            {reportingDate: {}},
            {reportingTime: {}}
        ],
        validateInPlace: true,
        noModify: true,
        nextPath: {
            path: '/hdc/pdf/taskList/'
        }
    }
};
