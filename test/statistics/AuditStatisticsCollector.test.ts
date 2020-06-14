import { AuditStatisticsCollector, Node } from '../../server/statistics/AuditStatisticsCollector'
import { AuditRow } from '../../server/statistics/types'

const START = 'LICENCE_RECORD_STARTED'
const VARY = 'VARY_NOMIS_LICENCE_CREATED'
const PDF = 'CREATE_PDF'

const row = (action: string, bookingId: number, path?: string): AuditRow =>
  path ? { action, details: { bookingId, path } } : { action, details: { bookingId } }

const countNode = (count: number): Node => ({ count, children: {} })
const emptyNode = (): Node => countNode(0)

let collector: AuditStatisticsCollector

beforeEach(() => {
  collector = new AuditStatisticsCollector()
})

describe('AuditStatisticsCollector', () => {
  describe('Basics', () => {
    it('can be constructed', () => {
      expect(collector).not.toBeUndefined()
      expect(collector.tree).toEqual(emptyNode())
    })

    it('accepts a single row', () => {
      collector.consumeRow({})
      expect(collector.tree).toEqual(emptyNode())
    })

    it('accepts a single row having a bookingId in the detail', () => {
      collector.consumeRow({ details: { bookingId: 1 } })
      expect(collector.tree).toEqual(emptyNode())
    })

    it('accepts a single row with arbitrary action', () => {
      collector.consumeRow({ action: 'X' })
      expect(collector.tree).toEqual(emptyNode())
    })

    it('accepts a single row with arbitrary action and a bookingId', () => {
      collector.consumeRow({ action: 'X', details: { bookingId: 1 } })
      expect(collector.tree).toEqual(emptyNode())
    })
  })

  describe('first level', () => {
    it(`collects ${START} actions`, () => {
      collector.consumeRow(row(START, 1))
      expect(collector.tree).toEqual({ count: 0, children: { Start: countNode(1) } })
    })

    it(`collects ${PDF} actions`, () => {
      collector.consumeRow(row(PDF, 1))
      expect(collector.tree).toEqual({ count: 0, children: { 'PDF Licence': countNode(1) } })
    })

    it('collects multiple rows', () => {
      collector.consumeRows([row(START, 1), row(START, 2), row(START, 3), row(START, 4)])
      expect(collector.tree).toEqual({ count: 0, children: { Start: countNode(4) } })
    })

    it('collects multiple rows', () => {
      collector.consumeRows([row(START, 1), row(VARY, 2)])
      expect(collector.tree).toEqual({
        count: 0,
        children: {
          Start: countNode(1),
          Vary: countNode(1),
        },
      })
    })
  })

  describe('Sequences of rows', () => {
    it('collects a sequence as a path', () => {
      collector.consumeRows([row(START, 1), row(VARY, 1)])
      expect(collector.tree).toEqual({
        count: 0,
        children: {
          Start: { count: 1, children: { Vary: countNode(1) } },
        },
      })
    })

    it('counts multiple visits to the same sequence', () => {
      collector.consumeRows([row(START, 1), row(VARY, 1), row(START, 2), row(VARY, 2), row(START, 3)])

      expect(collector.tree).toEqual({
        count: 0,
        children: {
          Start: { count: 3, children: { Vary: countNode(2) } },
        },
      })
    })

    it('produces the same result regardless of row order', () => {
      collector.consumeRows([row(START, 1), row(START, 2), row(START, 3), row(VARY, 1), row(VARY, 2)])

      expect(collector.tree).toEqual({
        count: 0,
        children: {
          Start: { count: 3, children: { Vary: countNode(2) } },
        },
      })
    })

    it('accummulates different sequences', () => {
      collector.consumeRows([
        row(START, 1),
        row(VARY, 1),

        row(START, 2),
        row(VARY, 2),

        row(START, 3),

        row(VARY, 5),
        row(START, 5),
        row(START, 5),

        row(VARY, 6),
        row(VARY, 6),
      ])

      expect(collector.tree).toEqual({
        count: 0,
        children: {
          Start: { count: 3, children: { Vary: countNode(2) } },
          Vary: {
            count: 2,
            children: {
              Start: { count: 1, children: { Start: countNode(1) } },
              Vary: countNode(1),
            },
          },
        },
      })
    })
  })
})
