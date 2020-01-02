const {
  addPaths,
  allValuesEmpty,
  equals,
  getWhereKeyLike,
  interleave,
  isEmpty,
} = require('../../server/utils/functionalHelpers')

describe('functionalHelpers', () => {
  describe('allValuesEmpty', () => {
    test('should return true for object of empty strings', () => {
      const input = { a: '', b: '' }
      const expectedOutput = true

      expect(allValuesEmpty(input)).toBe(expectedOutput)
    })

    test('should return true for object of empty items', () => {
      const input = { a: '', b: [], c: {}, d: undefined }
      const expectedOutput = true

      expect(allValuesEmpty(input)).toBe(expectedOutput)
    })

    test('should return false for array with a string', () => {
      const input = { a: '', b: 'g' }
      const expectedOutput = false

      expect(allValuesEmpty(input)).toBe(expectedOutput)
    })
  })

  describe('interleave', () => {
    const examples = [
      [[], [], ''],
      [[], ['a'], ''],
      [['1'], [], '1'],
      [['1'], ['a'], '1a'],
      [['1', '2'], ['a'], '1a2'],
      [['1', '2'], ['a', 'b'], '1a2b'],
      [['1', '2', '3', '4', '5'], ['a', 'b'], '1a2b345'],
      [['1', '2'], ['a', 'b', 'c', 'd', 'e'], '1a2b'],
    ]

    examples.forEach(([first, second, result]) => {
      test(`should return '${result}' for [${first}] with [${second}]`, () => {
        expect(interleave(first, second)).toBe(result)
      })
    })
  })

  describe('equals', () => {
    test('should return true if objects are equal', () => {
      expect(equals({ a: 'a' }, { a: 'a' })).toBe(true)
    })

    test('should return true if deep nested objects are equal', () => {
      expect(equals({ a: 'a', b: { c: { d: 'e' } } }, { b: { c: { d: 'e' } }, a: 'a' })).toBe(true)
    })

    test('should return false if deep nested objects are not equal', () => {
      expect(equals({ a: 'a', b: { c: { d: 'e' } } }, { b: { c: { d: 'f' } }, a: 'a' })).toBe(false)
    })

    test('should return true if arrays are equal', () => {
      expect(equals(['a', 'b'], ['a', 'b'])).toBe(true)
    })

    test('should return false if arrays arent equal', () => {
      expect(equals(['a', 'b'], ['b', 'a'])).toBe(false)
    })
  })

  describe('getWhereKeyLike', () => {
    test('should return the value if the key contains the string passed in', () => {
      const object = {
        abcd: 'value1',
        cdef: 'value2',
      }

      expect(getWhereKeyLike('abcd/arg', object)).toBe('value1')
    })
  })

  describe('addPaths', () => {
    test('should return object with answers injected', () => {
      const object = {
        first: 'value1',
        second: 'value2',
        third: {
          fourth: {
            answer: 'a',
          },
        },
      }

      expect(addPaths([[['fifth'], 'value3'], [['third', 'fourth', 'answer2'], 'b']], object)).toEqual({
        first: 'value1',
        second: 'value2',
        third: {
          fourth: {
            answer: 'a',
            answer2: 'b',
          },
        },
        fifth: 'value3',
      })
    })
  })

  describe('isEmpty', () => {
    test('should return false for a non-empty string', () => {
      expect(isEmpty('x')).toBe(false)
    })

    test('should return false for a non-empty array', () => {
      expect(isEmpty(['x'])).toBe(false)
    })

    test('should return false for a non-empty object', () => {
      expect(isEmpty({ a: 1 })).toBe(false)
    })

    test('should return true for an empty string', () => {
      expect(isEmpty('')).toBe(true)
    })

    test('should return true for an empty array', () => {
      expect(isEmpty([])).toBe(true)
    })

    test('should return true for an empty object', () => {
      expect(isEmpty({})).toBe(true)
    })

    test('should return true for null', () => {
      expect(isEmpty(null)).toBe(true)
    })

    test('should return true for undefined', () => {
      expect(isEmpty(undefined)).toBe(true)
    })
  })
})
