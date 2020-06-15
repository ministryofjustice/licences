import { d3hierarchy } from '../../server/statistics/d3adapter'

describe('d3hierarchy', () => {
  it('converts an empty tree', () => {
    expect(d3hierarchy({ count: 0, children: {} })).toEqual({ name: 'Root', children: [] })
  })

  it('converts one child', () => {
    expect(d3hierarchy({ count: 0, children: { A: { count: 4, children: {} } } })).toEqual({
      name: 'Root',
      children: [{ name: 'A', value: 4 }],
    })
  })

  it('converts children', () => {
    expect(
      d3hierarchy({
        count: 0,
        children: {
          A: { count: 4, children: {} },
          C: { count: 5, children: {} },
          B: { count: 3, children: {} },
        },
      })
    ).toEqual({
      name: 'Root',
      children: [
        { name: 'A', value: 4 },
        { name: 'B', value: 3 },
        { name: 'C', value: 5 },
      ],
    })
  })

  it('descends linear tree', () => {
    expect(
      d3hierarchy({
        count: 0,
        children: {
          A: {
            count: 4,
            children: {
              B: {
                count: 5,
                children: {},
              },
            },
          },
        },
      })
    ).toEqual({
      name: 'Root',
      children: [
        {
          name: 'A',
          value: 4,
          children: [
            {
              name: 'B',
              value: 5,
            },
          ],
        },
      ],
    })
  })
})
