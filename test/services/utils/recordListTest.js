const recordList = require('../../../server/services/utils/recordList')

describe('recordList', () => {
  context('Do not allow empty', () => {
    it('should error when no elements at path', () => {
      const licence = { a: { b: { c: [0, 1, 2] } } }
      expect(() => recordList({ licence, path: ['a', 'b', 'c', 'd'] })).to.throw(Error)
    })

    it('should error when not a list at path', () => {
      const licence = { a: { b: { c: { not: 'list' } } } }
      expect(() => recordList({ licence, path: ['a', 'b', 'c'] })).to.throw(Error)
    })

    it('should remove item at index', () => {
      const licence = { a: { b: { c: [0, 1, 2] } } }
      const testList = recordList({ licence, path: ['a', 'b', 'c'] })

      expect(testList.remove({ index: 1 })).to.eql({ a: { b: { c: [0, 2] } } })
    })

    it('should add item at end', () => {
      const licence = { a: { b: { c: [0, 1, 2] } } }
      const testList = recordList({ licence, path: ['a', 'b', 'c'] })

      expect(testList.add({ record: { added: 3 } })).to.eql({ a: { b: { c: [0, 1, 2, { added: 3 }] } } })
    })

    it('should return the last item', () => {
      const licence = { a: [1, 2, 3] }
      const testList = recordList({ licence, path: ['a'] })

      expect(testList.last()).to.eql(3)
    })
  })

  context('Allow empty', () => {
    it('should not error when no elements at path', () => {
      const licence = { a: { b: { c: {} } } }
      const testList = recordList({ licence, path: ['a', 'b', 'c', 'd'], allowEmpty: true })
      expect(testList.add({ record: { added: 3 } })).to.eql({ a: { b: { c: { d: [{ added: 3 }] } } } })
    })

    it('should error when not a list at path even when allow empty', () => {
      const licence = { a: { b: { c: { not: 'list' } } } }
      expect(() => recordList({ licence, path: ['a', 'b', 'c'], allowEmpty: true })).to.throw(Error)
    })

    it('should return undefined for the last item when empty', () => {
      const licence = { a: [] }
      const testList = recordList({ licence, path: ['a'], allowEmpty: true })

      expect(testList.last()).to.eql(undefined)
    })
  })
})
