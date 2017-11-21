const {validate} = require('../../../server/services/utils/conditionsValidator');
const {expect} = require('../../testSetup');

describe('conditionsValidator', () => {
    it('should return an error if an item is selected without appropriate input', () => {
        const inputObject = {
            a: 'hi'
        };

        const conditionsSelected = [
            {FIELD_POSITION: {value: {a: 0, b: 1}}}
        ];

        expect(validate(inputObject, conditionsSelected).validates).to.eql(false);
    });

    it('should return a list of missing inputs', () => {
        const inputObject = {
            b: 'hi'
        };

        const conditionsSelected = [
            {FIELD_POSITION: {value: {a: 0, b: ''}}}
        ];

        expect(validate(inputObject, conditionsSelected).missing).to.eql(['a']);
    });

    it('should return an error if an item is selected with empty input', () => {
        const inputObject = {
            a: 'hi'
        };

        const conditionsSelected = [
            {FIELD_POSITION: {value: {a: 0, b: ''}}}
        ];

        expect(validate(inputObject, conditionsSelected).validates).to.eql(false);
    });

    it('should return a list of empty inputs', () => {
        const inputObject = {
            a: 'hi'
        };

        const conditionsSelected = [
            {FIELD_POSITION: {value: {a: 0, b: ''}}}
        ];

        expect(validate(inputObject, conditionsSelected).missing).to.eql(['b']);
    });

    it('should return true if inputs are present for each selected', () => {
        const inputObject = {
            a: 'hi',
            b: 'hi'
        };

        const conditionsSelected = [
            {FIELD_POSITION: {value: {a: 0, b: 1}}}
        ];

        expect(validate(inputObject, conditionsSelected).validates).to.eql(true);
    });
});
