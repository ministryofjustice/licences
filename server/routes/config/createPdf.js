module.exports = {
    reportingDate: {
        licenceSection: 'reportingDate',
        fields: [
            {reportingDate: {}},
            {reportingTime: {}}
        ],
        validateInPlace: true,
        nextPath: {
            path: '/hdc/pdf/taskList/'
        }
    },
    taggingCompany: {
        licenceSection: 'taggingCompany',
        fields: [
            {telephone: {}}
        ],
        validateInPlace: true,
        nextPath: {
            path: '/hdc/pdf/taskList/'
        }
    }
};
