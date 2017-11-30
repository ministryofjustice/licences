exports.seed = knex =>
    knex('CONDITIONS_UI').delete()
        .then(
            () => knex('CONDITIONS_UI').insert([
                {
                    UI_ID: "appointmentName",
                    FIELD_POSITION: '{' +
                    '"appointmentName": "0"' +
                    '}'
                },
                {
                    UI_ID: "mentalHealthName",
                    FIELD_POSITION: '{' +
                    '"mentalHealthName": "0"' +
                    '}'
                },
                {
                    UI_ID: "appointmentDetails",
                    FIELD_POSITION: '{' +
                    '"appointmentDate": "0",' +
                    '"appointmentTime": "1",' +
                    '"appointmentAddress": "2"' +
                    '}'
                },
                {
                    UI_ID: "victimDetails",
                    FIELD_POSITION: '{' +
                    '"victimFamilyMembers": "0",' +
                    '"socialServicesDept": "1"' +
                    '}'
                },
                {
                    UI_ID: "noUnsupervisedContact",
                    FIELD_POSITION: '{' +
                    '"unsupervisedContactGender": "0",' +
                    '"unsupervisedContactAge": "1",' +
                    '"unsupervisedContactSocial": "2"' +
                    '}'
                },
                {
                    UI_ID: "noContactOffenders",
                    FIELD_POSITION: '{' +
                    '"noContactOffenders": "0"' +
                    '}'
                },
                {
                    UI_ID: "groupsOrOrganisations",
                    FIELD_POSITION: '{' +
                    '"groupsOrOrganisation": "0"' +
                    '}'
                },
                {
                    UI_ID: "courseOrCentre",
                    FIELD_POSITION: '{' +
                    '"courseOrCentre": "0"' +
                    '}'
                },
                {
                    UI_ID: "noWorkWithAge",
                    FIELD_POSITION: '{' +
                    '"noWorkWithAge": "0"' +
                    '}'
                },
                {
                    UI_ID: "noSpecificItems",
                    FIELD_POSITION: '{' +
                    '"noSpecificItems": "0"' +
                    '}'
                },
                {
                    UI_ID: "noCurrencyQuantity",
                    FIELD_POSITION: '{' +
                    '"cashQuantity": "0"' +
                    '}'
                },
                {
                    UI_ID: "vehicleDetails",
                    FIELD_POSITION: '{' +
                    '"vehicleDetails": "0"' +
                    '}'
                },
                {
                    UI_ID: "intimateGender",
                    FIELD_POSITION: '{' +
                    '"intimateGender": "0"' +
                    '}'
                },
                {
                    UI_ID: "confinedDetails",
                    FIELD_POSITION: '{' +
                    '"confinedTo": "0",' +
                    '"confinedFrom": "1",' +
                    '"confinedReviewFrequency": "2"' +
                    '}'
                },
                {
                    UI_ID: "curfewDetails",
                    FIELD_POSITION: '{' +
                    '"curfewAddress": "0",' +
                    '"curfewFrom": "1",' +
                    '"curfewTo": "2",' +
                    '"curfewTagRequired": "3"' +
                    '}'
                },
                {
                    UI_ID: "exclusionArea",
                    FIELD_POSITION: '{' +
                    '"exclusionArea": "0"' +
                    '}'
                },
                {
                    UI_ID: "noEnterPlace",
                    FIELD_POSITION: '{' +
                    '"noEnterPlace": "0"' +
                    '}'
                },
                {
                    UI_ID: "notInSightOf",
                    FIELD_POSITION: '{' +
                    '"notInSightOf": "0"' +
                    '}'
                },
                {
                    UI_ID: "reportingDetails",
                    FIELD_POSITION: '{' +
                    '"reportingAddress": "0",' +
                    '"reportingTime": "1",' +
                    '"reportingDaily": "2",' +
                    '"reportingFrequency": "3"' +
                    '}'
                },
                {
                    UI_ID: "alcoholLimit",
                    FIELD_POSITION: '{' +
                    '"alcoholLimit": "0"' +
                    '}'
                },
                {
                    UI_ID: "notToReside",
                    FIELD_POSITION: '{' +
                    '"notResideWithGender": "0",' +
                    '"notResideWithAge": "1"' +
                    '}'
                }

            ])
        );
