const request = require('supertest')
const { appSetup, authenticationMiddleware, createSignInServiceStub } = require('../supertestSetup')
const standardRouter = require('../../server/routes/routeWorkers/standardRouter')
const createRoute = require('../../server/routes/forms')

describe('/forms/', () => {
  let licenceService
  let prisonerService
  let formService

  let app

  const prisoner = {}
  const licence = { licence: {}, stage: 'DECIDED' }

  beforeEach(() => {
    licenceService = {
      getLicence: sinon.stub().resolves(licence),
    }
    prisonerService = {
      getPrisonerPersonalDetails: sinon.stub().resolves(prisoner),
    }
    formService = {
      generatePdf: sinon.stub().resolves(),
    }
  })

  describe('/:templateName/:bookingId/', () => {
    it('calls formService', () => {
      app = createApp('caUser')

      return request(app)
        .get('/hdc/forms/templateName/1')
        .expect(200)
        .expect('Content-Type', 'application/pdf')
        .expect(() => {
          expect(formService.generatePdf).to.be.calledOnce()
          expect(formService.generatePdf).to.be.calledWith('templateName', licence.licence, prisoner)
        })
    })

    it('should throw if a non CA tries to access the page', () => {
      app = createApp('dmUser')

      return request(app)
        .get('/hdc/forms/templateName/1')
        .expect(403)
    })
  })

  function createApp(user) {
    const signInService = createSignInServiceStub()
    const baseRouter = standardRouter({
      licenceService,
      prisonerService,
      authenticationMiddleware,
      signInService,
    })
    const route = baseRouter(createRoute({ formService }))
    return appSetup(route, user, '/hdc/forms')
  }
})
