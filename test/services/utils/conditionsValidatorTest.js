const {validate} = require('../../../server/services/utils/conditionsValidator');
const {expect} = require('../../testSetup');

describe('conditionsValidator', () => {
    it('should return an error if an item is selected without appropriate input', () => {
        const inputObject = {
            a: 'hi'
        };

        const conditionsSelected = [
            {field_position: {value: {a: 0, b: 1}}}
        ];

        expect(validate(inputObject, conditionsSelected).validates).to.eql(false);
    });

    it('should return a map showing missing inputs', () => {
        const inputObject = {
            b: 'hi'
        };

        const conditionsSelected = [
            {field_position: {a: 0, b: 1, c: 2}}
        ];

        const expectedErrors = {
            a: ['MISSING_INPUT'],
            c: ['MISSING_INPUT']
        };

        expect(validate(inputObject, conditionsSelected).errors).to.eql(expectedErrors);
    });

    it('should return invalid if not a date', () => {
        const inputObject = {
            appointmentDate: 'hi'
        };

        const conditionsSelected = [
            {field_position: {appointmentDate: 0}}
        ];

        expect(validate(inputObject, conditionsSelected).validates).to.eql(false);
    });

    it('should not validate if contains incorrectly formatted date', () => {
        const inputObject = {
            appointmentDate: '12/23/2017'
        };

        const conditionsSelected = [
            {field_position: {appointmentDate: 0}}
        ];

        expect(validate(inputObject, conditionsSelected).validates).to.eql(false);
    });

    it('should validate if date is valid', () => {
        const inputObject = {
            appointmentDate: '23/12/2017'
        };

        const conditionsSelected = [
            {field_position: {appointmentDate: 0}}
        ];

        expect(validate(inputObject, conditionsSelected).validates).to.eql(true);
    });

    it('should display invalid dates', () => {
        const inputObject = {
            appointmentDate: 'hi'
        };

        const conditionsSelected = [
            {field_position: {appointmentDate: 0}}
        ];

        const expectedErrors = {
            appointmentDate: ['INVALID_DATE']
        };

        expect(validate(inputObject, conditionsSelected).errors).to.eql(expectedErrors);
    });

    it('should return an error if an item is selected with empty input', () => {
        const inputObject = {
            a: 'hi',
            b: ''
        };

        const conditionsSelected = [
            {field_position: {a: 0, b: 1}}
        ];

        expect(validate(inputObject, conditionsSelected).validates).to.eql(false);
    });

    it('should return a list of empty inputs', () => {
        const inputObject = {
            a: 'hi',
            b: ''
        };

        const conditionsSelected = [
            {field_position: {a: 0, b: 2}}
        ];

        const expectedErrors = {
            b: ['MISSING_INPUT']
        };

        expect(validate(inputObject, conditionsSelected).errors).to.eql(expectedErrors);
    });

    it('should return true if inputs are present for each selected', () => {
        const inputObject = {
            a: 'hi',
            b: 'hi'
        };

        const conditionsSelected = [
            {field_position: {a: 0, b: 1}}
        ];

        expect(validate(inputObject, conditionsSelected).validates).to.eql(true);
    });

    it('should not break if selection has no inputs', () => {
        const inputObject = {};

        const conditionsSelected = [
            {field_position: null}
        ];

        expect(validate(inputObject, conditionsSelected).validates).to.eql(true);
    });

    it('should reformat date fields to iso date', () => {
        const inputObject = {
            appointmentDate: '23/12/2017'
        };

        const conditionsSelected = [
            {field_position: {appointmentDate: 0}}
        ];

        expect(validate(inputObject, conditionsSelected).appointmentDate).to.eql('2017-12-23');
    });
});
