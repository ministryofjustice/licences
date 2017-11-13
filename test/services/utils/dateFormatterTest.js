const {formatDates} = require('../../../server/services/utils/dateFormatter');
const {expect} = require('../../testSetup');

describe('dateFormatter', () => {
    it('should format passed in dates', () => {
        const object = {
            a: 'hi',
            b: 'ho',
            c: '1971-05-12'
        };

        const expectedOutput = {
            a: 'hi',
            b: 'ho',
            c: '12/05/1971'
        };

        expect(formatDates(object, ['c'])).to.eql(expectedOutput);
    });

    it('should format passed in dates when more than one', () => {
        const object = {
            a: '1985-12-23',
            b: 'hi',
            c: 'ho',
            d: '1971-05-12'
        };

        const expectedOutput = {
            a: '23/12/1985',
            b: 'hi',
            c: 'ho',
            d: '12/05/1971'
        };

        expect(formatDates(object, ['a', 'd'])).to.eql(expectedOutput);
    });
});
