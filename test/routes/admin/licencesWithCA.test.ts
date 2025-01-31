import request from 'supertest'
import { startRoute } from '../../supertestSetup'
import createAdminRoute from '../../../server/routes/admin/comAssignmentForLicencesWithCA'

describe('/licencesWithCA/', () => {
  let reportsService
  let audit

  beforeEach(() => {
    reportsService = {
      getLicencesWithAndWithoutComAssignment: jest.fn(),
    }
    audit = {
      record: jest.fn(),
    }
  })

  describe('GET', () => {
    test('Renders HTML output', () => {
      const app = createApp('batchUser')
      return request(app)
        .get('/admin/downloadCasesWithCA')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('Download HDC cases sitting with CA')
        })
    })

    test('should throw if submitted by non-authorised user', () => {
      const app = createApp('roUser')
      return request(app).get('/admin/downloadCasesWithCA').expect(403)
    })
  })

  describe('POST', () => {
    test('calls search service', () => {
      reportsService.getLicencesWithAndWithoutComAssignment.mockReturnValue('1')
      const app = createApp('batchUser')
      return request(app)
        .post('/admin/downloadCasesWithCA')
        .expect(200)
        .expect(() => {
          expect(reportsService.getLicencesWithAndWithoutComAssignment).toHaveBeenCalledWith('NOMIS_BATCHLOAD')
        })
    })

    test('should call audit.record', () => {
      const app = createApp('batchUser')
      return request(app)
        .post('/admin/downloadCasesWithCA')
        .expect(200)
        .expect(() => {
          expect(audit.record).toHaveBeenCalledWith('LICENCE_STAGE_CA_DOWNLOAD', 'NOMIS_BATCHLOAD')
        })
    })

    test('should throw if submitted by non-authorised user', () => {
      const app = createApp('roUser')
      return request(app).post('/admin/downloadCasesWithCA').expect(403)
    })
  })

  const createApp = (user) => startRoute(createAdminRoute(reportsService, audit), '/admin/downloadCasesWithCA', user)
})
