import request from 'supertest'
import { startRoute } from '../../supertestSetup'
import createAdminRoute from '../../../server/routes/admin/licencesWithCOM'

describe('/licencesWithCOM/', () => {
  let licenceSearchService

  beforeEach(() => {
    licenceSearchService = {
      getLicencesInStageCOM: jest.fn(),
    }
  })

  describe('GET', () => {
    test('Renders HTML output', () => {
      const app = createApp('batchUser')
      return request(app)
        .get('/admin/downloadLicencesWithCOM')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('Download HDC cases sitting with COM')
        })
    })

    test('should throw if submitted by non-authorised user', () => {
      const app = createApp('roUser')
      return request(app).get('/admin/downloadLicencesWithCOM').expect(403)
    })
  })

  describe('POST', () => {
    test('calls search service', () => {
      licenceSearchService.getLicencesInStageCOM.mockReturnValue('1')
      const app = createApp('batchUser')
      return request(app)
        .post('/admin/downloadLicencesWithCOM')
        .expect(200)
        .expect(() => {
          expect(licenceSearchService.getLicencesInStageCOM).toHaveBeenCalledWith('NOMIS_BATCHLOAD')
        })
    })

    test('should throw if submitted by non-authorised user', () => {
      const app = createApp('roUser')
      return request(app).post('/admin/downloadLicencesWithCOM').expect(403)
    })
  })

  const createApp = (user) => startRoute(createAdminRoute(licenceSearchService), '/admin/downloadLicencesWithCOM', user)
})
