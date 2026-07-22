import request from 'supertest'
import { startRoute } from '../../supertestSetup'
import createMigrateToCvlRoute from '../../../server/routes/admin/migrateToCvl'

describe('/migration-logs/', () => {
  let hdcService
  let mockLogs

  beforeEach(() => {
    mockLogs = {
      content: [
        {
          id: 1,
          licenceVersionId: 123,
          bookingId: 456,
          prisonNumber: 'A1234BC',
          errorSource: 'Test',
          success: false,
          retry: false,
          message: 'Test message',
        },
        {
          id: 2,
          licenceVersionId: 456,
          bookingId: 789,
          prisonNumber: 'D1234EF',
          errorSource: null,
          success: false,
          retry: false,
          message: null,
        },
      ],
      totalElements: 2,
      totalPages: 1,
      number: 0,
      size: 50,
    }

    hdcService = {
      getMigrationLogs: jest.fn().mockResolvedValue(mockLogs),
      getMigrationLogsCsv: jest.fn().mockResolvedValue('id,licenceVersionId,bookingId,prisonNumber\n1,123,456,A1234BC'),
    }
  })

  describe('GET', () => {
    test('renders HTML output with default parameters', () => {
      const app = createApp('batchUser')
      return request(app)
        .get('/admin/migrateToCvl/migration-logs')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(() => {
          expect(hdcService.getMigrationLogs).toHaveBeenCalledWith(
            undefined,
            undefined,
            undefined,
            undefined,
            { page: 0, size: 50 }
          )
        })
    })

    test('calls service with correct parameters from query string', () => {
      const app = createApp('batchUser')
      return request(app)
        .get('/admin/migrateToCvl/migration-logs')
        .query({
          licenceVersionId: '123',
          bookingId: '456',
          errorSource: 'CVL',
          success: 'false',
          page: '2',
          size: '100',
        })
        .expect(200)
        .expect(() => {
          expect(hdcService.getMigrationLogs).toHaveBeenCalledWith(
            123,
            456,
            'CVL',
            false,
            { page: 2, size: 100 }
          )
        })
    })

    test('handles success being true filter', () => {
      const app = createApp('batchUser')
      return request(app)
        .get('/admin/migrateToCvl/migration-logs')
        .query({ success: 'true' })
        .expect(200)
        .expect(() => {
          expect(hdcService.getMigrationLogs).toHaveBeenCalledWith(
            undefined,
            undefined,
            undefined,
            true,
            { page: 0, size: 50 }
          )
        })
    })

    test('returns CSV when format=csv', () => {
      const app = createApp('batchUser')
      return request(app)
        .get('/admin/migrateToCvl/migration-logs')
        .query({ format: 'csv' })
        .expect(200)
        .expect('Content-Type', /text\/csv/)
        .expect('Content-Disposition', /attachment;filename=migration-logs.csv/)
        .expect((res) => {
          expect(hdcService.getMigrationLogsCsv).toHaveBeenCalledWith(mockLogs.content)
          expect(res.text).toContain('id,licenceVersionId,bookingId,prisonNumber')
        })
    })

    test('should throw if accessed by non-authorised user', () => {
      const app = createApp('roUser')
      return request(app).get('/admin/migrateToCvl/migration-logs').expect(403)
    })
  })

  const createApp = (user) =>
    startRoute(createMigrateToCvlRoute(hdcService), '/admin/migrateToCvl', user)
})
