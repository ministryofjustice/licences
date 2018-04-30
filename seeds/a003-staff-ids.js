exports.seed = knex =>
    knex('staff_ids').delete()
        .then(
            () => knex('staff_ids').insert([
                {
                    nomis_id: "RO_USER_TEST",
                    staff_id: "DELIUS_ID_TEST",
                    first_name: 'FIRSTA',
                    last_name: 'LASTA'
                },
                {
                    nomis_id: "RO_USER_MULTI",
                    staff_id: "DELIUS_ID_TEST_MULTI",
                    first_name: 'FIRSTA',
                    last_name: 'LASTA'
                },
                {
                    nomis_id: "RO_USER",
                    staff_id: "DELIUS_ID",
                    first_name: 'JESSY',
                    last_name: 'SMITH'
                },
                {
                    nomis_id: "RO_USER2",
                    staff_id: "DELIUS_USER2",
                    first_name: 'SHEILA',
                    last_name: 'HANCOCK'
                },
                {
                    nomis_id: "RO_USER3",
                    staff_id: "DELIUS_USER3",
                    first_name: 'TREVOR',
                    last_name: 'SMITH'
                },
                {
                    nomis_id: "RO_USER4",
                    staff_id: "DELIUS_USER4",
                    first_name: 'DAVID',
                    last_name: 'BALL'
                },
                {
                    nomis_id: "RO_USER5",
                    staff_id: "DELIUS_USER5",
                    first_name: 'JULIE',
                    last_name: 'WOOD'
                },
                {
                    nomis_id: "RO_USER6",
                    staff_id: "DELIUS_USER6",
                    first_name: 'LYDIA',
                    last_name: 'HUME'
                }
            ])
        );


