const request = require('supertest')

const { appSetup } = require('../../supertestSetup')

const {
  createPrisonerServiceStub,
  createLicenceServiceStub,

  createSignInServiceStub,
} = require('../../mockServices')

const { mockAudit } = require('../../mockClients')

const standardRouter = require('../../../server/routes/routeWorkers/standardRouter')
const createAdminRoute = require('../../../server/routes/admin/mailboxes')

describe('/admin', () => {
  let configClient

  beforeEach(() => {
    configClient = {
      getAllMailboxes: jest.fn().mockReturnValue([
        { id: '1', email: 'email1' },
        { id: '2', email: 'email2' },
      ]),
      getMailbox: jest
        .fn()
        .mockResolvedValue({ id: '1', email: 'email1', establishment: 'establishment1', role: 'role1', name: 'name1' }),
      updateMailbox: jest.fn(),
      deleteMailbox: jest.fn(),
      addMailbox: jest.fn(),
    }
  })

  describe('GET /admin/mailboxes', () => {
    test('calls configClient and renders HTML output', () => {
      const app = createApp(configClient, 'batchUser')
      return request(app)
        .get('/admin/mailboxes')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(() => {
          expect(configClient.getAllMailboxes).toHaveBeenCalled()
        })
    })

    test('should display the mailbox details', () => {
      const app = createApp(configClient, 'batchUser')
      return request(app)
        .get('/admin/mailboxes')
        .expect(200)
        .expect((res) => {
          expect(res.text).toContain('email1')
          expect(res.text).toContain('email2')
        })
    })

    test('should throw if submitted by non-authorised user', () => {
      const app = createApp(configClient, 'roUser')
      return request(app).get('/admin/mailboxes').expect(403)
    })
  })

  describe('GET /admin/mailboxes/edit', () => {
    test('calls configClient and shows mailbox details', () => {
      const app = createApp(configClient, 'batchUser')
      return request(app)
        .get('/admin/mailboxes/edit/1')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(configClient.getMailbox).toHaveBeenCalled()
          expect(configClient.getMailbox).toHaveBeenCalledWith('1')
          expect(res.text).toContain('value="establishment1"')
          expect(res.text).toContain('value="role1"')
          expect(res.text).toContain('value="email1"')
          expect(res.text).toContain('value="name1"')
        })
    })
  })

  describe('POST /admin/mailboxes/edit', () => {
    describe('Invalid inputs', () => {
      const examples = [
        {
          input: { establishment: 'establishment1', email: '', role: 'CA', name: 'name1' },
          reason: 'missing email',
        },
        {
          input: { establishment: '', email: 'email1', role: 'CA', name: 'name1' },
          reason: 'missing establishment',
        },
        { input: {}, reason: 'missing all' },
        {
          input: { establishment: 'establishment1', email: 'email1', role: 'RO', name: 'name1' },
          reason: 'role not CA or DM',
        },
      ]

      examples.forEach((example) => {
        test(`redirects back to page and does not call config client when ${example.reason}`, () => {
          const app = createApp(configClient, 'batchUser')
          return request(app)
            .post('/admin/mailboxes/edit/1')
            .send(example.input)
            .expect(302)
            .expect('Location', '/admin/mailboxes/edit/1')
            .expect(() => {
              expect(configClient.updateMailbox).not.toHaveBeenCalled()
            })
        })
      })
    })

    describe('Valid inputs', () => {
      const examples = [
        { establishment: '1', email: 'email1', role: 'CA', name: 'name1' },
        { establishment: '*^^*', email: 'NOT_AN_EMAIL^%$$', role: 'CA', name: '22' },
      ]

      examples.forEach((exampleValidInput) => {
        test('calls config client and redirects to mailbox list', () => {
          const app = createApp(configClient, 'batchUser')
          return request(app)
            .post('/admin/mailboxes/edit/1')
            .send(exampleValidInput)
            .expect(302)
            .expect('Location', '/admin/mailboxes')
            .expect(() => {
              expect(configClient.updateMailbox).toHaveBeenCalled()
              expect(configClient.updateMailbox).toHaveBeenCalledWith('1', exampleValidInput)
            })
        })
      })
    })
  })

  describe('GET /admin/mailboxes/delete', () => {
    test('calls configClient and shows mailbox details', () => {
      const app = createApp(configClient, 'batchUser')
      return request(app)
        .get('/admin/mailboxes/delete/1')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(configClient.getMailbox).toHaveBeenCalled()
          expect(configClient.getMailbox).toHaveBeenCalledWith('1')
          expect(res.text).toContain('<td>establishment1')
          expect(res.text).toContain('<td>role1')
          expect(res.text).toContain('<td>email1')
          expect(res.text).toContain('<td>name1')
        })
    })
  })

  describe('POST /admin/mailboxes/delete', () => {
    test('calls configClient and redirects to mailbox list', () => {
      const app = createApp(configClient, 'batchUser')
      return request(app)
        .post('/admin/mailboxes/delete/1')
        .send()
        .expect(302)
        .expect('Location', '/admin/mailboxes')
        .expect(() => {
          expect(configClient.deleteMailbox).toHaveBeenCalled()
          expect(configClient.deleteMailbox).toHaveBeenCalledWith('1')
        })
    })
  })

  describe('GET /admin/mailboxes/add', () => {
    const app = createApp(configClient, 'batchUser')
    test('shows add mailbox form', () => {
      return request(app)
        .get('/admin/mailboxes/add/')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('Add Mailbox')
        })
    })
  })

  describe('POST /admin/mailboxes/add', () => {
    describe('Invalid inputs', () => {
      const examples = [
        {
          input: { establishment: 'establishment1', email: '', role: 'CA', name: 'name1' },
          reason: 'missing email',
        },
        {
          input: { establishment: '', email: 'email1', role: 'CA', name: 'name1' },
          reason: 'missing establishment',
        },
        { input: {}, reason: 'missing all' },
        {
          input: { establishment: 'establishment1', email: 'email1', role: 'RO', name: 'name1' },
          reason: 'role not CA or DM',
        },
      ]

      examples.forEach((example) => {
        test(`redirects back to page and does not call config client when ${example.reason}`, () => {
          const app = createApp(configClient, 'batchUser')
          return request(app)
            .post('/admin/mailboxes/add/')
            .send(example.input)
            .expect(302)
            .expect('Location', '/admin/mailboxes/add')
            .expect(() => {
              expect(configClient.addMailbox).not.toHaveBeenCalled()
            })
        })
      })
    })

    describe('Valid inputs', () => {
      const examples = [
        { establishment: '1', email: 'email1', role: 'CA', name: 'name1' },
        { establishment: '*^^*', email: 'NOT_AN_EMAIL^%$$', role: 'CA', name: ';DROP TABLE LICENCES' },
      ]

      examples.forEach((exampleValidInput) => {
        test('calls config client and redirects to mailbox list', () => {
          const app = createApp(configClient, 'batchUser')
          return request(app)
            .post('/admin/mailboxes/add/')
            .send(exampleValidInput)
            .expect(302)
            .expect('Location', '/admin/mailboxes')
            .expect(() => {
              expect(configClient.addMailbox).toHaveBeenCalled()
              expect(configClient.addMailbox).toHaveBeenCalledWith(exampleValidInput)
            })
        })
      })
    })
  })
})

function createApp(configClient, user) {
  const prisonerService = createPrisonerServiceStub()
  const licenceService = createLicenceServiceStub()
  const signInService = createSignInServiceStub()
  const audit = mockAudit()

  const baseRouter = standardRouter({ licenceService, prisonerService, audit, signInService, config: null })
  const route = baseRouter(createAdminRoute({ configClient }))

  return appSetup(route, user, '/admin/mailboxes/')
}
