import { AuditClient } from '../server/data/audit'

export type AuditMock = jest.Mocked<AuditClient>

export const mockAudit = (): AuditMock =>
  ({
    record: jest.fn(),
    getEvents: jest.fn(),
    getEvent: jest.fn(),
    getEventsForBooking: jest.fn(),
    deleteAll: jest.fn(),
  }) as unknown as AuditMock
