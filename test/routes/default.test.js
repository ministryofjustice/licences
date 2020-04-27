const request = require('supertest')
const defaultRoute = require('../../server/routes/default')
const { startRoute } = require('../supertestSetup')

describe('GET /', () => {
  test('redirects to caselist for normal users', () => {
    const app = createApp('caUser')

    return request(app).get('/').expect(302).expect('Location', '/caseList/active')
  })

  test('redirects to admin for admin users', () => {
    const app = createApp('batchUser')

    return request(app).get('/').expect(302).expect('Location', '/admin/')
  })
})

const createApp = (user) => startRoute(defaultRoute(), '/', user)
