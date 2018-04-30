exports.seed = knex =>
    knex('conditions_ui').delete()
        .then(
            () => knex('conditions_ui').insert([
                {
                    ui_id: "appointmentName",
                    field_position: '{' +
                    '"appointmentName": "0"' +
                    '}'
                },
                {
                    ui_id: "mentalHealthName",
                    field_position: '{' +
                    '"mentalHealthName": "0"' +
                    '}'
                },
                {
                    ui_id: "appointmentDetails",
                    field_position: '{' +
                    '"appointmentDate": "0",' +
                    '"appointmentTime": "1",' +
                    '"appointmentAddress": "2"' +
                    '}'
                },
                {
                    ui_id: "victimDetails",
                    field_position: '{' +
                    '"victimFamilyMembers": "0",' +
                    '"socialServicesDept": "1"' +
                    '}'
                },
                {
                    ui_id: "noUnsupervisedContact",
                    field_position: '{' +
                    '"unsupervisedContactGender": "0",' +
                    '"unsupervisedContactAge": "1",' +
                    '"unsupervisedContactSocial": "2"' +
                    '}'
                },
                {
                    ui_id: "noContactOffenders",
                    field_position: '{' +
                    '"noContactOffenders": "0"' +
                    '}'
                },
                {
                    ui_id: "groupsOrOrganisations",
                    field_position: '{' +
                    '"groupsOrOrganisation": "0"' +
                    '}'
                },
                {
                    ui_id: "courseOrCentre",
                    field_position: '{' +
                    '"courseOrCentre": "0"' +
                    '}'
                },
                {
                    ui_id: "noWorkWithAge",
                    field_position: '{' +
                    '"noWorkWithAge": "0"' +
                    '}'
                },
                {
                    ui_id: "noSpecificItems",
                    field_position: '{' +
                    '"noSpecificItems": "0"' +
                    '}'
                },
                {
                    ui_id: "noCurrencyQuantity",
                    field_position: '{' +
                    '"cashQuantity": "0"' +
                    '}'
                },
                {
                    ui_id: "vehicleDetails",
                    field_position: '{' +
                    '"vehicleDetails": "0"' +
                    '}'
                },
                {
                    ui_id: "intimateGender",
                    field_position: '{' +
                    '"intimateGender": "0"' +
                    '}'
                },
                {
                    ui_id: "confinedDetails",
                    field_position: '{' +
                    '"confinedTo": "0",' +
                    '"confinedFrom": "1",' +
                    '"confinedReviewFrequency": "2"' +
                    '}'
                },
                {
                    ui_id: "curfewDetails",
                    field_position: '{' +
                    '"curfewAddress": "0",' +
                    '"curfewFrom": "1",' +
                    '"curfewTo": "2",' +
                    '"curfewTagRequired": "3"' +
                    '}'
                },
                {
                    ui_id: "exclusionArea",
                    field_position: '{' +
                    '"exclusionArea": "0"' +
                    '}'
                },
                {
                    ui_id: "noEnterPlace",
                    field_position: '{' +
                    '"noEnterPlace": "0"' +
                    '}'
                },
                {
                    ui_id: "notInSightOf",
                    field_position: '{' +
                    '"notInSightOf": "0"' +
                    '}'
                },
                {
                    ui_id: "reportingDetails",
                    field_position: '{' +
                    '"reportingAddress": "0",' +
                    '"reportingTime": "1",' +
                    '"reportingDaily": "2",' +
                    '"reportingFrequency": "3"' +
                    '}'
                },
                {
                    ui_id: "alcoholLimit",
                    field_position: '{' +
                    '"alcoholLimit": "0"' +
                    '}'
                },
                {
                    ui_id: "notToReside",
                    field_position: '{' +
                    '"notResideWithGender": "0",' +
                    '"notResideWithAge": "1"' +
                    '}'
                }

            ])
        );
