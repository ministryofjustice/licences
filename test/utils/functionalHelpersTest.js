const {allValuesEmpty} = require('../../server/utils/functionalHelpers');
const {expect} = require('../testSetup');

describe('functionalHelpers', () => {
    describe('allValuesEmpty', () => {
        it('should return true for object of empty strings', () => {
            const input = {a: '', b: ''};
            const expectedOutput = true;

            expect(allValuesEmpty(input)).to.equal(expectedOutput);
        });

        it('should return true for object of empty items', () => {
            const input = {a: '', b: [], c: {}, d: undefined};
            const expectedOutput = true;

            expect(allValuesEmpty(input)).to.equal(expectedOutput);
        });

        it('should return false for array with a string', () => {
            const input = {a: '', b: 'g'};
            const expectedOutput = false;

            expect(allValuesEmpty(input)).to.equal(expectedOutput);
        });

    });
});
