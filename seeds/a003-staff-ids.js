exports.seed = knex =>
    knex('STAFF_IDS').delete()
        .then(
            () => knex('STAFF_IDS').insert([
                {
                    NOMIS_ID: "1",
                    STAFF_ID: "1",
                    STAFF_NAME: 'LASTA,FIRSTA'
                },
                {
                    NOMIS_ID: "15689",
                    STAFF_ID: "1",
                    STAFF_NAME: 'LASTA,FIRSTA'
                }
            ])
        );


