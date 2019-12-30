const request = require('supertest')

const {
  auditStub,
  authenticationMiddleware,
  createPrisonerServiceStub,
  createLicenceServiceStub,
  users,
  appSetup,
} = require('../supertestSetup')

const standardRouter = require('../../server/routes/routeWorkers/standardRouter')
const createRoute = require('../../server/routes/user')

describe('/user', () => {
  let userService

  beforeEach(() => {
    userService = {
      getAllRoles: jest.fn().mockReturnValue(['CA', 'RO']),
      getAllCaseLoads: jest
        .fn()
        .mockResolvedValue([{ caseLoadId: '1', description: 'a' }, { caseLoadId: '2', description: 'b' }]),
      setRole: jest.fn().mockReturnValue(),
      setActiveCaseLoad: jest.fn().mockReturnValue(),
    }
    auditStub.record.mockReset()
  })

  describe('user page get', () => {
    test(`renders the /user page`, () => {
      const app = createApp({ userService }, 'caUser')
      return request(app)
        .get('/')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).toContain('Select role')
        })
    })

    test(`renders the role dropdown if user has multiple roles`, () => {
      const app = createApp({ userService }, 'caUser')
      return request(app)
        .get('/')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).toContain('<option value="CA"')
          expect(res.text).toContain('<option value="RO"')
        })
    })

    test(`renders the case load dropdown if user has multiple case loads`, () => {
      const app = createApp({ userService }, 'caUser')
      return request(app)
        .get('/')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).toContain('<option value="1"')
          expect(res.text).toContain('<option value="2"')
        })
    })

    test(`does not render the case load dropdown if user is admin role`, () => {
      const app = createApp({ userService }, 'batchUser')
      return request(app)
        .get('/')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).not.toContain('<option value="1"')
          expect(res.text).not.toContain('<option value="2"')
        })
    })
  })

  describe('user page post', () => {
    test(`calls setRole if role is different to that on user`, () => {
      const app = createApp({ userService }, 'caUser')
      return request(app)
        .post('/')
        .send({ role: 'RO' })
        .expect(302)
        .expect(() => {
          expect(userService.setRole).toHaveBeenCalled()
          expect(userService.setRole).toHaveBeenCalledWith('RO', expect.anything())
        })
    })

    test(`does not call setRole if role is the same as that on user`, () => {
      const app = createApp({ userService }, 'caUser')
      return request(app)
        .post('/')
        .send({ role: 'CA' })
        .expect(302)
        .expect(() => {
          expect(userService.setRole).not.toHaveBeenCalled()
        })
    })

    test(`calls setActiveCaseload if caseLoad is different to that on user`, () => {
      const app = createApp({ userService }, 'caUser')
      return request(app)
        .post('/')
        .send({ caseLoadId: 'caseLoadId2' })
        .expect(302)
        .expect(() => {
          expect(userService.setActiveCaseLoad).toHaveBeenCalled()
          expect(userService.setActiveCaseLoad).toHaveBeenCalledWith('caseLoadId2', users.caUser, 'token')
        })
    })

    test(`does not call setActiveCaseload if caseLoad is the same as that on user`, () => {
      const app = createApp({ userService }, 'caUser')
      return request(app)
        .post('/')
        .send({ caseLoadId: 'caseLoadId' })
        .expect(302)
        .expect(() => {
          expect(userService.setActiveCaseLoad).not.toHaveBeenCalled()
        })
    })

    test(`does not call setActiveCaseload if caseLoadId is missing`, () => {
      const app = createApp({ userService }, 'caUser')
      return request(app)
        .post('/')
        .send({ someOtherId: 'caseLoadId' })
        .expect(302)
        .expect(() => {
          expect(userService.setActiveCaseLoad).not.toHaveBeenCalled()
        })
    })

    test(`redirects to the /user page`, () => {
      const app = createApp({ userService }, 'caUser')
      return request(app)
        .post('/')
        .send({ role: 'RO' })
        .expect(302)
        .expect('Location', '/user')
    })
  })
})

function createApp({ userService }, user) {
  const prisonerService = createPrisonerServiceStub()
  const licenceService = createLicenceServiceStub()

  const baseRouter = standardRouter({ licenceService, prisonerService, authenticationMiddleware, audit: auditStub })
  const route = baseRouter(createRoute({ userService }))

  return appSetup(route, user)
}
