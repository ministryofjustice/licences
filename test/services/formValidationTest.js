const createLicenceService = require('../../server/services/licenceService');

describe('validation', () => {

    let service = createLicenceService({}, {});

    describe('eligibility', () => {

        const {excluded, suitability, exceptionalCircumstances, crdTime} = require('../../server/routes/config/eligibility');
        describe('excluded', () => {

            const options = [
                {response: {decision: 'Yes', reason: ['a', 'b']}, outcome: {}},
                {response: {decision: '', reason: ['a', 'b']}, outcome: {decision: 'Select yes or no'}},
                {response: {decision: 'Yes', reason: []}, outcome: {reason: 'Select one or more reasons'}},
                {response: {decision: 'No', reason: []}, outcome: {}}
            ];

            options.forEach(option => {
                it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.response)}`, () => {
                    const {outcome, response} = option;
                    expect(service.validateForm(response, excluded)).to.eql(outcome);
                });
            });
        });

        describe('suitability', () => {

            const options = [
                {response: {decision: 'Yes', reason: ['a', 'b']}, outcome: {}},
                {response: {decision: '', reason: ['a', 'b']}, outcome: {decision: 'Select yes or no'}},
                {response: {decision: 'Yes', reason: []}, outcome: {reason: 'Select one or more reasons'}},
                {response: {decision: 'No', reason: []}, outcome: {}}
            ];

            options.forEach(option => {
                it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.response)}`, () => {
                    const {outcome, response} = option;
                    expect(service.validateForm(response, suitability)).to.eql(outcome);
                });
            });
        });

        describe('exceptionalCircumstances', () => {

            const options = [
                {response: {decision: 'Yes'}, outcome: {}},
                {response: {decision: ''}, outcome: {decision: 'Select yes or no'}}
            ];

            options.forEach(option => {
                it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.response)}`, () => {
                    const {outcome, response} = option;
                    expect(service.validateForm(response, exceptionalCircumstances)).to.eql(outcome);
                });
            });
        });

        describe('crdTime', () => {

            const options = [
                {response: {decision: 'Yes', dmApproval: 'Yes'}, outcome: {}},
                {response: {decision: ''}, outcome: {decision: 'Select yes or no'}},
                {response: {decision: 'Yes', reason: ''}, outcome: {dmApproval: 'Select yes or no'}},
                {response: {decision: 'No', reason: []}, outcome: {}}
            ];

            options.forEach(option => {
                it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.response)}`, () => {
                    const {outcome, response} = option;
                    expect(service.validateForm(response, crdTime)).to.eql(outcome);
                });
            });
        });
    });

    describe('finalChecks', () => {
        const {seriousOffence, onRemand, confiscationOrder} = require('../../server/routes/config/finalChecks');
        describe('excluded', () => {

            const options = [
                {response: {decision: 'Yes'}, outcome: {}},
                {response: {decision: ''}, outcome: {decision: 'Select yes or no'}}
            ];

            options.forEach(option => {
                it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.response)}`, () => {
                    const {outcome, response} = option;
                    expect(service.validateForm(response, seriousOffence)).to.eql(outcome);
                });
            });
        });

        describe('onRemand', () => {

            const options = [
                {response: {decision: 'Yes'}, outcome: {}},
                {response: {decision: ''}, outcome: {decision: 'Select yes or no'}}
            ];

            options.forEach(option => {
                it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.response)}`, () => {
                    const {outcome, response} = option;
                    expect(service.validateForm(response, onRemand)).to.eql(outcome);
                });
            });
        });

        describe('confiscationOrder', () => {

            const options = [
                {response: {decision: 'No'}, outcome: {}},
                {response: {decision: 'Yes', confiscationUnitConsulted: ''}, outcome: {confiscationUnitConsulted: 'Select yes or no'}},
                {response: {decision: 'Yes', confiscationUnitConsulted: 'No'}, outcome: {}},
                {response: {decision: 'Yes', confiscationUnitConsulted: 'Yes', comments: ''}, outcome: {comments: 'Provide details'}},
                {response: {decision: 'Yes', confiscationUnitConsulted: 'Yes', comments: 'wgew'}, outcome: {}}
            ];

            options.forEach(option => {
                it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.response)}`, () => {
                    const {outcome, response} = option;
                    expect(service.validateForm(response, confiscationOrder)).to.eql(outcome);
                });
            });
        });
    });

    describe('curfew', () => {
        const {firstNight} = require('../../server/routes/config/curfew');
        describe('firstNight', () => {

            const options = [
                {response: {firstNightFrom: '13:00', firstNightUntil: '14:00'}, outcome: {}},
                {response: {firstNightFrom: '25:00', firstNightUntil: '14:00'}, outcome: {firstNightFrom: 'Enter a valid from time'}},
                {response: {firstNightFrom: '13:00', firstNightUntil: ''}, outcome: {firstNightUntil: 'Enter a valid until time'}},
                {response: {}, outcome: {firstNightFrom: 'Enter a valid from time', firstNightUntil: 'Enter a valid until time'}}
            ];

            options.forEach(option => {
                it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.response)}`, () => {
                    const {outcome, response} = option;
                    expect(service.validateForm(response, firstNight)).to.eql(outcome);
                });
            });
        });
    });

    describe('bassReferral', () => {
        const {bassOffer} = require('../../server/routes/config/bassReferral');
        describe('bassOffer', () => {

            const options = [
                {response: {bassAccepted: 'No'}, outcome: {}},
                {
                    response: {
                        bassAccepted: 'Yes'
                    },
                    outcome: {
                        addressLine1: 'Enter a building or street',
                        addressTown: 'Enter a town or city',
                        bassArea: 'Enter the provided area',
                        postCode: 'Enter a postcode in the right format'
                    }
                },
                {
                    response: {
                        bassAccepted: 'Yes',
                        addressLine1: 'Road',
                        addressTown: 'Town',
                        bassArea: 'Area',
                        postCode: 'LE17 4XJ'
                    },
                    outcome: {}
                },
                {
                    response: {
                        bassAccepted: 'Yes',
                        addressLine1: 'Road',
                        addressTown: 'Town',
                        bassArea: 'Area',
                        postCode: 'a'
                    },
                    outcome: {postCode: 'Enter a postcode in the right format'}
                }
            ];

            options.forEach(option => {
                it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.response)}`, () => {
                    const {outcome, response} = option;
                    expect(service.validateForm(response, bassOffer)).to.eql(outcome);
                });
            });
        });
    });

    describe('approval', () => {
        const {release} = require('../../server/routes/config/approval');
        describe('release', () => {

            const options = [
                {response: {decision: 'Yes', notedComments: 'comments'}, outcome: {}},
                {response: {decision: 'No', reason: ['reason']}, outcome: {}},
                {response: {decision: 'No', reason: []}, outcome: {reason: 'Select a reason'}}
            ];

            options.forEach(option => {
                it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.response)}`, () => {
                    const {outcome, response} = option;
                    expect(service.validateForm(response, release)).to.eql(outcome);
                });
            });
        });
    });

    describe('reporting', () => {
        const {reportingDate} = require('../../server/routes/config/reporting');
        describe('reportingDate', () => {

            const options = [
                {response: {reportingDate: '12/03/2025', reportingTime: '15:00'}, outcome: {}},
                {
                    response: {reportingDate: '12/03/2016', reportingTime: '15:00'},
                    outcome: {reportingDate: 'Enter a valid date'}
                },
                {
                    response: {reportingDate: '', reportingTime: '15:00'},
                    outcome: {reportingDate: 'Enter a valid date'}
                },
                {
                    response: {reportingDate: '', reportingTime: ''},
                    outcome: {reportingDate: 'Enter a valid date', reportingTime: 'Enter a valid time'}
                },
                {
                    response: {reportingDate: '12/03/2025', reportingTime: '24:40'},
                    outcome: {reportingTime: 'Enter a valid time'}
                }
            ];

            options.forEach(option => {
                it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.response)}`, () => {
                    const {outcome, response} = option;
                    expect(service.validateForm(response, reportingDate)).to.eql(outcome);
                });
            });
        });
    });
});
