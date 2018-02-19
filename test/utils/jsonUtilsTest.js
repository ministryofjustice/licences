const {matcher, isPresent, isNotPresent, equalTo} = require('../../server/utils/jsonUtils');
const {expect} = require('../testSetup');

describe('jsonUtils matcher', () => {

    const json = {
        a: 1,
        b: {
            c: 2
        }
    };

    const data = matcher(json);

    it('should return a value at a path', () => {
        expect(data.value('a')).to.eql(1);
        expect(data.value('b.c')).to.eql(2);
    });

    it('should return undefined for missing path', () => {
        expect(data.value('d')).to.eql(undefined);
        expect(data.value('b.c.d')).to.eql(undefined);
    });

    it('should return true for isPresent when exists', () => {
        expect(data.path('a', isPresent)).to.eql(true);
        expect(data.path('b.c', isPresent)).to.eql(true);
    });

    it('should return false for isPresent when not exists', () => {
        expect(data.path('d', isPresent)).to.eql(false);
        expect(data.path('b.c.d', isPresent)).to.eql(false);
    });

    it('should return false for isNotPresent when exists', () => {
        expect(data.path('a', isNotPresent)).to.eql(false);
        expect(data.path('b.c', isNotPresent)).to.eql(false);
    });

    it('should return true for isNotPresent when not exists', () => {
        expect(data.path('d', isNotPresent)).to.eql(true);
        expect(data.path('b.c.d', isNotPresent)).to.eql(true);
    });

    it('should return true for equalTo when exists with same value', () => {
        expect(data.path('a', equalTo(1))).to.eql(true);
        expect(data.path('b.c', equalTo(2))).to.eql(true);
    });

    it('should return false for equalTo when not exists', () => {
        expect(data.path('d', equalTo(1))).to.eql(false);
        expect(data.path('b.c.d', equalTo(2))).to.eql(false);
    });

    it('should return false for equalTo when exists with different value', () => {
        expect(data.path('a', equalTo(9))).to.eql(false);
        expect(data.path('b.c', equalTo(9))).to.eql(false);
    });

    it('should also allow any predicate', () => {
        expect(data.path('a', value => value < 2)).to.eql(true);
        expect(data.path('b.c', value => value < 2)).to.eql(false);
    });
});
