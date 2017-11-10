exports.seed = knex =>
    knex('CONDITIONS_GROUPS').delete()
        .then(
            () => knex('CONDITIONS_GROUPS').insert([
                {
                    ID: 1,
                    NAME: 'People, contact and relationships',
                    TYPE: 'MAIN'
                },
                {
                    ID: 2,
                    NAME: 'Drugs, health and behaviour',
                    TYPE: 'MAIN'
                },
                {
                    ID: 3,
                    NAME: 'Curfew and reporting',
                    TYPE: 'MAIN'
                },
                {
                    ID: 4,
                    NAME: 'Travel',
                    TYPE: 'MAIN'
                },
                {
                    ID: 5,
                    NAME: 'Exclusion',
                    TYPE: 'MAIN'
                },
                {
                    ID: 6,
                    NAME: 'Technology',
                    TYPE: 'MAIN'
                },
                {
                    ID: 7,
                    NAME: 'Person or group',
                    TYPE: 'SUB'
                },
                {
                    ID: 8,
                    NAME: 'Children',
                    TYPE: 'SUB'
                },
                {
                    ID: 9,
                    NAME: 'Victims',
                    TYPE: 'SUB'
                },
                {
                    ID: 10,
                    NAME: 'Passports',
                    TYPE: 'SUB'
                },
                {
                    ID: 11,
                    NAME: 'Vehicles',
                    TYPE: 'SUB'
                },
                {
                    ID: 12,
                    NAME: 'Mobile phones',
                    TYPE: 'SUB'
                },
                {
                    ID: 13,
                    NAME: 'Computers and internet',
                    TYPE: 'SUB'
                },
                {
                    ID: 14,
                    NAME: 'Cameras and photos',
                    TYPE: 'SUB'
                }

            ])
        );
