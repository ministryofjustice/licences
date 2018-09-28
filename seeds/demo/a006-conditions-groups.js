exports.seed = knex =>
    knex('conditions_groups').delete()
        .then(
            () => knex('conditions_groups').insert([
                {
                    id: 'PEOPLE',
                    name: 'People, contact and relationships',
                    type: 'MAIN'
                },
                {
                    id: 'DRUGS',
                    name: 'Drugs, health and behaviour',
                    type: 'MAIN'
                },
                {
                    id: 'CURFEW',
                    name: 'Curfew and reporting',
                    type: 'MAIN'
                },
                {
                    id: 'TRAVEL',
                    name: 'Travel',
                    type: 'MAIN'
                },
                {
                    id: 'EXCLUSION',
                    name: 'Exclusion',
                    type: 'MAIN'
                },
                {
                    id: 'TECHNOLOGY',
                    name: 'Technology',
                    type: 'MAIN'
                },
                {
                    id: 'PSS',
                    name: 'Post-sentence supervision only',
                    type: 'MAIN'
                },
                {
                    id: 'PERSONORGROUP',
                    name: 'Person or group',
                    type: 'SUB'
                },
                {
                    id: 'CHILDREN',
                    name: 'Children',
                    type: 'SUB'
                },
                {
                    id: 'VICTIMS',
                    name: 'Victims',
                    type: 'SUB'
                },
                {
                    id: 'PASSPORTS',
                    name: 'Passports',
                    type: 'SUB'
                },
                {
                    id: 'VEHICLES',
                    name: 'Vehicles',
                    type: 'SUB'
                },
                {
                    id: 'PHONES',
                    name: 'Mobile phones',
                    type: 'SUB'
                },
                {
                    id: 'COMPUTERS',
                    name: 'Computers and internet',
                    type: 'SUB'
                },
                {
                    id: 'CAMERAS',
                    name: 'Cameras and photos',
                    type: 'SUB'
                }

            ])
        );
