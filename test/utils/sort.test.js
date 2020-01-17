const { sortObjArrayAsc } = require('../../server/utils/sort')

const objArray = [
  { code: '1', description: 'Hello' },
  { code: '2', description: 'Morning' },
  { code: '3', description: 'good evening' },
]

describe('sortObjArrayAsc', () => {
  test('Should sort array based on description', () => {
    sortObjArrayAsc(objArray)

    expect(objArray).toEqual([
      { code: '3', description: 'good evening' },
      { code: '1', description: 'Hello' },
      { code: '2', description: 'Morning' },
    ])

    expect(objArray).not.toEqual([
      { code: '1', description: 'Hello' },
      { code: '2', description: 'Morning' },
      { code: '3', description: 'good evening' },
    ])
  })
})
