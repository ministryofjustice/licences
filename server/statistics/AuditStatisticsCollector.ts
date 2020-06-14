import Booking from './booking'
import { AuditRow, RowConsumer } from './types'

export interface Node {
  count: number
  children: {
    [eventName: string]: Node
  }
}

/**
 * 1) accumulate key booking state for a booking from data read from audit rows
 * 2) Remember the most recent node in the tree to which this booking was moved in response to an event so that
 * the next event for this booking can be added to the right place in the tree
 */
interface BookingState {
  currentNode: Node
  booking: Booking
}

enum SendEvents {
  caToRo = 'Send CA -> RO',
  caToDm = 'Send CA -> DM',
  dmToCa = 'Send DM -> CA',
  roToCa = 'Send RO -> CA',
}

enum Actions {
  SEND = 'SEND',
  START = 'LICENCE_RECORD_STARTED',
  PDF = 'CREATE_PDF',
  VARY = 'VARY_NOMIS_LICENCE_CREATED',
}

const emptyNode = () => ({ count: 0, children: {} })

export class AuditStatisticsCollector implements RowConsumer<AuditRow> {
  readonly tree: Node

  private readonly bookingState: { [bookingId: number]: BookingState }

  constructor() {
    this.bookingState = {}
    this.tree = emptyNode()
  }

  findSendEvent(details) {
    const transitionType = details?.transitionType
    if (transitionType.startsWith('caToDm')) return SendEvents.caToDm
    if (transitionType.startsWith('caToRo')) return SendEvents.caToRo
    if (transitionType.startsWith('dmToCa')) return SendEvents.dmToCa
    if (transitionType.startsWith('roToCa')) return SendEvents.roToCa
    return undefined
  }

  findEventName(action, details): string {
    switch (action) {
      case Actions.START:
        return 'Start'
      case Actions.SEND:
        return this.findSendEvent(details)
      case Actions.PDF:
        return 'PDF Licence'
      case Actions.VARY:
        return 'Vary'
      default:
        return undefined
    }
  }

  getBookingState(bookingId): BookingState {
    if (!this.bookingState[bookingId]) {
      this.bookingState[bookingId] = {
        currentNode: this.tree,
        booking: new Booking(),
      }
    }
    return this.bookingState[bookingId]
  }

  childNode(node, eventName) {
    if (!node.children[eventName]) {
      // eslint-disable-next-line no-param-reassign
      node.children[eventName] = emptyNode()
    }
    return node.children[eventName]
  }

  addEvent(eventName, bookingId) {
    if (!eventName) return
    const nextNode = this.childNode(this.getBookingState(bookingId).currentNode, eventName)
    nextNode.count += 1
    this.bookingState[bookingId].currentNode = nextNode
  }

  consumeRow(row: AuditRow): void {
    const bookingId = row?.details?.bookingId
    if (!bookingId) return

    const { booking } = this.getBookingState(bookingId)
    booking.update(row.action, row.details)
    if (booking.getEvent()) {
      this.addEvent(booking.getEvent(), bookingId)
    } else {
      const eventName = this.findEventName(row.action, row.details)
      this.addEvent(eventName, bookingId)
    }
  }

  consumeRows(rows: Array<AuditRow>): void {
    console.log(`Consuming ${rows.length} rows. Starts so far: ${this.tree?.children?.['Start']?.count}`)
    rows.forEach(this.consumeRow, this)
  }
}
