const { flattenMeta } = require('../server/misc')

describe('misc', () => {
  describe('flattenMeta', () => {
    test('leaves 1 level', () => {
      expect(flattenMeta({ name: 'test', age: 40 })).toEqual({ name: 'test', age: 40 })
    })

    test('flattens 2 levels', () => {
      expect(flattenMeta({ name: 'test1', age: 40, mate: { name: 'test2', age: 42 } })).toEqual({
        name: 'test1',
        age: 40,
        mate_age: 42,
        mate_name: 'test2',
      })
    })

    test('flattens 3 levels with arrays', () => {
      expect(
        flattenMeta({ name: 'test1', age: 40, mate: { name: 'test2', age: 42, cats: ['test3', { name: 'test4' }] } })
      ).toEqual({
        name: 'test1',
        age: 40,
        mate_cats_0: 'test3',
        mate_cats_1_name: 'test4',
        mate_age: 42,
        mate_name: 'test2',
      })
    })

    test('copes with undefined', () => {
      expect(flattenMeta(undefined)).toEqual({})
    })

    test('copes with nulls', () => {
      expect(flattenMeta(null)).toEqual({})
    })

    test('copes with string', () => {
      expect(flattenMeta('some string')).toEqual({ 0: 'some string' })
    })

    test('copes with strings', () => {
      expect(flattenMeta('some string', 'another one!')).toEqual({ 0: 'some string', 1: 'another one!' })
    })

    test('copes with arrays', () => {
      expect(flattenMeta([1, 2, 3])).toEqual({ 0: 1, 1: 2, 2: 3 })
    })

    test('copes with arrays of objects', () => {
      expect(flattenMeta([{ name: 'test1' }, { name: 'test2' }])).toEqual({ '0_name': 'test1', '1_name': 'test2' })
    })
  })
})
