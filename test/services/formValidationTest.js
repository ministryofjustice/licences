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
});
