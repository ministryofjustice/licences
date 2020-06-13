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

const sendEvents = {
  caToRo: 'Send CA -> RO',
  caToDm: 'Send CA -> DM',
  dmToCa: 'Send DM -> CA',
  roToCa: 'Send RO -> CA',
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
    if (transitionType.startsWith('caToDm')) return sendEvents.caToDm
    if (transitionType.startsWith('caToRo')) return sendEvents.caToRo
    if (transitionType.startsWith('dmToCa')) return sendEvents.dmToCa
    if (transitionType.startsWith('roToCa')) return sendEvents.roToCa
    return undefined
  }

  findEventName(action, details): string {
    switch (action) {
      case 'LICENCE_RECORD_STARTED':
        return 'Start'
      case 'SEND':
        return this.findSendEvent(details)
      case 'VARY_NOMIS_LICENCE_CREATE':
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
    rows.forEach(this.consumeRow, this)
  }
}
