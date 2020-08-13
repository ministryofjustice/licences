import Booking, { AddressChoice } from './booking'
import { AuditRow, Event, RowConsumer, Actions } from './types'

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

const emptyNode = () => ({ count: 0, children: {} })

export class AuditStatisticsCollector implements RowConsumer<AuditRow> {
  readonly tree: Node

  private readonly bookingState: { [bookingId: number]: BookingState }

  constructor() {
    this.bookingState = {}
    this.tree = emptyNode()
  }

  findSendEvent(details): Event {
    const transitionType = details?.transitionType

    if (!transitionType) return undefined

    switch (transitionType) {
      case 'caToDm':
        return Event.caToDm

      case 'caToDmRefusal':
        return Event.caToDmRefusal

      case 'caToDmResubmit':
        return Event.caToDmResubmit

      case 'caToRo':
        switch (this.getBookingState(details.bookingId).booking.getAddressChoice()) {
          case AddressChoice.Address:
            return Event.caToRoAddress
          case AddressChoice.Bass:
            return Event.caToRoBass
          default:
            return Event.caToRo
        }

      case 'dmToCa':
        return Event.dmToCa

      case 'dmToCaReturn':
        return Event.dmToCaReturn

      case 'roToCa':
        return this.getBookingState(details.bookingId).booking.getApprovedPremises()
          ? Event.roToCaApprovedPremises
          : Event.roToCa

      case 'roToCaAddressRejected':
        return Event.roToCaAddressRejected
      default:
        return undefined
    }
  }

  findEventName(action, details): Event {
    switch (action) {
      case Actions.START:
        return Event.start

      case Actions.SEND:
        return this.findSendEvent(details)

      case Actions.PDF:
        return Event.pdfLicence

      case Actions.VARY:
        return Event.vary

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

  addEvent(eventName: Event, bookingId) {
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
    // eslint-disable-next-line no-console
    console.log(`Consuming ${rows.length} rows. Starts so far: ${this.tree?.children?.['Start']?.count || 0}`)
    rows.forEach(this.consumeRow, this)
  }
}
