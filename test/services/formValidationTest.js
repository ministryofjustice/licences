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
});
