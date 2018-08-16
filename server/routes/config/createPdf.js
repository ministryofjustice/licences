module.exports = {
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
