const request = require('supertest')

const {
  createPrisonerServiceStub,
  createLicenceServiceStub,
  appSetup,
  auditStub,
  createSignInServiceStub,
} = require('../supertestSetup')

const standardRouter = require('../../server/routes/routeWorkers/standardRouter')
const createContactRoute = require('../../server/routes/contact')

let app

describe('/contact', () => {
  let userAdminService
  let roService

  beforeEach(() => {
    roService = {
      findResponsibleOfficer: sinon.stub().resolves({
        deliusId: 'DELIUS_ID',
        lduCode: 'ABC123',
        lduDescription: 'LDU Description',
        name: 'Ro Name',
        probationAreaDescription: 'PA Description',
        probationAreaCode: 'PA_CODE',
      }),
    }

    userAdminService = {
      getRoUserByDeliusId: sinon.stub().resolves(undefined),
      getFunctionalMailbox: sinon.stub().resolves('abc@def.com'),
    }

    app = createApp({ userAdminService, roService }, 'caUser')
  })

  describe('GET /contact/:bookingId', () => {
    it('calls user service and returns html', () => {
      return request(app)
        .get('/contact/123456')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(() => {
          expect(roService.findResponsibleOfficer).to.be.calledOnce()
          expect(roService.findResponsibleOfficer).to.be.calledWith('123456')
          expect(userAdminService.getRoUserByDeliusId).to.be.calledOnce()
          expect(userAdminService.getRoUserByDeliusId).to.be.calledWith('DELIUS_ID')
          expect(userAdminService.getFunctionalMailbox).to.be.calledOnce('ABC123')
        })
    })

    it('should display RO details (from delius)', () => {
      return request(app)
        .get('/contact/123456')
        .expect(200)
        .expect(res => {
          expect(res.text).to.contain('ABC123')
          expect(res.text).to.contain('LDU Description')
          expect(res.text).to.contain('Ro Name')
          expect(res.text).to.contain('PA Description')
          expect(res.text).to.contain('PA_CODE')
          expect(res.text).to.contain('abc@def.com')
        })
    })

    it('should display RO details (from local store)', () => {
      userAdminService.getRoUserByDeliusId.resolves({
        first: 'first',
        last: 'last',
        jobRole: 'JR',
        email: 'ro@email.com',
        telephone: '01234567890',
        organisation: 'The Org',
        orgEmail: 'org@email.com',
      })

      return request(app)
        .get('/contact/123456')
        .expect(200)
        .expect(res => {
          expect(res.text).to.contain('first last')
          expect(res.text).to.contain('JR')
          expect(res.text).to.contain('ro@email.com')
          expect(res.text).to.contain('The Org')
          expect(res.text).to.contain('org@email.com')
        })
    })
  })
})

function createApp({ userAdminService, roService }, user) {
  const prisonerService = createPrisonerServiceStub()
  const licenceService = createLicenceServiceStub()
  const signInService = createSignInServiceStub()

  const baseRouter = standardRouter({ licenceService, prisonerService, audit: auditStub, signInService })
  const route = baseRouter(createContactRoute(userAdminService, roService))

  return appSetup(route, user, '/contact/')
}
