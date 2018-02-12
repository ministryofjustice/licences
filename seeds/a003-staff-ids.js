exports.seed = knex =>
    knex('STAFF_IDS').delete()
        .then(
            () => knex('STAFF_IDS').insert([
                {
                    NOMIS_ID: "RO_USER_TEST",
                    STAFF_ID: "DELIUS_ID_TEST",
                    FIRST_NAME: 'FIRSTA',
                    LAST_NAME: 'LASTA'
                },
                {
                    NOMIS_ID: "RO_USER",
                    STAFF_ID: "DELIUS_ID",
                    FIRST_NAME: 'JESSY',
                    LAST_NAME: 'SMITH'
                },
                {
                    NOMIS_ID: "RO_USER2",
                    STAFF_ID: "DELIUS_USER2",
                    FIRST_NAME: 'SHEILA',
                    LAST_NAME: 'HANCOCK'
                },
                {
                    NOMIS_ID: "RO_USER3",
                    STAFF_ID: "DELIUS_USER3",
                    FIRST_NAME: 'TREVOR',
                    LAST_NAME: 'SMITH'
                },
                {
                    NOMIS_ID: "RO_USER4",
                    STAFF_ID: "DELIUS_USER4",
                    FIRST_NAME: 'DAVID',
                    LAST_NAME: 'BALL'
                },
                {
                    NOMIS_ID: "RO_USER5",
                    STAFF_ID: "DELIUS_USER5",
                    FIRST_NAME: 'JULIE',
                    LAST_NAME: 'WOOD'
                },
                {
                    NOMIS_ID: "RO_USER6",
                    STAFF_ID: "DELIUS_USER6",
                    FIRST_NAME: 'LYDIA',
                    LAST_NAME: 'HUME'
                }
            ])
        );


