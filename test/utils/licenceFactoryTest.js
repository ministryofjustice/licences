const {expect} = require('../testSetup');
const {
    createLicenceObject,
    createAddressObject,
    createConditionsObject
} = require('../../server/utils/licenceFactory');

describe('licenceFactory', () => {

    describe('createLicenceObject', () => {

        it('should filter out any unacceptable data', () => {
           const input = {firstName: 'Matt', bad: 'yes'};

           expect(createLicenceObject(input)).to.eql({firstName: 'Matt'});
        });
    });

    describe('createAddressObject', () => {

        it('should filter out any unacceptable data', () => {
            const input = {firstName: 'Matt', address1: 'yes'};

            expect(createAddressObject(input)).to.eql({address1: 'yes'});
        });
    });


    describe('createConditionsObject', () => {
        it('should return an object for each selected item', () => {

            const selectedConditions = [
                {ID: {value: 1}, USER_INPUT: {value: 'appointmentName'}},
                {ID: {value: 2}, USER_INPUT: {value: 'confinedDetails'}}
            ];

            const formInputs = {additionalConditions: ['appointmentName', 'confinedDetails']};

            const expectedOutput = {
                1: {appointmentName: undefined},
                2: {
                    confinedFrom: undefined,
                    confinedReviewFrequency: undefined,
                    confinedTo: undefined
                }
            };

            const output = createConditionsObject(selectedConditions, formInputs);

            expect(output).to.eql(expectedOutput);
        });

        it('should add form data to the objects', () => {

            const selectedConditions = [
                {ID: {value: 1}, USER_INPUT: {value: 'notInSightOf'}},
                {ID: {value: 2}, USER_INPUT: {value: 'curfewDetails'}}
            ];

            const formInputs = {
                additionalConditions: ['notInSightOf', 'curfewDetails'],
                notInSightOf: 'abc',
                curfewFrom: '01/02/2024',
                curfewTo: '01/02/2016',
                curfewTagRequired: 'yes',
                curfewAddress: 'here',
                curfewAddressWrong: 'there'
            };

            const expectedOutput = {
                1: {notInSightOf: 'abc'},
                2: {
                    curfewFrom: '01/02/2024',
                    curfewTo: '01/02/2016',
                    curfewTagRequired: 'yes',
                    curfewAddress: 'here'
                }
            };

            const output = createConditionsObject(selectedConditions, formInputs);

            expect(output).to.eql(expectedOutput);
        });

        it('should return empty object for conditions with no input', () => {

            const selectedConditions = [
                {ID: {value: 1}, USER_INPUT: {value: 'notInSightOf'}},
                {ID: {value: 2}, USER_INPUT: {value: 'null'}}
            ];

            const formInputs = {
                additionalConditions: ['1', '2'],
                notInSightOf: 'abc'
            };

            const expectedOutput = {
                1: {notInSightOf: 'abc'},
                2: {}
            };

            const output = createConditionsObject(selectedConditions, formInputs);

            expect(output).to.eql(expectedOutput);
        });
    });
});
