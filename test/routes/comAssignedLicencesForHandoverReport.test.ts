import request from 'supertest'
import { ReportsService } from '../../server/services/reportsService'
import { startRoute } from '../supertestSetup'
import createAdminRoute from '../../server/routes/comAssignedLicencesForHandoverReport'

jest.mock('../../server/services/reportsService')

describe('/comAssignedLicencesForHandoverReport', () => {
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
        .get('/comAssignedLicencesForHandoverReport')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('Download eligible licences ready for handover')
        })
    })
  })

  describe('POST', () => {
    test('calls search service', () => {
      reportsService.getComAssignedLicencesForHandover.mockResolvedValue('1')
      const app = createApp('caUser')
      return request(app)
        .post('/comAssignedLicencesForHandoverReport')
        .expect(200)
        .expect(() => {
          expect(reportsService.getComAssignedLicencesForHandover).toHaveBeenCalledWith('CA_USER_TEST', 'caseLoadId')
        })
    })

    test('should call audit.record', () => {
      const app = createApp('caUser')
      return request(app)
        .post('/comAssignedLicencesForHandoverReport')
        .expect(200)
        .expect(() => {
          expect(audit.record).toHaveBeenCalledWith('COM_ASSIGNED_LICENCES_FOR_HANDOVER_DOWNLOAD', 'CA_USER_TEST', {
            prisonId: 'caseLoadId',
          })
        })
    })
  })

  const createApp = (user) =>
    startRoute(createAdminRoute(reportsService, audit), '/comAssignedLicencesForHandoverReport', user)
})
