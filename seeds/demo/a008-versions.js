exports.seed = function(knex, Promise) {
    // Deletes ALL existing entries
    return knex('licence_versions')
        .del()
        .then(function() {
            // Inserts seed entries
            return knex('licence_versions').insert([
                {
                    licence: {
                        risk: {
                            riskManagement: {
                                planningActions: 'No',
                                awaitingInformation: 'No',
                                proposedAddressSuitable: 'Yes',
                            },
                        },
                        victim: {
                            victimLiaison: {
                                decision: 'No',
                            },
                        },
                        curfew: {
                            curfewHours: {
                                daySpecificInputs: 'No',
                                allFrom: '19:00',
                                allUntil: '07:00',
                                fridayFrom: '19:00',
                                mondayFrom: '19:00',
                                sundayFrom: '19:00',
                                fridayUntil: '07:00',
                                mondayUntil: '07:00',
                                sundayUntil: '07:00',
                                tuesdayFrom: '19:00',
                                saturdayFrom: '19:00',
                                thursdayFrom: '19:00',
                                tuesdayUntil: '07:00',
                                saturdayUntil: '07:00',
                                thursdayUntil: '07:00',
                                wednesdayFrom: '19:00',
                                wednesdayUntil: '07:00',
                            },
                            curfewAddressReview: {
                                consent: 'Yes',
                                electricity: 'Yes',
                                homeVisitConducted: 'Yes',
                            },
                        },
                        approval: { release: { decision: 'Yes', decisionMaker: 'Dianne Matthews' } },
                        reporting: {
                            reportingInstructions: {
                                name: 'J Smith',
                                postcode: 'LE14 5PO',
                                telephone: '07869 7286413',
                                townOrCity: 'Leicester',
                                buildingAndStreet1: '19 High Street',
                                buildingAndStreet2: '',
                            },
                        },
                        eligibility: {
                            crdTime: { decision: 'No' },
                            excluded: { decision: 'No' },
                            suitability: { decision: 'No' },
                        },
                        finalChecks: {
                            onRemand: { decision: 'No' },
                            seriousOffence: { decision: 'No' },
                            confiscationOrder: { decision: 'No' },
                        },
                        proposedAddress: {
                            optOut: { decision: 'No' },
                            curfewAddress: {
                                occupier: { name: '', relationship: '' },
                                postCode: 'LE16 9UH',
                                residents: [],
                                telephone: '07968 7865426',
                                addressTown: 'Leicester',
                                addressLine1: '18 Queen Square',
                                addressLine2: '',
                                cautionedAgainstResident: 'No',
                            },
                            addressProposed: { decision: 'Yes' },
                        },
                        licenceConditions: { standard: { additionalConditionsRequired: 'No' } },
                    },
                    booking_id: 2,
                    version: 1,
                    template: 'hdc_ap_pss',
                },
            ])
        })
}
