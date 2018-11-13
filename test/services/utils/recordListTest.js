const recordList = require('../../../server/services/utils/recordList');

describe('recordList', () => {

    it('should error when no elements at path', () => {
        const licence = {a: {b: {c: [0, 1, 2]}}};
        expect(() => recordList(licence, ['a', 'b', 'c', 'd'])).to.throw(Error);
    });

    it('should error when not a list at path', () => {
        const licence = {a: {b: {c: {not: 'list'}}}};
        expect(() => recordList(licence, ['a', 'b', 'c'])).to.throw(Error);
    });

    it('should remove item at index', () => {
        const licence = {a: {b: {c: [0, 1, 2]}}};
        const testList = recordList(licence, ['a', 'b', 'c']);

        expect(testList.remove({index: 1})).to.eql({a: {b: {c: [0, 2]}}});
    });

    it('should add item at end', () => {
        const licence = {a: {b: {c: [0, 1, 2]}}};
        const testList = recordList(licence, ['a', 'b', 'c']);

        expect(testList.add({record: {added: 3}})).to.eql({a: {b: {c: [0, 1, 2, {added: 3}]}}});
    });

    it('should edit item at index', () => {
        const licence = {a: {b: {c: [0, 1, 2]}}};
        const testList = recordList(licence, ['a', 'b', 'c']);

        expect(testList.edit({index: 1, record: {edited: '1a'}})).to.eql({a: {b: {c: [0, {edited: '1a'}, 2]}}});
    });

    it('should error on edit when no item at index', () => {
        const licence = {a: {b: {c: [0, 1, 2]}}};
        const testList = recordList(licence, ['a', 'b', 'c']);

        expect(() => testList.edit({index: 3, record: {edited: '1a'}})).to.throw(Error);
    });
});
