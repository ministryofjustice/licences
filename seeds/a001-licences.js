exports.seed = knex =>
    knex('LICENCES').delete()
        .then(
            () => knex('LICENCES').insert([
                {
                    licence: '{' +
                    '"name": "Andrews, Mark", ' +
                    '"nomsId": "A1235HG", ' +
                    '"establishment": "HMP Manchester", ' +
                    '"dischargeDate": "2017-11-01", ' +
                    '"inProgress": false' +
                    '}'
                },
                {
                    licence: '{' +
                    '"name": "Bryanston, David", ' +
                    '"nomsId": "A6627JH", ' +
                    '"establishment": "HMP Birmingham", ' +
                    '"dischargeDate": "2017-07-10", ' +
                    '"inProgress": true' +
                    '}'
                }
            ])
        );


