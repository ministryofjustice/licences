const request = require('supertest')

const {
  createUserAdminServiceStub,
  auditStub,
  createPrisonerServiceStub,
  createLicenceServiceStub,
  appSetup,
  createSignInServiceStub,
} = require('../supertestSetup')

const standardRouter = require('../../server/routes/routeWorkers/standardRouter')
const createAdminRoute = require('../../server/routes/admin/users')

const user1 = {
  nomisId: 'user1',
  deliusId: 'd1',
  first: 'f1',
  last: 'l1',
}

const user2 = {
  nomisId: 'user2',
  deliusId: 'd2',
  first: 'f2',
  last: 'l2',
}

describe('/admin', () => {
  let userAdminService

  beforeEach(() => {
    auditStub.record.reset()

    userAdminService = createUserAdminServiceStub()

    userAdminService.findRoUsers.reset()
    userAdminService.getRoUsers.reset()
    userAdminService.getRoUser.reset()

    userAdminService.getRoUsers.resolves([user1, user2])
    userAdminService.findRoUsers.resolves([user1])
    userAdminService.getRoUser.resolves(user1)

    userAdminService.verifyUserDetails.resolves({
      username: 'nomisUser',
      firstName: 'nomisFirst',
      lastName: 'nomisLast',
    })
  })

  describe('GET /admin/roUsers', () => {
    it('calls user service and renders HTML output', () => {
      const app = createApp({ userAdminServiceStub: userAdminService }, 'batchUser')
      return request(app)
        .get('/admin/roUsers')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(() => {
          expect(userAdminService.getRoUsers).to.be.calledOnce()
        })
    })

    it('should display the user details', () => {
      const app = createApp({ userAdminServiceStub: userAdminService }, 'batchUser')
      return request(app)
        .get('/admin/roUsers')
        .expect(200)
        .expect(res => {
          expect(res.text).to.contain('user1')
          expect(res.text).to.contain('user2')
        })
    })

    it('should throw if submitted by non-authorised user', () => {
      const app = createApp({ userAdminServiceStub: userAdminService }, 'roUser')
      return request(app)
        .get('/admin/roUsers')
        .expect(403)
    })
  })

  describe('POST /admin/roUsers', () => {
    it('redirects back to page and does not call user service when no search term', () => {
      const app = createApp({ userAdminServiceStub: userAdminService }, 'batchUser')
      return request(app)
        .post('/admin/roUsers')
        .send({ searchTerm: '  ' })
        .expect(302)
        .expect(() => {
          expect(userAdminService.findRoUsers).not.to.be.calledOnce()
        })
    })

    it('calls user service and renders HTML output', () => {
      const app = createApp({ userAdminServiceStub: userAdminService }, 'batchUser')
      return request(app)
        .post('/admin/roUsers')
        .send({ searchTerm: 'aQuery' })
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(userAdminService.findRoUsers).to.be.calledOnce()
          expect(userAdminService.findRoUsers).to.be.calledWith('aQuery')
          expect(res.text).to.contain('user1')
          expect(res.text).not.to.contain('user2')
        })
    })
  })

  describe('GET /admin/roUsers/edit', () => {
    it('calls user service and shows user details', () => {
      const app = createApp({ userAdminServiceStub: userAdminService }, 'batchUser')
      return request(app)
        .get('/admin/roUsers/edit/1')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(userAdminService.getRoUser).to.be.calledOnce()
          expect(userAdminService.getRoUser).to.be.calledWith('1')
          expect(res.text).to.contain('value="user1"')
          expect(res.text).to.contain('value="d1"')
          expect(res.text).to.contain('value="f1"')
          expect(res.text).to.contain('value="l1"')
        })
    })
  })

  describe('POST /admin/roUsers/edit', () => {
    it('redirects back to page and does not call user service when missing delius id', () => {
      const app = createApp({ userAdminServiceStub: userAdminService }, 'batchUser')
      return request(app)
        .post('/admin/roUsers/edit/1')
        .send({ newNomisId: '1', deliusId: '', newDeliusId: '', first: 'f', last: 'l' })
        .expect(302)
        .expect('Location', '/admin/roUsers/edit/1')
        .expect(() => {
          expect(userAdminService.findRoUsers).not.to.be.calledOnce()
        })
    })

    it('calls user service and redirects to user list', () => {
      const app = createApp({ userAdminServiceStub: userAdminService }, 'batchUser')
      return request(app)
        .post('/admin/roUsers/edit/1')
        .send({ nomisId: '1n', originalDeliusId: 'd', deliusId: 'dn', first: 'f', last: 'l' })
        .expect(302)
        .expect('Location', '/admin/roUsers')
        .expect(() => {
          expect(userAdminService.updateRoUser).to.be.calledOnce()
          expect(userAdminService.updateRoUser).to.be.calledWith('token', '1', {
            originalDeliusId: 'd',
            first: 'f',
            last: 'l',
            deliusId: 'dn',
            nomisId: '1n',
          })
        })
    })

    it('Audits the edit user event', () => {
      const app = createApp({ userAdminServiceStub: userAdminService }, 'batchUser')
      return request(app)
        .post('/admin/roUsers/edit/1')
        .send({ nomisId: 'nid', deliusId: 'did' })
        .expect(302)
        .expect('Location', '/admin/roUsers')
        .expect(() => {
          expect(auditStub.record).to.be.calledOnce()
          expect(auditStub.record).to.be.calledWith('USER_MANAGEMENT', 'NOMIS_BATCHLOAD', {
            bookingId: undefined,
            path: '/admin/roUsers/edit/1',
            userInput: { nomisId: 'nid', deliusId: 'did' },
          })
        })
    })
  })

  describe('GET /admin/roUsers/delete', () => {
    it('calls user service and shows user details', () => {
      const app = createApp({ userAdminServiceStub: userAdminService }, 'batchUser')
      return request(app)
        .get('/admin/roUsers/delete/1')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(userAdminService.getRoUser).to.be.calledOnce()
          expect(userAdminService.getRoUser).to.be.calledWith('1')
          expect(res.text).to.contain('nomisId">user1')
          expect(res.text).to.contain('deliusId">d1')
          expect(res.text).to.contain('firstName">f1')
          expect(res.text).to.contain('lastName">l1')
        })
    })
  })

  describe('POST /admin/roUsers/delete', () => {
    it('calls user service and redirects to user list', () => {
      const app = createApp({ userAdminServiceStub: userAdminService }, 'batchUser')
      return request(app)
        .post('/admin/roUsers/delete/1')
        .send()
        .expect(302)
        .expect('Location', '/admin/roUsers')
        .expect(() => {
          expect(userAdminService.deleteRoUser).to.be.calledOnce()
          expect(userAdminService.deleteRoUser).to.be.calledWith('1')
        })
    })

    it('Audits the delete user event', () => {
      const app = createApp({ userAdminServiceStub: userAdminService }, 'batchUser')
      return request(app)
        .post('/admin/roUsers/delete/1')
        .expect(302)
        .expect('Location', '/admin/roUsers')
        .expect(() => {
          expect(auditStub.record).to.be.calledOnce()
          expect(auditStub.record).to.be.calledWith('USER_MANAGEMENT', 'NOMIS_BATCHLOAD', {
            bookingId: undefined,
            path: '/admin/roUsers/delete/1',
            userInput: {},
          })
        })
    })
  })

  describe('GET /admin/roUsers/add', () => {
    const app = createApp({ userAdminServiceStub: userAdminService }, 'batchUser')
    it('shows add user form', () => {
      return request(app)
        .get('/admin/roUsers/add/')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).to.contain('Add RO user')
        })
    })
  })

  describe('POST /admin/roUsers/add', () => {
    it('redirects back to page and does not call user service when missing nomis id', () => {
      const app = createApp({ userAdminServiceStub: userAdminService }, 'batchUser')
      return request(app)
        .post('/admin/roUsers/add/')
        .send({ newNomisId: '   ', newDeliusId: 'delius', first: 'first', last: 'last' })
        .expect(302)
        .expect('Location', '/admin/roUsers/add')
        .expect(() => {
          expect(userAdminService.addRoUser).not.to.be.calledOnce()
        })
    })

    it('redirects back to page and does not call user service when missing delius id', () => {
      const app = createApp({ userAdminServiceStub: userAdminService }, 'batchUser')
      return request(app)
        .post('/admin/roUsers/add/')
        .send({ newNomisId: 'nomisId', newDeliusId: '  ', first: 'first', last: 'last' })
        .expect(302)
        .expect('Location', '/admin/roUsers/add')
        .expect(() => {
          expect(userAdminService.addRoUser).not.to.be.calledOnce()
        })
    })

    it('calls user service and redirects to user list', () => {
      const app = createApp({ userAdminServiceStub: userAdminService }, 'batchUser')
      return request(app)
        .post('/admin/roUsers/add/')
        .send({ nomisId: 'nomisId', deliusId: 'deliusId', first: 'first', last: 'last' })
        .expect(302)
        .expect('Location', '/admin/roUsers')
        .expect(() => {
          expect(userAdminService.addRoUser).to.be.calledOnce()
          expect(userAdminService.addRoUser).to.be.calledWith('token', {
            deliusId: 'deliusId',
            first: 'first',
            last: 'last',
            nomisId: 'nomisId',
          })
        })
    })

    it('Audits the add user event', () => {
      const app = createApp({ userAdminServiceStub: userAdminService }, 'batchUser')
      return request(app)
        .post('/admin/roUsers/add/')
        .send({ nomisId: 'nid', deliusId: 'did' })
        .expect(302)
        .expect('Location', '/admin/roUsers')
        .expect(() => {
          expect(auditStub.record).to.be.calledOnce()
          expect(auditStub.record).to.be.calledWith('USER_MANAGEMENT', 'NOMIS_BATCHLOAD', {
            path: '/admin/roUsers/add/',
            bookingId: undefined,
            userInput: { nomisId: 'nid', deliusId: 'did' },
          })
        })
    })
  })

  describe('GET /admin/roUsers/verify', () => {
    it('calls nomis and returns JSON', () => {
      const app = createApp({ userAdminServiceStub: userAdminService }, 'batchUser')
      return request(app)
        .get('/admin/roUsers/verify?nomisUserName=USER_NAME')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(() => {
          expect(userAdminService.verifyUserDetails).to.be.calledOnce()
          expect(userAdminService.verifyUserDetails).to.be.calledWith('token', 'USER_NAME')
        })
    })

    it('should display the user details', () => {
      const app = createApp({ userAdminServiceStub: userAdminService }, 'batchUser')
      return request(app)
        .get('/admin/roUsers/verify?nomisUserName=USER_NAME')
        .expect(200)
        .expect(res => {
          expect(res.body.username).to.contain('nomisUser')
          expect(res.body.firstName).to.contain('nomisFirst')
          expect(res.body.lastName).to.contain('nomisLast')
        })
    })

    it('should give 404 when no match for user name', () => {
      userAdminService.verifyUserDetails.rejects()
      const app = createApp({ userAdminServiceStub: userAdminService }, 'batchUser')
      return request(app)
        .get('/admin/roUsers/verify?nomisUserName=USER_NAME')
        .expect(404)
        .expect('Content-Type', /json/)
    })

    it('should throw if submitted by non-authorised user', () => {
      const app = createApp({ userAdminServiceStub: userAdminService }, 'roUser')
      return request(app)
        .get('/admin/roUsers/verify?nomisUserName=USER_NAME')
        .expect(403)
    })
  })
})

function createApp({ licenceServiceStub, userAdminServiceStub }, user) {
  const prisonerService = createPrisonerServiceStub()
  const licenceService = licenceServiceStub || createLicenceServiceStub()
  const signInService = createSignInServiceStub()
  const userAdminService = userAdminServiceStub || createUserAdminServiceStub()

  const baseRouter = standardRouter({ licenceService, prisonerService, audit: auditStub, signInService })
  const route = baseRouter(createAdminRoute({ userAdminService }), {
    auditKey: 'USER_MANAGEMENT',
  })

  return appSetup(route, user, '/admin/roUsers/')
}
