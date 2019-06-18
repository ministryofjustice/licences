const pdfParse = require('pdf-parse')
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
  const formTemplateData = {
    OFF_NAME: 'Mark Andrews',
    OFF_NOMS: 'A5001DY',
    EST_PREMISE: 'HMP Albany',
    CREATION_DATE: '25th June 2019',
    SENT_HDCED: '23rd August 2019',
    SENT_CRD: '15th October 2019',
  }

  beforeEach(() => {
    licenceService = {
      getLicence: sinon.stub().resolves(licence),
    }
    prisonerService = {
      getPrisonerPersonalDetails: sinon.stub().resolves(prisoner),
    }
    formService = {
      getTemplateData: sinon.stub().resolves(formTemplateData),
    }
  })

  describe('/:templateName/:bookingId/', () => {
    it('calls formService', () => {
      app = createApp('caUser')

      return request(app)
        .get('/hdc/forms/eligible/1')
        .expect(200)
        .expect('Content-Type', 'application/pdf')
        .expect(res => {
          expect(Buffer.isBuffer(res.body)).to.equal(true)
        })
        .expect(() => {
          expect(formService.getTemplateData).to.be.calledOnce()
          expect(formService.getTemplateData).to.be.calledWith('eligible', licence.licence, prisoner)
        })
    })

    it('should throw if a non CA tries to access the page', () => {
      app = createApp('dmUser')

      return request(app)
        .get('/hdc/forms/eligible/1')
        .expect(403)
    })

    it('should throw if unknown form template name', () => {
      app = createApp('caUser')

      return request(app)
        .get('/hdc/forms/unknown/1')
        .expect(500)
    })

    it('Generates a PDF - hard to verify exactly but can at least check that some values appear in the output', async () => {
      app = createApp('caUser')

      const res = await request(app).get('/hdc/forms/eligible/1')

      const pdf = await pdfParse(res.body)
      const pdfText = pdf.text.replace(/([\t\n])/gm, ' ') // The extracted PDF text has newline and tab characters

      expect(pdfText).to.contain('Home detention curfew (tagging): eligible')
      expect(pdfText).to.contain('Name: Mark Andrews')
      expect(pdfText).to.contain('Location: HMP Albany')
      expect(pdfText).to.contain('Prison no: A5001DY')
      expect(pdfText).to.contain('Mark Andrews You are eligible for early release')
      expect(pdfText).to.contain('you could be released from prison on 23rd August 2019')
    })
  })

  describe('/forms/:bookingId/', () => {
    it('should throw if a non CA tries to access the page', () => {
      app = createApp('dmUser')

      return request(app)
        .get('/hdc/forms/1')
        .expect(403)
    })

    it('should list all forms with bookingId', () => {
      app = createApp('caUser')

      return request(app)
        .get('/hdc/forms/1')
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).to.contain('href="/hdc/forms/eligible/1')
          expect(res.text).to.contain('href="/hdc/forms/approved/1')
          expect(res.text).to.contain('href="/hdc/forms/refused/1')
        })
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
