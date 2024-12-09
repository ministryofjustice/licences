import request from 'supertest'

import { startRoute } from '../../supertestSetup'

import createAdminRoute from '../../../server/routes/admin/completionDestinationSearch'

describe('/completionDestinationSearch/', () => {
  let licenceSearchService

  beforeEach(() => {
    licenceSearchService = {
      findForId: jest.fn(),
    }
  })

  describe('GET search', () => {
    test('Renders HTML output', () => {
      const app = createApp('batchUser')
      return request(app)
        .get('/admin/completionDestinationSearch')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('Search for licence')
        })
    })

    test('should throw if submitted by non-authorised user', () => {
      const app = createApp('roUser')
      return request(app).get('/admin/completionDestinationSearch').expect(403)
    })
  })

  describe('POST search', () => {
    test('calls search service, finds licence and redirects to licence page', () => {
      licenceSearchService.findForId.mockReturnValue(1)
      const app = createApp('batchUser')
      return request(app)
        .post('/admin/completionDestinationSearch')
        .send('id=123')
        .expect(302)
        .expect('Location', '/admin/completionDestination/1/set-complete-destination')
        .expect(() => {
          expect(licenceSearchService.findForId).toHaveBeenCalledWith('NOMIS_BATCHLOAD', '123')
        })
    })

    test('calls search service, fails to find licence and shows warning message', () => {
      licenceSearchService.findForId.mockReturnValue(null)
      const app = createApp('batchUser')
      return request(app)
        .post('/admin/completionDestinationSearch')
        .send('id=123')
        .expect(302)
        .expect('Location', '/admin/completionDestinationSearch')
        .expect(() => {
          expect(licenceSearchService.findForId).toHaveBeenCalledWith('NOMIS_BATCHLOAD', '123')
        })
    })

    test('should throw if submitted by non-authorised user', () => {
      const app = createApp('roUser')
      return request(app).get('/admin/completionDestinationSearch').expect(403)
    })
  })

  const createApp = (user) =>
    startRoute(createAdminRoute(licenceSearchService), '/admin/completionDestinationSearch', user)
})
