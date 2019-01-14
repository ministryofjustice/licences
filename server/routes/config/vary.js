module.exports = {
    evidence: {
        licenceSection: 'evidence',
        fields: [
            {evidence: {
                responseType: 'requiredString',
                validationMessage: 'Provide your evidence'
            }}
        ],
        validate: true,
        nextPath: {
            path: '/hdc/taskList/'
        }
    }
};
