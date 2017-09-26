exports.seed = knex =>
    knex('DELIUS').delete()
        .then(
            () => knex('DELIUS').insert([
                {
                    OM_ID: "1",
                    OFFENDERS: '["A1235HG", "A6627JH"]'
                }
            ])
        );


