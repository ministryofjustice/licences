module.exports = {
    multiFields: {
        appointmentDetails: {
            fields: [
                'appointmentAddress',
                'appointmentDate',
                'appointmentTime'
            ],
            joining: [
                ' on ',
                ' at '
            ]
        },
        attendSampleDetails: {
            fields: [
                'attendSampleDetailsName',
                'attendSampleDetailsAddress'
            ],
            joining: [
                ', '
            ]
        }
    }
};
