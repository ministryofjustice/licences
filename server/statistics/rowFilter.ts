import { RowConsumer } from './types'

interface Predicate<R> {
  (value: R): boolean
}
export default class RowFilter<R> implements RowConsumer<R> {
  constructor(
    readonly delegate: RowConsumer<R>,
    readonly filterPredicate: Predicate<R>
  ) {}

  consumeRows(rows: Array<R>): void {
    const filteredRows = rows.filter(this.filterPredicate)
    this.delegate.consumeRows(filteredRows)
  }
}
