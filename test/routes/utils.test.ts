import request from 'supertest'
import express from 'express'
import createRoute from '../../server/routes/utils'

describe('/utils/', () => {
  describe('reset', () => {
    test('deletes and redirects', async () => {
      const licenceClient = { deleteAll: jest.fn() }
      const auditClient = { deleteAll: jest.fn() }
      const warningClient = { deleteAll: jest.fn() }
      const app = createApp({ licenceClient, auditClient, warningClient, activeLduClient: {} })

      await request(app).get('/utils/reset').expect(302).expect('Location', '/')

      expect(auditClient.deleteAll).toHaveBeenCalled()
      expect(warningClient.deleteAll).toHaveBeenCalled()
      expect(licenceClient.deleteAll).toHaveBeenCalled()
    })
  })
})

function createApp(clients: Parameters<typeof createRoute>[0]) {
  const app = express()
  app.use('/utils/', createRoute(clients))
  return app
}
