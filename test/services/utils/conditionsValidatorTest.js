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
            {FIELD_POSITION: {value: {a: 0, b: 1, c: 2}}}
        ];

        const expectedErrors = {
            a: ['missing'],
            c: ['missing']
        };

        expect(validate(inputObject, conditionsSelected).errors).to.eql(expectedErrors);
    });

    it('should return an error if an item is selected with empty input', () => {
        const inputObject = {
            a: 'hi',
            b: ''
        };

        const conditionsSelected = [
            {FIELD_POSITION: {value: {a: 0, b: 1}}}
        ];

        expect(validate(inputObject, conditionsSelected).validates).to.eql(false);
    });

    it('should return a list of empty inputs', () => {
        const inputObject = {
            a: 'hi',
            b: ''
        };

        const conditionsSelected = [
            {FIELD_POSITION: {value: {a: 0, b: 2}}}
        ];

        const expectedErrors = {
            b: ['missing']
        };

        expect(validate(inputObject, conditionsSelected).errors).to.eql(expectedErrors);
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

    it('should not break if selection has no inputs', () => {
        const inputObject = {};

        const conditionsSelected = [
            {FIELD_POSITION: {value: null}}
        ];

        expect(validate(inputObject, conditionsSelected).validates).to.eql(true);
    });
});
