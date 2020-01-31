const request = require('supertest')
const express = require('express')

const createRoute = require('../../server/routes/utils')

const audit = require('../../server/data/audit')
const warningClient = require('../../server/data/warningClient')
const licenceClient = require('../../server/data/licenceClient')

jest.mock('../../server/data/audit')
jest.mock('../../server/data/warningClient')
jest.mock('../../server/data/licenceClient')

describe('/utils/', () => {
  describe('reset', () => {
    test('deletes and redirects', () => {
      const app = createApp()
      return request(app)
        .get('/utils/reset')
        .expect(302)
        .expect('Location', '/')
        .then(() => {
          expect(audit.deleteAll).toHaveBeenCalled()
          expect(warningClient.deleteAll).toHaveBeenCalled()
          expect(licenceClient.deleteAll).toHaveBeenCalled()
        })
    })
  })
})

function createApp() {
  const app = express()
  app.use('/utils/', createRoute())
  return app
}
