import request from 'supertest'
import ReportsService from '../../server/services/reportsService'
import { startRoute } from '../supertestSetup'
import createAdminRoute from '../../server/routes/licencesRequiringComAssignmentReport'

jest.mock('../../server/services/reportsService')

describe('/licencesRequiringComAssignmentReport', () => {
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
        .get('/licencesRequiringComAssignmentReport')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('Download licences Requiring COM Assignment')
        })
    })
  })

  describe('POST', () => {
    test('calls search service', () => {
      reportsService.getLicencesRequiringComAssignment.mockResolvedValue('1')
      const app = createApp('caUser')
      return request(app)
        .post('/licencesRequiringComAssignmentReport')
        .expect(200)
        .expect(() => {
          expect(reportsService.getLicencesRequiringComAssignment).toHaveBeenCalledWith('CA_USER_TEST', 'caseLoadId')
        })
    })

    test('should call audit.record', () => {
      const app = createApp('caUser')
      return request(app)
        .post('/licencesRequiringComAssignmentReport')
        .expect(200)
        .expect(() => {
          expect(audit.record).toHaveBeenCalledWith('LICENCES_REQUIRING_COM_DOWNLOAD', 'CA_USER_TEST', {
            prisonId: 'caseLoadId',
          })
        })
    })
  })

  const createApp = (user) =>
    startRoute(createAdminRoute(reportsService, audit), '/licencesRequiringComAssignmentReport', user)
})
