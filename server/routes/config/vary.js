module.exports = {
    evidence: {
        licenceSection: 'evidence',
        fields: [
            {evidence: {
                responseType: 'requiredString',
                validationMessage: 'Provide your evidence'
            }}
        ],
        nextPath: {
            path: '/hdc/vary/licenceDetails/'
        }
    }
};
