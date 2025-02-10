import request from 'supertest'
import ReportsService from '../../server/services/reportsService'
import { startRoute } from '../supertestSetup'
import createAdminRoute from '../../server/routes/caReports'

jest.mock('../../server/services/reportsService')

describe('/caReports', () => {
  let reportsService: jest.Mocked<ReportsService>
  let audit

  beforeEach(() => {
    reportsService = new ReportsService(undefined, undefined, undefined, undefined) as jest.Mocked<ReportsService>
    audit = {
      record: jest.fn(),
    }
  })

  describe('GET', () => {
    test('Renders HTML output', () => {
      const app = createApp('caUser')
      return request(app)
        .get('/people-ready-for-probation-checks')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('People who are ready for probation checks')
        })
    })
  })

  describe('GET /download-unallocated', () => {
    test('calls search service', () => {
      reportsService.getLicencesRequiringComAssignment.mockResolvedValue('1')
      const app = createApp('caUser')
      return request(app)
        .get('/people-ready-for-probation-checks/download-unallocated')
        .expect(200)
        .expect(() => {
          expect(reportsService.getLicencesRequiringComAssignment).toHaveBeenCalledWith('CA_USER_TEST', 'caseLoadId')
        })
    })

    test('should call audit.record', () => {
      const app = createApp('caUser')
      return request(app)
        .get('/people-ready-for-probation-checks/download-unallocated')
        .expect(200)
        .expect(() => {
          expect(audit.record).toHaveBeenCalledWith('LICENCES_REQUIRING_COM_DOWNLOAD', 'CA_USER_TEST', {
            prisonId: 'caseLoadId',
          })
        })
    })
  })

  describe('GET /download-allocated', () => {
    test('calls search service', () => {
      reportsService.getComAssignedLicencesForHandover.mockResolvedValue('1')
      const app = createApp('caUser')
      return request(app)
        .get('/people-ready-for-probation-checks/download-allocated')
        .expect(200)
        .expect(() => {
          expect(reportsService.getComAssignedLicencesForHandover).toHaveBeenCalledWith('CA_USER_TEST', 'caseLoadId')
        })
    })

    test('should call audit.record', () => {
      const app = createApp('caUser')
      return request(app)
        .get('/people-ready-for-probation-checks/download-allocated')
        .expect(200)
        .expect(() => {
          expect(audit.record).toHaveBeenCalledWith('COM_ASSIGNED_LICENCES_FOR_HANDOVER_DOWNLOAD', 'CA_USER_TEST', {
            prisonId: 'caseLoadId',
          })
        })
    })
  })

  const createApp = (user) =>
    startRoute(createAdminRoute(reportsService, audit), '/people-ready-for-probation-checks', user)
})
