const {
  addPaths,
  allValuesEmpty,
  equals,
  firstKey,
  getWhereKeyLike,
  interleave,
  isEmpty,
  pickKey,
  selectPathsFrom,
  sortKeys,
  unwrapResultOrThrow,
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

      expect(
        addPaths(
          [
            [['fifth'], 'value3'],
            [['third', 'fourth', 'answer2'], 'b'],
          ],
          object
        )
      ).toEqual({
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
  describe('sortKeys', () => {
    test('should handle empty object', () => {
      expect(sortKeys({})).toStrictEqual({})
    })
    test('should handle null object', () => {
      expect(sortKeys(null)).toStrictEqual({})
    })

    test('should handle simple sorted object', () => {
      const input = { a: 1, c: 3, b: 2 }
      const result = sortKeys(input)
      expect(result).toStrictEqual(input)
      expect(Object.keys(result)).toStrictEqual(['a', 'b', 'c'])
    })

    test('should sort top level of an object only', () => {
      const input = { b: 1, a: { a2: 1, c2: 3, b2: 2 } }
      const result = sortKeys(input)
      expect(result).toStrictEqual(input)
      expect(Object.keys(result)).toStrictEqual(['a', 'b'])
      expect(Object.keys(result.a)).toStrictEqual(['a2', 'c2', 'b2'])
    })
  })

  describe('unwrapResultOrThrow', () => {
    test('should handle empty object', () => {
      expect(unwrapResultOrThrow({})).toStrictEqual({})
    })
    test('should handle null object', () => {
      expect(unwrapResultOrThrow(null)).toStrictEqual(null)
    })

    test('should handle simple success', () => {
      expect(unwrapResultOrThrow(true)).toStrictEqual(true)
    })

    test('should handle simple success object', () => {
      expect(unwrapResultOrThrow({ a: 1 })).toStrictEqual({ a: 1 })
    })

    test('should handle error', () => {
      expect(() =>
        unwrapResultOrThrow({ code: '1', message: 'some problem' }, (error) => `${error.message} ${error.code}`)
      ).toThrow(Error('some problem 1'))
    })
  })

  describe('pickKey', () => {
    test('picks single matching key', () => {
      expect(pickKey((val, key) => key.includes('y'))({ ax: 1, ay: 2, az: 3 })).toEqual('ay')
    })

    test('picks single matching value', () => {
      expect(pickKey((val) => val === 3)({ ax: 1, ay: 2, az: 3 })).toEqual('az')
    })

    test('fails gracefully', () => {
      expect(pickKey((val, key) => key === 'a')({ ax: 1, ay: 2, az: 3 })).toBeUndefined()
    })
  })

  describe('firstKey', () => {
    test('handles no keys gracefully', () => {
      expect(firstKey({})).toBeUndefined()
    })

    test('picks single key', () => {
      expect(firstKey({ x: 1 })).toEqual('x')
    })

    test('picks a single arbitrary key when there is more than one', () => {
      expect(firstKey({ x: 1, y: 2 })).toMatch(/x|y/)
    })
  })

  describe('selectPathsFrom', () => {
    test('select paths', () => {
      const data = { a: { b: { c: 1 }, d: 'a' } }

      const selector = selectPathsFrom(data)

      expect(selector(['a', 'b', 'c'])).toEqual(1)
      expect(selector(['a', 'd'])).toEqual('a')
      expect(selector(['a', 'b', 'x'])).toBeUndefined()
    })
  })
})
