const request = require('supertest')

const { startRoute } = require('../../supertestSetup')

const createAdminRoute = require('../../../server/routes/admin/licenceSearch')

describe('/licenceSearch/', () => {
  let licenceSearchService

  beforeEach(() => {
    licenceSearchService = {
      findForIdentifier: jest.fn(),
    }
  })

  describe('GET search', () => {
    test('Renders HTML output', () => {
      const app = createApp('batchUser')
      return request(app)
        .get('/admin/licenceSearch')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('Search for licence')
        })
    })

    test('should throw if submitted by non-authorised user', () => {
      const app = createApp('roUser')
      return request(app).get('/admin/licenceSearch').expect(403)
    })
  })

  describe('GET many results', () => {
    test('Renders HTML output', () => {
      licenceSearchService.findForIdentifier.mockReturnValue([{ id: 1 }, { id: 2 }])

      const app = createApp('batchUser')
      return request(app)
        .get('/admin/licenceSearch/123')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(licenceSearchService.findForIdentifier).toHaveBeenCalledWith('123')
          expect(res.text).toContain('href="/admin/licences/1"')
          expect(res.text).toContain('href="/admin/licences/2"')
        })
    })

    test('should throw if submitted by non-authorised user', () => {
      const app = createApp('roUser')
      return request(app).get('/admin/licenceSearch/123').expect(403)
    })
  })

  describe('POST search', () => {
    test('calls search service, finds licence and redirects to licence page', () => {
      licenceSearchService.findForIdentifier.mockReturnValue([{ id: 1 }])
      const app = createApp('batchUser')
      return request(app)
        .post('/admin/licenceSearch')
        .send('id=123')
        .expect(302)
        .expect('Location', '/admin/licences/1')
        .expect(() => {
          expect(licenceSearchService.findForIdentifier).toHaveBeenCalledWith('123')
        })
    })

    test('calls search service, fails to find licence and shows warning message', () => {
      licenceSearchService.findForIdentifier.mockReturnValue([])
      const app = createApp('batchUser')
      return request(app)
        .post('/admin/licenceSearch')
        .send('id=123')
        .expect(302)
        .expect('Location', '/admin/licenceSearch')
        .expect(() => {
          expect(licenceSearchService.findForIdentifier).toHaveBeenCalledWith('123')
        })
    })

    test('should throw if submitted by non-authorised user', () => {
      const app = createApp('roUser')
      return request(app).get('/admin/licenceSearch').expect(403)
    })
  })

  const createApp = (user) => startRoute(createAdminRoute(licenceSearchService), '/admin/licenceSearch', user)
})
