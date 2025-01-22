import request from 'supertest'
import { startRoute } from '../supertestSetup'
import createAdminRoute from '../../server/routes/comAssignedLicencesForHandoverReport'

describe('/comAssignedLicencesForHandoverReport', () => {
  let licenceSearchService
  let audit

  beforeEach(() => {
    licenceSearchService = {
      getComAssignedLicencesForHandover: jest.fn(),
    }
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
      licenceSearchService.getComAssignedLicencesForHandover.mockReturnValue('1')
      const app = createApp('caUser')
      return request(app)
        .post('/comAssignedLicencesForHandoverReport')
        .expect(200)
        .expect(() => {
          expect(licenceSearchService.getComAssignedLicencesForHandover).toHaveBeenCalledWith(
            'CA_USER_TEST',
            'caseLoadId'
          )
        })
    })

    test('should call audit.addItem', () => {
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
    startRoute(createAdminRoute(licenceSearchService, audit), '/comAssignedLicencesForHandoverReport', user)
})
