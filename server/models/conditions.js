module.exports = {
    conditionsOrder: [
        'NOCONTACTPRISONER',
        'NOCONTACTASSOCIATE',
        'NOCONTACTSEXOFFENDER',
        'INTIMATERELATIONSHIP',
        'NOCONTACTNAMED',
        'NORESIDE',
        'NOUNSUPERVISEDCONTACT',
        'NOCHILDRENSAREA',
        'NOWORKWITHAGE',
        'NOTIFYRELATIONSHIP',
        'NOCOMMUNICATEVICTIM',
        'COMPLYREQUIREMENTS',
        'ATTEND',
        'ATTENDALL',
        'HOMEVISITS',
        'REMAINADDRESS',
        'CONFINEADDRESS',
        'REPORTTO',
        'RETURNTOUK',
        'NOTIFYPASSPORT',
        'SURRENDERPASSPORT',
        'VEHICLEDETAILS',
        'EXCLUSIONADDRESS',
        'EXCLUSIONAREA',
        'ONEPHONE',
        'NOINTERNET',
        'USAGEHISTORY',
        'NOCAMERA',
        'CAMERAAPPROVAL',
        'NOCAMERAPHONE',
        'ATTENDSAMPLE',
        'ATTENDDEPENDENCY'
    ],

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
