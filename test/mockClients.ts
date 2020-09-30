import { Moment } from 'moment'

import { AuditClient, AuditDto } from '../types/audit'

export interface AuditMock extends AuditClient {
  record: jest.Mock<Promise<void>, [string, string, object]>
  getEvents: jest.Mock<Promise<Array<AuditDto>>, [string, object, Moment, Moment]>
  getEvent: jest.Mock<Promise<AuditDto>, [number]>
  getEventsForBooking: jest.Mock<Promise<Array<AuditDto>>, [number]>
  delete: jest.Mock<Promise<void>, []>
}

export const mockAudit: () => AuditMock = () => ({
  record: jest.fn(),
  getEvents: jest.fn(),
  getEvent: jest.fn(),
  getEventsForBooking: jest.fn(),
  delete: jest.fn(),
})
