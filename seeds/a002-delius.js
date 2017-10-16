exports.seed = knex =>
    knex('DELIUS').delete()
        .then(
            () => knex('DELIUS').insert([
                {
                    STAFF_ID: "1",
                    STAFF_NAME: 'LASTA,FIRSTA',
                    TEAM: 'TEAMA',
                    PROVIDER: 'PROVIDERA',
                    SURNAME: 'ANDREWS',
                    FIRST_NAME: 'MARK',
                    NOMS_NO: "A1235HG",
                    CRN: 'CRN1'
                },
                {
                    STAFF_ID: "1",
                    STAFF_NAME: 'LASTA,FIRSTA',
                    TEAM: 'TEAMA',
                    PROVIDER: 'PROVIDERA',
                    SURNAME: 'BRYANSTON',
                    FIRST_NAME: 'DAVID',
                    NOMS_NO: "A6627JH",
                    CRN: 'CRN2'
                },
            ])
        );


