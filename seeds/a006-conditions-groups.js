exports.seed = knex =>
    knex('CONDITIONS_GROUPS').delete()
        .then(
            () => knex('CONDITIONS_GROUPS').insert([
                {
                    ID: 'PEOPLE',
                    NAME: 'People, contact and relationships',
                    TYPE: 'MAIN'
                },
                {
                    ID: 'DRUGS',
                    NAME: 'Drugs, health and behaviour',
                    TYPE: 'MAIN'
                },
                {
                    ID: 'CURFEW',
                    NAME: 'Curfew and reporting',
                    TYPE: 'MAIN'
                },
                {
                    ID: 'TRAVEL',
                    NAME: 'Travel',
                    TYPE: 'MAIN'
                },
                {
                    ID: 'EXCLUSION',
                    NAME: 'Exclusion',
                    TYPE: 'MAIN'
                },
                {
                    ID: 'TECHNOLOGY',
                    NAME: 'Technology',
                    TYPE: 'MAIN'
                },
                {
                    ID: 'PERSONORGROUP',
                    NAME: 'Person or group',
                    TYPE: 'SUB'
                },
                {
                    ID: 'CHILDREN',
                    NAME: 'Children',
                    TYPE: 'SUB'
                },
                {
                    ID: 'VICTIMS',
                    NAME: 'Victims',
                    TYPE: 'SUB'
                },
                {
                    ID: 'PASSPORTS',
                    NAME: 'Passports',
                    TYPE: 'SUB'
                },
                {
                    ID: 'VEHICLES',
                    NAME: 'Vehicles',
                    TYPE: 'SUB'
                },
                {
                    ID: 'PHONES',
                    NAME: 'Mobile phones',
                    TYPE: 'SUB'
                },
                {
                    ID: 'COMPUTERS',
                    NAME: 'Computers and internet',
                    TYPE: 'SUB'
                },
                {
                    ID: 'CAMERAS',
                    NAME: 'Cameras and photos',
                    TYPE: 'SUB'
                }

            ])
        );
