exports.seed = knex =>
    knex('STAFF_IDS').delete()
        .then(
            () => knex('STAFF_IDS').insert([
                {
                    NOMIS_ID: "1",
                    STAFF_ID: "1",
                    FIRST_NAME: 'FIRSTA',
                    LAST_NAME: 'LASTA'
                },
                {
                    NOMIS_ID: "15689",
                    STAFF_ID: "15689",
                    FIRST_NAME: 'FIRSTA',
                    LAST_NAME: 'LASTA'
                }
            ])
        );


