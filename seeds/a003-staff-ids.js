exports.seed = knex =>
    knex('STAFF_IDS').delete()
        .then(
            () => knex('STAFF_IDS').insert([
                {
                    NOMIS_ID: "RO_USER_TEST",
                    STAFF_ID: "DELIUS_ID",
                    FIRST_NAME: 'FIRSTA',
                    LAST_NAME: 'LASTA'
                },
                {
                    NOMIS_ID: "RO_USER",
                    STAFF_ID: "DELIUS_ID",
                    FIRST_NAME: 'FIRSTA',
                    LAST_NAME: 'LASTA'
                }
            ])
        );


