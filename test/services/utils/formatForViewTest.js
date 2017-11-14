const {formatObjectForView} = require('../../../server/services/utils/formatForView');
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

        expect(formatObjectForView(object, {dates: ['c']})).to.eql(expectedOutput);
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

        expect(formatObjectForView(object, {dates: ['a', 'd']})).to.eql(expectedOutput);
    });

    it('should format names to be capitalised', () => {
        const object = {
            a: '1985-12-23',
            b: 'hi',
            c: 'ho',
            d: '1971-05-12'
        };

        const expectedOutput = {
            a: '23/12/1985',
            b: 'Hi',
            c: 'ho',
            d: '12/05/1971'
        };

        expect(formatObjectForView(object, {dates: ['a', 'd'], capitalise: ['b']})).to.eql(expectedOutput);
    });

    it('should format nested names to be capitalised', () => {
        const object = {
            a: '1985-12-23',
            b: {o: 'hi'},
            c: 'ho',
            d: '1971-05-12'
        };

        const expectedOutput = {
            a: '23/12/1985',
            b: {o: 'Hi'},
            c: 'ho',
            d: '12/05/1971'
        };

        expect(formatObjectForView(object, {dates: ['a', 'd'], capitalise: ['o']})).to.eql(expectedOutput);
    });

    it('should format nested dates', () => {
        const object = {
            a: '1985-12-23',
            b: {o: 'hi'},
            c: 'ho',
            d: {e: {f: '1971-05-12'}}
        };

        const expectedOutput = {
            a: '23/12/1985',
            b: {o: 'Hi'},
            c: 'ho',
            d: {e: {f: '12/05/1971'}}
        };

        expect(formatObjectForView(object, {dates: ['a', 'f'], capitalise: ['o']})).to.eql(expectedOutput);
    });
});
