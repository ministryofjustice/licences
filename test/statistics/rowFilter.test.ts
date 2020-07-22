import { RowFilter } from '../../server/statistics/rowFilter'
import { RowConsumer } from '../../server/statistics/types'

class SimpleConsumer<R> implements RowConsumer<R> {
  accumulator: Array<R> = []

  consumeRows(rows: Array<R>): void {
    this.accumulator = this.accumulator.concat(rows)
  }
}
describe('RowFilter', () => {
  const nullFilter = () => true

  it('Can be constructed', () => {
    new RowFilter<object>(new SimpleConsumer(), nullFilter)
  })

  it('Delegates', () => {
    const consumer = new SimpleConsumer<number>()
    const rowFilter = new RowFilter<number>(consumer, nullFilter)
    expect(consumer.accumulator).toEqual([])
    rowFilter.consumeRows([1, 2, 3])
    expect(consumer.accumulator).toEqual([1, 2, 3])
  })

  it('filters rows', () => {
    const consumer = new SimpleConsumer<number>()
    const rowFilter = new RowFilter<number>(consumer, (x) => x > 3)
    rowFilter.consumeRows([1, 2, 3, 4, 5, 6])
    expect(consumer.accumulator).toEqual([4, 5, 6])
  })
})
