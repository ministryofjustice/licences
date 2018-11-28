const recordList = require('../../../server/services/utils/recordList');

describe('recordList', () => {

    context('Do not allow empty', () => {
        it('should error when no elements at path', () => {
            const licence = {a: {b: {c: [0, 1, 2]}}};
            expect(() => recordList({licence, path: ['a', 'b', 'c', 'd']})).to.throw(Error);
        });

        it('should error when not a list at path', () => {
            const licence = {a: {b: {c: {not: 'list'}}}};
            expect(() => recordList({licence, path: ['a', 'b', 'c']})).to.throw(Error);
        });

        it('should remove item at index', () => {
            const licence = {a: {b: {c: [0, 1, 2]}}};
            const testList = recordList({licence, path: ['a', 'b', 'c']});

            expect(testList.remove({index: 1})).to.eql({a: {b: {c: [0, 2]}}});
        });

        it('should add item at end', () => {
            const licence = {a: {b: {c: [0, 1, 2]}}};
            const testList = recordList({licence, path: ['a', 'b', 'c']});

            expect(testList.add({record: {added: 3}})).to.eql({a: {b: {c: [0, 1, 2, {added: 3}]}}});
        });

        it('should edit item at index', () => {
            const licence = {a: {b: {c: [0, 1, 2]}}};
            const testList = recordList({licence, path: ['a', 'b', 'c']});

            expect(testList.edit({index: 1, record: {edited: '1a'}})).to.eql({a: {b: {c: [0, {edited: '1a'}, 2]}}});
        });

        it('should error on edit when no item at index', () => {
            const licence = {a: {b: {c: [0, 1, 2]}}};
            const testList = recordList({licence, path: ['a', 'b', 'c']});

            expect(() => testList.edit({index: 3, record: {edited: '1a'}})).to.throw(Error);
        });

        it('should error on edit when empty', () => {
            const licence = {a: {b: {c: []}}};
            const testList = recordList({licence, path: ['a', 'b', 'c']});

            expect(() => testList.edit({index: 0, record: {edited: '1a'}})).to.throw(Error);
        });

        it('should edit last item when no index specified', () => {
            const licence = {a: {b: {c: [0, 1, 2]}}};
            const testList = recordList({licence, path: ['a', 'b', 'c']});

            expect(testList.edit({record: {edited: '2a'}})).to.eql({a: {b: {c: [0, 1, {edited: '2a'}]}}});
        });

        it('should edit item 0 when index 0 specified', () => {
            const licence = {a: {b: {c: [0, 1, 2]}}};
            const testList = recordList({licence, path: ['a', 'b', 'c']});

            expect(testList.edit({record: {edited: '0a'}, index: 0})).to.eql({a: {b: {c: [{edited: '0a'}, 1, 2]}}});
        });

        it('should error on edit when no items and no index specified', () => {
            const licence = {a: {b: {c: []}}};
            const testList = recordList({licence, path: ['a', 'b', 'c']});

            expect(() => testList.edit({record: {edited: '1a'}})).to.throw(Error);
        });
    });

    context('Allow empty', () => {
        it('should not error when no elements at path', () => {
            const licence = {a: {b: {c: {}}}};
            const testList = recordList({licence, path: ['a', 'b', 'c', 'd'], allowEmpty: true});
            expect(testList.add({record: {added: 3}})).to.eql({a: {b: {c: {d: [{added: 3}]}}}});
        });

        it('should error when not a list at path even when allow empty', () => {
            const licence = {a: {b: {c: {not: 'list'}}}};
            expect(() => recordList({licence, path: ['a', 'b', 'c'], allowEmpty: true})).to.throw(Error);
        });


    });
});
