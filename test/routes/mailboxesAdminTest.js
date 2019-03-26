const request = require('supertest')

const {
  auditStub,
  createPrisonerServiceStub,
  createLicenceServiceStub,
  appSetup,
  createSignInServiceStub,
} = require('../supertestSetup')

const standardRouter = require('../../server/routes/routeWorkers/standardRouter')
const createAdminRoute = require('../../server/routes/admin/mailboxes')

describe('/admin', () => {
  let configClient

  beforeEach(() => {
    configClient = {
      getAllMailboxes: sinon.stub().resolves([{ id: '1', email: 'email1' }, { id: '2', email: 'email2' }]),
      getMailbox: sinon
        .stub()
        .resolves({ id: '1', email: 'email1', establishment: 'establishment1', role: 'role1', name: 'name1' }),
      updateMailbox: sinon.stub().resolves(),
      deleteMailbox: sinon.stub().resolves(),
      addMailbox: sinon.stub().resolves(),
    }
  })

  describe('GET /admin/mailboxes', () => {
    it('calls configClient and renders HTML output', () => {
      const app = createApp(configClient, 'batchUser')
      return request(app)
        .get('/admin/mailboxes')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(() => {
          expect(configClient.getAllMailboxes).to.be.calledOnce()
        })
    })

    it('should display the mailbox details', () => {
      const app = createApp(configClient, 'batchUser')
      return request(app)
        .get('/admin/mailboxes')
        .expect(200)
        .expect(res => {
          expect(res.text).to.contain('email1')
          expect(res.text).to.contain('email2')
        })
    })

    it('should throw if submitted by non-authorised user', () => {
      const app = createApp(configClient, 'roUser')
      return request(app)
        .get('/admin/mailboxes')
        .expect(403)
    })
  })

  describe('GET /admin/mailboxes/edit', () => {
    it('calls configClient and shows mailbox details', () => {
      const app = createApp(configClient, 'batchUser')
      return request(app)
        .get('/admin/mailboxes/edit/1')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(configClient.getMailbox).to.be.calledOnce()
          expect(configClient.getMailbox).to.be.calledWith('1')
          expect(res.text).to.contain('value="establishment1"')
          expect(res.text).to.contain('value="role1"')
          expect(res.text).to.contain('value="email1"')
          expect(res.text).to.contain('value="name1"')
        })
    })
  })

  describe('POST /admin/mailboxes/edit', () => {
    it('redirects back to page and does not call config client when missing establishment', () => {
      const app = createApp(configClient, 'batchUser')
      return request(app)
        .post('/admin/mailboxes/edit/1')
        .send({ establishment: '', email: 'email1', role: 'CA', name: 'name1' })
        .expect(302)
        .expect('Location', '/admin/mailboxes/edit/1')
        .expect(() => {
          expect(configClient.updateMailbox).not.to.be.calledOnce()
        })
    })

    it('redirects back to page and does not call config client when missing email', () => {
      const app = createApp(configClient, 'batchUser')
      return request(app)
        .post('/admin/mailboxes/edit/1')
        .send({ establishment: '1', email: '', role: 'CA', name: 'name1' })
        .expect(302)
        .expect('Location', '/admin/mailboxes/edit/1')
        .expect(() => {
          expect(configClient.updateMailbox).not.to.be.calledOnce()
        })
    })

    it('redirects back to page and does not call config client when role not CA or DM', () => {
      const app = createApp(configClient, 'batchUser')
      return request(app)
        .post('/admin/mailboxes/edit/1')
        .send({ establishment: '1', email: 'email1', role: 'RO', name: 'name1' })
        .expect(302)
        .expect('Location', '/admin/mailboxes/edit/1')
        .expect(() => {
          expect(configClient.updateMailbox).not.to.be.calledOnce()
        })
    })

    it('calls config client and redirects to mailbox list', () => {
      const app = createApp(configClient, 'batchUser')
      return request(app)
        .post('/admin/mailboxes/edit/1')
        .send({ establishment: '1', email: 'email1', role: 'CA', name: 'name1' })
        .expect(302)
        .expect('Location', '/admin/mailboxes')
        .expect(() => {
          expect(configClient.updateMailbox).to.be.calledOnce()
          expect(configClient.updateMailbox).to.be.calledWith('1', {
            establishment: '1',
            email: 'email1',
            role: 'CA',
            name: 'name1',
          })
        })
    })
  })

  describe('GET /admin/mailboxes/delete', () => {
    it('calls configClient and shows mailbox details', () => {
      const app = createApp(configClient, 'batchUser')
      return request(app)
        .get('/admin/mailboxes/delete/1')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(configClient.getMailbox).to.be.calledOnce()
          expect(configClient.getMailbox).to.be.calledWith('1')
          expect(res.text).to.contain('<td>establishment1')
          expect(res.text).to.contain('<td>role1')
          expect(res.text).to.contain('<td>email1')
          expect(res.text).to.contain('<td>name1')
        })
    })
  })

  describe('POST /admin/mailboxes/delete', () => {
    it('calls configClient and redirects to mailbox list', () => {
      const app = createApp(configClient, 'batchUser')
      return request(app)
        .post('/admin/mailboxes/delete/1')
        .send()
        .expect(302)
        .expect('Location', '/admin/mailboxes')
        .expect(() => {
          expect(configClient.deleteMailbox).to.be.calledOnce()
          expect(configClient.deleteMailbox).to.be.calledWith('1')
        })
    })
  })

  describe('GET /admin/mailboxes/add', () => {
    const app = createApp(configClient, 'batchUser')
    it('shows add mailbox form', () => {
      return request(app)
        .get('/admin/mailboxes/add/')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).to.contain('Add Mailbox')
        })
    })
  })

  describe('POST /admin/mailboxes/add', () => {
    it('redirects back to page and does not call config client when missing email', () => {
      const app = createApp(configClient, 'batchUser')
      return request(app)
        .post('/admin/mailboxes/add/')
        .send({ establishment: 'establishment1', email: '', role: 'role1', name: 'name1' })
        .expect(302)
        .expect('Location', '/admin/mailboxes/add')
        .expect(() => {
          expect(configClient.addMailbox).not.to.be.calledOnce()
        })
    })

    it('redirects back to page and does not call config client when missing establishment', () => {
      const app = createApp(configClient, 'batchUser')
      return request(app)
        .post('/admin/mailboxes/add/')
        .send({ establishment: '', email: 'email1', role: 'role1', name: 'name1' })
        .expect(302)
        .expect('Location', '/admin/mailboxes/add')
        .expect(() => {
          expect(configClient.addMailbox).not.to.be.calledOnce()
        })
    })

    it('redirects back to page and does not call config client when role not CA or DM', () => {
      const app = createApp(configClient, 'batchUser')
      return request(app)
        .post('/admin/mailboxes/add/')
        .send({ establishment: 'establishment1', email: 'email1', role: 'RO', name: 'name1' })
        .expect(302)
        .expect('Location', '/admin/mailboxes/add')
        .expect(() => {
          expect(configClient.addMailbox).not.to.be.calledOnce()
        })
    })

    it('calls config client and redirects to user list', () => {
      const app = createApp(configClient, 'batchUser')
      return request(app)
        .post('/admin/mailboxes/add/')
        .send({ establishment: 'establishment1', email: 'email1', role: 'CA', name: 'name1' })
        .expect(302)
        .expect('Location', '/admin/mailboxes')
        .expect(() => {
          expect(configClient.addMailbox).to.be.calledOnce()
          expect(configClient.addMailbox).to.be.calledWith({
            establishment: 'establishment1',
            email: 'email1',
            role: 'CA',
            name: 'name1',
          })
        })
    })
  })
})

function createApp(configClient, user) {
  const prisonerService = createPrisonerServiceStub()
  const licenceService = createLicenceServiceStub()
  const signInService = createSignInServiceStub()

  const baseRouter = standardRouter({ licenceService, prisonerService, audit: auditStub, signInService })
  const route = baseRouter(createAdminRoute({ configClient }))

  return appSetup(route, user, '/admin/mailboxes/')
}
