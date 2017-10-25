exports.seed = knex =>
    knex('LICENCES').delete()
        .then(
            () => knex('LICENCES').insert([
                {
                    NOMIS_ID: "A6627JH",
                    LICENCE: '{' +
                    '"name": "Bryanston, David", ' +
                    '"nomisId": "A6627JH", ' +
                    '"establishment": "HMP Birmingham", ' +
                    '"dischargeDate": "2017-07-10"' +
                    '}',
                    STATUS: 'STARTED'
                }
            ])
        );


