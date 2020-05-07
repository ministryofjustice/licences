const request = require('supertest')
const { mockAudit } = require('../../mockClients')
const { startRoute } = require('../../supertestSetup')
const { createUserAdminServiceStub } = require('../../mockServices')
const createAdminRoute = require('../../../server/routes/admin/users')

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
    userAdminService = createUserAdminServiceStub()

    userAdminService.findRoUsers.mockReset()
    userAdminService.getRoUsers.mockReset()
    userAdminService.getRoUser.mockReset()

    userAdminService.getRoUsers.mockResolvedValue([user1, user2])
    userAdminService.findRoUsers.mockResolvedValue([user1])
    userAdminService.getRoUser.mockResolvedValue(user1)

    userAdminService.verifyUserDetails.mockResolvedValue({
      username: 'nomisUser',
      firstName: 'nomisFirst',
      lastName: 'nomisLast',
    })
  })

  const createApp = (user, audit = mockAudit()) =>
    startRoute(createAdminRoute({ userAdminService }), '/admin/roUsers', user, 'USER_MANAGEMENT', null, audit)

  describe('GET /admin/roUsers', () => {
    test('calls user service and renders HTML output', () => {
      const app = createApp('batchUser')
      return request(app)
        .get('/admin/roUsers')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(() => {
          expect(userAdminService.getRoUsers).toHaveBeenCalled()
        })
    })

    test('should display the user details', () => {
      const app = createApp('batchUser')
      return request(app)
        .get('/admin/roUsers')
        .expect(200)
        .expect((res) => {
          expect(res.text).toContain('user1')
          expect(res.text).toContain('user2')
        })
    })

    test('should throw if submitted by non-authorised user', () => {
      const app = createApp('roUser')
      return request(app).get('/admin/roUsers').expect(403)
    })
  })

  describe('POST /admin/roUsers', () => {
    describe('Invalid inputs', () => {
      const examples = ['', ' ', '            ', null]

      examples.forEach((example) => {
        test('redirects back to page and does not call user service when no search term', () => {
          const app = createApp('batchUser')
          return request(app)
            .post('/admin/roUsers')
            .send({ searchTerm: example })
            .expect(302)
            .expect(() => {
              expect(userAdminService.findRoUsers).not.toHaveBeenCalled()
            })
        })
      })
    })

    describe('Invalid inputs', () => {
      const examples = ['a valid query', ';DROP TABLE LICENCES', '*', '%', '22', '----------']

      examples.forEach((example) => {
        test('calls user service and renders HTML output', () => {
          const app = createApp('batchUser')
          return request(app)
            .post('/admin/roUsers')
            .send({ searchTerm: example })
            .expect(200)
            .expect('Content-Type', /html/)
            .expect((res) => {
              expect(userAdminService.findRoUsers).toHaveBeenCalled()
              expect(userAdminService.findRoUsers).toHaveBeenCalledWith(example)
              expect(res.text).toContain('user1')
              expect(res.text).not.toContain('user2')
            })
        })
      })
    })
  })

  describe('GET /admin/roUsers/edit', () => {
    test('calls user service and shows user details', () => {
      const app = createApp('batchUser')
      return request(app)
        .get('/admin/roUsers/edit/1')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(userAdminService.getRoUser).toHaveBeenCalled()
          expect(userAdminService.getRoUser).toHaveBeenCalledWith('1')
          expect(res.text).toContain('value="user1"')
          expect(res.text).toContain('value="d1"')
          expect(res.text).toContain('value="f1"')
          expect(res.text).toContain('value="l1"')
        })
    })
  })

  describe('POST /admin/roUsers/edit', () => {
    describe('Invalid inputs', () => {
      const examples = [
        {
          input: { newNomisId: '1', deliusId: '', newDeliusId: '', first: 'f', last: 'l' },
          reason: 'missing delius id',
        },
      ]

      examples.forEach((example) => {
        test(`redirects back to page and does not call user service when ${example.reason}`, () => {
          const app = createApp('batchUser')
          return request(app)
            .post('/admin/roUsers/edit/1')
            .send(example.input)
            .expect(302)
            .expect('Location', '/admin/roUsers/edit/1')
            .expect(() => {
              expect(userAdminService.findRoUsers).not.toHaveBeenCalled()
            })
        })
      })
    })

    describe('Valid inputs', () => {
      const examples = [
        { nomisId: '1n', originalDeliusId: 'd', deliusId: 'dn', first: 'f', last: 'l' },
        { nomisId: '&%^%', originalDeliusId: '------', deliusId: '2222', first: '@@@@', last: 'l        %' },
        { nomisId: 'nid', deliusId: 'did' },
      ]

      examples.forEach((example) => {
        test('calls user service and redirects to user list', () => {
          const app = createApp('batchUser')
          return request(app)
            .post('/admin/roUsers/edit/1')
            .send(example)
            .expect(302)
            .expect('Location', '/admin/roUsers')
            .expect(() => {
              expect(userAdminService.updateRoUser).toHaveBeenCalled()
              expect(userAdminService.updateRoUser).toHaveBeenCalledWith('token', '1', example)
            })
        })

        test('Audits the edit user event', () => {
          const audit = mockAudit()
          const app = createApp('batchUser', audit)
          return request(app)
            .post('/admin/roUsers/edit/1')
            .send(example)
            .expect(302)
            .expect('Location', '/admin/roUsers')
            .expect(() => {
              expect(audit.record).toHaveBeenCalled()
              expect(audit.record).toHaveBeenCalledWith('USER_MANAGEMENT', 'NOMIS_BATCHLOAD', {
                bookingId: undefined,
                path: '/admin/roUsers/edit/1',
                userInput: example,
              })
            })
        })
      })
    })
  })

  describe('GET /admin/roUsers/delete', () => {
    test('calls user service and shows user details', () => {
      const app = createApp('batchUser')
      return request(app)
        .get('/admin/roUsers/delete/1')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(userAdminService.getRoUser).toHaveBeenCalled()
          expect(userAdminService.getRoUser).toHaveBeenCalledWith('1')
          expect(res.text).toContain('nomisId">user1')
          expect(res.text).toContain('deliusId">d1')
          expect(res.text).toContain('firstName">f1')
          expect(res.text).toContain('lastName">l1')
        })
    })
  })

  describe('POST /admin/roUsers/delete', () => {
    test('calls user service and redirects to user list', () => {
      const app = createApp('batchUser')
      return request(app)
        .post('/admin/roUsers/delete/1')
        .send()
        .expect(302)
        .expect('Location', '/admin/roUsers')
        .expect(() => {
          expect(userAdminService.deleteRoUser).toHaveBeenCalled()
          expect(userAdminService.deleteRoUser).toHaveBeenCalledWith('1')
        })
    })

    test('Audits the delete user event', () => {
      const audit = mockAudit()
      const app = createApp('batchUser', audit)
      return request(app)
        .post('/admin/roUsers/delete/1')
        .expect(302)
        .expect('Location', '/admin/roUsers')
        .expect(() => {
          expect(audit.record).toHaveBeenCalled()
          expect(audit.record).toHaveBeenCalledWith('USER_MANAGEMENT', 'NOMIS_BATCHLOAD', {
            bookingId: undefined,
            path: '/admin/roUsers/delete/1',
            userInput: {},
          })
        })
    })
  })

  describe('POST /admin/roUsers/add', () => {
    describe('Invalid inputs', () => {
      const examples = [
        {
          input: { newNomisId: '   ', newDeliusId: 'delius', first: 'first', last: 'last' },
          reason: 'missing nomis id',
        },
        {
          input: { newNomisId: 'nomisId', newDeliusId: '  ', first: 'first', last: 'last' },
          reason: 'missing delius id',
        },
        {
          input: {},
          reason: 'missing all',
        },
      ]

      examples.forEach((example) => {
        test(`redirects back to page and does not call user service when ${example.reason}`, () => {
          const app = createApp('batchUser')
          return request(app)
            .post('/admin/roUsers/add/')
            .send(example.input)
            .expect(302)
            .expect('Location', '/admin/roUsers/add')
            .expect(() => {
              expect(userAdminService.addRoUser).not.toHaveBeenCalled()
            })
        })
      })
    })

    describe('Valid inputs', () => {
      const examples = [
        { nomisId: 'nomisId', deliusId: 'deliusId', first: 'first', last: 'last' },
        { nomisId: 'nid', deliusId: 'did' },
        { nomisId: '&%^%', deliusId: '2222', first: '@@@@', last: 'l        %' },
      ]

      examples.forEach((example) => {
        test('calls user service and redirects to user list', () => {
          const app = createApp('batchUser')
          return request(app)
            .post('/admin/roUsers/add/')
            .send(example)
            .expect(302)
            .expect('Location', '/admin/roUsers')
            .expect(() => {
              expect(userAdminService.addRoUser).toHaveBeenCalled()
              expect(userAdminService.addRoUser).toHaveBeenCalledWith('token', example)
            })
        })

        test('Audits the add user event', () => {
          const audit = mockAudit()
          const app = createApp('batchUser', audit)

          return request(app)
            .post('/admin/roUsers/add/')
            .send(example)
            .expect(302)
            .expect('Location', '/admin/roUsers')
            .expect(() => {
              expect(audit.record).toHaveBeenCalled()
              expect(audit.record).toHaveBeenCalledWith('USER_MANAGEMENT', 'NOMIS_BATCHLOAD', {
                bookingId: undefined,
                path: '/admin/roUsers/add/',
                userInput: example,
              })
            })
        })
      })
    })
  })

  describe('GET /admin/roUsers/verify', () => {
    test('calls nomis and returns JSON', () => {
      const app = createApp('batchUser')
      return request(app)
        .get('/admin/roUsers/verify?nomisUserName=USER_NAME')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(() => {
          expect(userAdminService.verifyUserDetails).toHaveBeenCalled()
          expect(userAdminService.verifyUserDetails).toHaveBeenCalledWith('token', 'USER_NAME')
        })
    })

    test('should display the user details', () => {
      const app = createApp('batchUser')
      return request(app)
        .get('/admin/roUsers/verify?nomisUserName=USER_NAME')
        .expect(200)
        .expect((res) => {
          expect(res.body.username).toContain('nomisUser')
          expect(res.body.firstName).toContain('nomisFirst')
          expect(res.body.lastName).toContain('nomisLast')
        })
    })

    test('should give 404 when no match for user name', () => {
      userAdminService.verifyUserDetails.mockRejectedValue()
      const app = createApp('batchUser')
      return request(app)
        .get('/admin/roUsers/verify?nomisUserName=USER_NAME')
        .expect(404)
        .expect('Content-Type', /json/)
    })

    test('should throw if submitted by non-authorised user', () => {
      const app = createApp('roUser')
      return request(app).get('/admin/roUsers/verify?nomisUserName=USER_NAME').expect(403)
    })
  })
})
