const { flattenMeta } = require('../server/misc')

describe('misc', () => {
  describe('flattenMeta', () => {
    it('leaves 1 level', () => {
      expect(flattenMeta({ name: 'bob', age: 40 })).to.eql({ name: 'bob', age: 40 })
    })

    it('flattens 2 levels', () => {
      expect(flattenMeta({ name: 'bob', age: 40, mate: { name: 'Jo', age: 42 } })).to.eql({
        name: 'bob',
        age: 40,
        mate_age: 42,
        mate_name: 'Jo',
      })
    })

    it('flattens 3 levels with arrays', () => {
      expect(
        flattenMeta({ name: 'bob', age: 40, mate: { name: 'Jo', age: 42, cats: ['tim', { name: 'jon' }] } })
      ).to.eql({
        name: 'bob',
        age: 40,
        mate_cats_0: 'tim',
        mate_cats_1_name: 'jon',
        mate_age: 42,
        mate_name: 'Jo',
      })
    })

    it('copes with undefined', () => {
      expect(flattenMeta(undefined)).to.eql({})
    })

    it('copes with nulls', () => {
      expect(flattenMeta(null)).to.eql({})
    })
  })
})
