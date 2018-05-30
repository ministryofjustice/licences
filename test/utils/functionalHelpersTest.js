const {allValuesEmpty, interleave} = require('../../server/utils/functionalHelpers');
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

    describe('interleave', () => {

        const examples = [
            [[], [], ''],
            [[], ['a'], ''],
            [['1'], [], '1'],
            [['1'], ['a'], '1a'],
            [['1', '2'], ['a'], '1a2'],
            [['1', '2'], ['a', 'b'], '1a2b'],
            [['1', '2', '3', '4', '5'], ['a', 'b'], '1a2b345'],
            [['1', '2'], ['a', 'b', 'c', 'd', 'e'], '1a2b']
        ];

        examples
            .forEach(([first, second, result]) => {
                it(`should return '${result}' for [${first}] with [${second}]`, () => {
                    expect(interleave(first, second)).to.equal(result);
                });
            });
    });

});
