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
                {
                    STAFF_ID: "1",
                    STAFF_NAME: 'LASTA,FIRSTA',
                    TEAM: 'TEAMA',
                    PROVIDER: 'PROVIDERA',
                    SURNAME: 'a',
                    FIRST_NAME: 'a',
                    NOMS_NO: "A1403AE",
                    CRN: 'a'
                },
                {
                    STAFF_ID: "1",
                    STAFF_NAME: 'LASTA,FIRSTA',
                    TEAM: 'TEAMA',
                    PROVIDER: 'PROVIDERA',
                    SURNAME: 'b',
                    FIRST_NAME: 'b',
                    NOMS_NO: "A1408AE",
                    CRN: 'b'
                },
                {
                    STAFF_ID: "1",
                    STAFF_NAME: 'LASTA,FIRSTA',
                    TEAM: 'TEAMA',
                    PROVIDER: 'PROVIDERA',
                    SURNAME: 'c',
                    FIRST_NAME: 'c',
                    NOMS_NO: "A1409AE",
                    CRN: 'c'
                },
                {
                    STAFF_ID: "1",
                    STAFF_NAME: 'LASTA,FIRSTA',
                    TEAM: 'TEAMA',
                    PROVIDER: 'PROVIDERA',
                    SURNAME: 'd',
                    FIRST_NAME: 'd',
                    NOMS_NO: "A1410AE",
                    CRN: 'd'
                },
                {
                    STAFF_ID: "1",
                    STAFF_NAME: 'LASTA,FIRSTA',
                    TEAM: 'TEAMA',
                    PROVIDER: 'PROVIDERA',
                    SURNAME: 'e',
                    FIRST_NAME: 'e',
                    NOMS_NO: "A1415AE",
                    CRN: 'e'
                },
                {
                    STAFF_ID: "1",
                    STAFF_NAME: 'LASTA,FIRSTA',
                    TEAM: 'TEAMA',
                    PROVIDER: 'PROVIDERA',
                    SURNAME: 'f',
                    FIRST_NAME: 'f',
                    NOMS_NO: "A1416AE",
                    CRN: 'f'
                },
                {
                    STAFF_ID: "1",
                    STAFF_NAME: 'LASTA,FIRSTA',
                    TEAM: 'TEAMA',
                    PROVIDER: 'PROVIDERA',
                    SURNAME: 'g',
                    FIRST_NAME: 'g',
                    NOMS_NO: "A1422AE",
                    CRN: 'g'
                },
                {
                    STAFF_ID: "1",
                    STAFF_NAME: 'LASTA,FIRSTA',
                    TEAM: 'TEAMA',
                    PROVIDER: 'PROVIDERA',
                    SURNAME: 'h',
                    FIRST_NAME: 'h',
                    NOMS_NO: "A1429AE",
                    CRN: 'h'
                },
                {
                    STAFF_ID: "1",
                    STAFF_NAME: 'LASTA,FIRSTA',
                    TEAM: 'TEAMA',
                    PROVIDER: 'PROVIDERA',
                    SURNAME: 'i',
                    FIRST_NAME: 'i',
                    NOMS_NO: "A1431AE",
                    CRN: 'i'
                },
                {
                    STAFF_ID: "1",
                    STAFF_NAME: 'LASTA,FIRSTA',
                    TEAM: 'TEAMA',
                    PROVIDER: 'PROVIDERA',
                    SURNAME: 'j',
                    FIRST_NAME: 'j',
                    NOMS_NO: "A1435AE",
                    CRN: 'j'
                }
            ])
        );


