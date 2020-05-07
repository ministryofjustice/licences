import { Moment } from 'moment'

export interface AuditDto {
  id: number
  timestamp: object
  user: string
  action: string
  details: object
}

export interface AuditClient {
  record: (key: string, user: string, data: object) => Promise<void>
  getEvents: (action: string, filters: object, startMoment: Moment, endMoment: Moment) => Promise<Array<AuditDto>>
  getEvent: (eventId: number) => Promise<AuditDto>
  getEventsForBooking: (bookingId: number) => Promise<Array<AuditDto>>
  delete: () => Promise<void>
}
