const request = require('supertest')

const { startRoute } = require('../../supertestSetup')

const createAdminRoute = require('../../../server/routes/admin/admin')

describe('/', () => {
  describe('GET /admin/', () => {
    test('NOMIS Batch user', () => {
      const app = createApp('batchUser')
      return request(app)
        .get('/admin/')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('Admin')
          expect(res.text).toContain('href="/" data-qa="exit-to-dps-link"')
        })
    })

    test('Auth Batch user', () => {
      const app = createApp('authBatchUser')
      return request(app)
        .get('/admin/')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('Admin')
          expect(res.text).not.toContain('href="/" data-qa="exit-to-dps-link"')
        })
    })
  })

  const createApp = (user) => startRoute(createAdminRoute(), '/admin', user, 'ACTIVE_LDUS')
})
