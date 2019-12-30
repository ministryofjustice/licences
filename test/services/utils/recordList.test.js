const recordList = require('../../../server/services/utils/recordList')

describe('recordList', () => {
  describe('Do not allow empty', () => {
    test('should error when no elements at path', () => {
      const licence = { a: { b: { c: [0, 1, 2] } } }
      expect(() => recordList({ licence, path: ['a', 'b', 'c', 'd'] })).toThrowError(Error)
    })

    test('should error when not a list at path', () => {
      const licence = { a: { b: { c: { not: 'list' } } } }
      expect(() => recordList({ licence, path: ['a', 'b', 'c'] })).toThrowError(Error)
    })

    test('should remove item at index', () => {
      const licence = { a: { b: { c: [0, 1, 2] } } }
      const testList = recordList({ licence, path: ['a', 'b', 'c'] })

      expect(testList.remove({ index: 1 })).toEqual({ a: { b: { c: [0, 2] } } })
    })

    test('should add item at end', () => {
      const licence = { a: { b: { c: [0, 1, 2] } } }
      const testList = recordList({ licence, path: ['a', 'b', 'c'] })

      expect(testList.add({ record: { added: 3 } })).toEqual({ a: { b: { c: [0, 1, 2, { added: 3 }] } } })
    })

    test('should return the last item', () => {
      const licence = { a: [1, 2, 3] }
      const testList = recordList({ licence, path: ['a'] })

      expect(testList.last()).toBe(3)
    })
  })

  describe('Allow empty', () => {
    test('should not error when no elements at path', () => {
      const licence = { a: { b: { c: {} } } }
      const testList = recordList({ licence, path: ['a', 'b', 'c', 'd'], allowEmpty: true })
      expect(testList.add({ record: { added: 3 } })).toEqual({ a: { b: { c: { d: [{ added: 3 }] } } } })
    })

    test('should error when not a list at path even when allow empty', () => {
      const licence = { a: { b: { c: { not: 'list' } } } }
      expect(() => recordList({ licence, path: ['a', 'b', 'c'], allowEmpty: true })).toThrowError(Error)
    })

    test('should return undefined for the last item when empty', () => {
      const licence = { a: [] }
      const testList = recordList({ licence, path: ['a'], allowEmpty: true })

      expect(testList.last()).toEqual(undefined)
    })
  })
})
