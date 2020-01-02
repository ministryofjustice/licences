const { flattenMeta } = require('../server/misc')

describe('misc', () => {
  describe('flattenMeta', () => {
    test('leaves 1 level', () => {
      expect(flattenMeta({ name: 'bob', age: 40 })).toEqual({ name: 'bob', age: 40 })
    })

    test('flattens 2 levels', () => {
      expect(flattenMeta({ name: 'bob', age: 40, mate: { name: 'Jo', age: 42 } })).toEqual({
        name: 'bob',
        age: 40,
        mate_age: 42,
        mate_name: 'Jo',
      })
    })

    test('flattens 3 levels with arrays', () => {
      expect(
        flattenMeta({ name: 'bob', age: 40, mate: { name: 'Jo', age: 42, cats: ['tim', { name: 'jon' }] } })
      ).toEqual({
        name: 'bob',
        age: 40,
        mate_cats_0: 'tim',
        mate_cats_1_name: 'jon',
        mate_age: 42,
        mate_name: 'Jo',
      })
    })

    test('copes with undefined', () => {
      expect(flattenMeta(undefined)).toEqual({})
    })

    test('copes with nulls', () => {
      expect(flattenMeta(null)).toEqual({})
    })
  })
})
