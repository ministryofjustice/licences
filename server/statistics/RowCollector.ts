import { RowConsumer } from './types'

export class RowCollector<T> implements RowConsumer<T> {
  rows: T[] = []

  consumeRows(chunk: Array<T>): void {
    this.rows = this.rows.concat(chunk)
  }
}
