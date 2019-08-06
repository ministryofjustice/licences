const request = require('supertest')
const pdfParse = require('pdf-parse')

const {
  createPdfServiceStub,
  appSetup,
  auditStub,
  createPrisonerServiceStub,
  createLicenceServiceStub,
  createSignInServiceStub,
} = require('../supertestSetup')

const standardRouter = require('../../server/routes/routeWorkers/standardRouter')
const createPdfRouter = require('../../server/routes/pdf')

const valuesWithMissing = {
  values: {
    OFF_NAME: 'FIRST LAST',
  },
  missing: {
    firstNight: { mandatory: { CURFEW_FIRST_FROM: 'Curfew first night from' } },
    reporting: { mandatory: { REPORTING_AT: 'reporting date' } },
    sentence: { mandatory: { OFF_NOMS: 'noms id' } },
    varyApproval: { mandatoryPostRelease: { VARY_APPROVER: 'Name of approver' } },
  },
}

const valuesWithoutMissing = {
  values: {
    OFF_NAME: 'FIRST LAST',
  },
  missing: {},
}

describe('PDF:', () => {
  const prisonerServiceStub = createPrisonerServiceStub()
  const licenceServiceStub = createLicenceServiceStub()
  const pdfServiceStub = createPdfServiceStub()

  let app

  beforeEach(() => {
    app = createApp({ licenceServiceStub, pdfServiceStub, prisonerServiceStub }, 'caUser')
    auditStub.record.reset()
    pdfServiceStub.getPdfLicenceData.reset()
    pdfServiceStub.getPdfLicenceDataAndUpdateLicenceType.reset()
    licenceServiceStub.getLicence.resolves({ licence: { key: 'value' } })
    prisonerServiceStub.getPrisonerPersonalDetails.resolves({ agencyLocationId: 'somewhere' })
  })

  describe('GET /selectLicenceType', () => {
    it('renders dropdown containing licence types', () => {
      return request(app)
        .get('/hdc/pdf/selectLicenceType/123')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).to.include('<input id="hdc_ap" type="radio" name="licenceTypeRadio" value="hdc_ap">')
          expect(res.text).to.include('<input id="hdc_ap_pss" type="radio" name="licenceTypeRadio" value="hdc_ap_pss">')
          expect(res.text).to.include('<input id="hdc_yn" type="radio" name="licenceTypeRadio" value="hdc_yn">')
          expect(res.text).to.include('<input id="hdc_pss" type="radio" name="licenceTypeRadio" value="hdc_pss">')
        })
    })

    it('defaults to type used in last version', () => {
      licenceServiceStub.getLicence.resolves({
        approvedVersionDetails: { template: 'hdc_ap' },
        licence: { document: { template: { decision: 'hdc_ap', offenceCommittedBeforeFeb2015: 'Yes' } } },
      })

      return request(app)
        .get('/hdc/pdf/selectLicenceType/123')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).to.include('<input id="hdc_ap" type="radio" name="licenceTypeRadio" value="hdc_ap" checked>')
          expect(res.text).to.include('<input id="hdc_ap_pss" type="radio" name="licenceTypeRadio" value="hdc_ap_pss">')
          expect(res.text).to.include('<input id="hdc_yn" type="radio" name="licenceTypeRadio" value="hdc_yn">')
          expect(res.text).to.include('<input id="hdc_pss" type="radio" name="licenceTypeRadio" value="hdc_pss">')
        })
    })

    it('should throw if a non ca or ro tries to access the page', () => {
      app = createApp({}, 'dmUser')

      licenceServiceStub.getLicence.resolves({ approvedVersionDetails: { template: 'hdc_ap' } })

      return request(app)
        .get('/hdc/pdf/selectLicenceType/123')
        .expect(403)
    })
  })

  describe('POST /selectLicenceType', () => {
    it('redirects to the page of the selected pdf', () => {
      return request(app)
        .post('/hdc/pdf/selectLicenceType/123')
        .send({ offenceBeforeCutoff: 'Yes', licenceTypeRadio: 'hdc_ap_pss' })
        .expect(302)
        .expect('Location', '/hdc/pdf/taskList/hdc_ap_pss/123')
    })

    it('redirects back to the select page if nothing selected', () => {
      return request(app)
        .post('/hdc/pdf/selectLicenceType/123')
        .send({ decision: '' })
        .expect(302)
        .expect('Location', '/hdc/pdf/selectLicenceType/123')
    })

    it('should throw if a non ca or ro tries to post to the route', () => {
      app = createApp({}, 'dmUser', '/hdc/pdf')

      return request(app)
        .post('/hdc/pdf/selectLicenceType/123')
        .send({ decision: '' })
        .expect(403)
    })
  })

  describe('GET /taskList', () => {
    it('Shows incomplete status on each task with missing data', () => {
      pdfServiceStub.getPdfLicenceDataAndUpdateLicenceType.resolves(valuesWithMissing)

      return request(app)
        .get('/hdc/pdf/taskList/hdc_ap_pss/1231')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).to.include('id="firstNightTaskStatus">Not complete')
          expect(res.text).to.include('id="reportingTaskStatus">Not complete')
          expect(res.text).to.include('id="sentenceTaskStatus">Not complete')
          expect(res.text).to.not.include('id="varApprovalTaskStatus">')
          expect(pdfServiceStub.getPdfLicenceDataAndUpdateLicenceType).to.be.calledOnce()
          expect(pdfServiceStub.getPdfLicenceDataAndUpdateLicenceType).to.be.calledWith(
            'hdc_ap_pss',
            undefined,
            '1231',
            { licence: { key: 'value' } },
            'token'
          )
        })
    })

    it('Shows incomplete status on var approver task when post approval', () => {
      prisonerServiceStub.getPrisonerPersonalDetails.resolves({ agencyLocationId: 'out' })
      pdfServiceStub.getPdfLicenceDataAndUpdateLicenceType.resolves(valuesWithMissing)

      return request(app)
        .get('/hdc/pdf/taskList/hdc_ap_pss/1232')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).to.include('id="firstNightTaskStatus">Not complete')
          expect(res.text).to.include('id="reportingTaskStatus">Not complete')
          expect(res.text).to.include('id="sentenceTaskStatus">Not complete')
          expect(res.text).to.include('id="varApprovalTaskStatus">Not complete')
          expect(pdfServiceStub.getPdfLicenceDataAndUpdateLicenceType).to.be.calledOnce()
          expect(pdfServiceStub.getPdfLicenceDataAndUpdateLicenceType).to.be.calledWith(
            'hdc_ap_pss',
            undefined,
            '1232',
            { licence: { key: 'value' } },
            'token'
          )
        })
    })

    it('Does not allow print when missing values', () => {
      pdfServiceStub.getPdfLicenceDataAndUpdateLicenceType.resolves(valuesWithMissing)

      return request(app)
        .get('/hdc/pdf/taskList/hdc_ap_pss/1233')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).not.to.include('Ready to create')
          expect(pdfServiceStub.getPdfLicenceDataAndUpdateLicenceType).to.be.calledOnce()
          expect(pdfServiceStub.getPdfLicenceDataAndUpdateLicenceType).to.be.calledWith(
            'hdc_ap_pss',
            undefined,
            '1233',
            { licence: { key: 'value' } },
            'token'
          )
        })
    })

    it('Shows template version info - same version when same template', () => {
      pdfServiceStub.getPdfLicenceDataAndUpdateLicenceType.resolves(valuesWithoutMissing)

      licenceServiceStub.getLicence.resolves({
        versionDetails: { version: 1 },
        approvedVersionDetails: { template: 'hdc_ap', version: 1, timestamp: '11/12/13' },
      })

      return request(app)
        .get('/hdc/pdf/taskList/hdc_ap/1234')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).to.include('Ready to print')
          expect(res.text).to.include('11/12/13')
          expect(res.text).to.include('Basic licence')
          expect(res.text).to.include('Version 1')
        })
    })

    it('Shows template version info - new version when new template', () => {
      pdfServiceStub.getPdfLicenceDataAndUpdateLicenceType.resolves(valuesWithoutMissing)

      licenceServiceStub.getLicence.resolves({
        version: 2,
        versionDetails: { version: 1, vary_version: 0 },
        approvedVersionDetails: { template: 'hdc_ap', version: 1, vary_version: 0, timestamp: '11/12/13' },
      })

      return request(app)
        .get('/hdc/pdf/taskList/hdc_ap_pss/1235')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).to.include('Ready to print new version')
          expect(res.text).to.include('Basic licence with top-up supervision')
          expect(res.text).to.include('11/12/13')
          expect(res.text).to.include('Basic licence')
          expect(res.text).to.include('Version 1.0')
        })
    })

    it('Shows template version info - new version when modified licence version', () => {
      pdfServiceStub.getPdfLicenceDataAndUpdateLicenceType.resolves(valuesWithoutMissing)

      licenceServiceStub.getLicence.resolves({
        version: 3.2,
        versionDetails: { version: 2, vary_version: 0 },
        approvedVersionDetails: { template: 'hdc_ap', version: 1, vary_version: 1, timestamp: '11/12/13' },
      })

      return request(app)
        .get('/hdc/pdf/taskList/hdc_ap/1236')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).to.include('Ready to print new version')
          expect(res.text).to.include('11/12/13')
          expect(res.text).to.include('Basic licence')
          expect(res.text).to.include('Version 1.1')
        })
    })

    it('should throw if a non ca or ro tries to access the taskList', () => {
      app = createApp({}, 'dmUser')

      pdfServiceStub.getPdfLicenceDataAndUpdateLicenceType.resolves(valuesWithoutMissing)

      licenceServiceStub.getLicence.resolves({
        version: 2,
        approvedVersionDetails: { template: 'hdc_ap', version: 1, timestamp: '11/12/13' },
      })

      return request(app)
        .get('/hdc/pdf/taskList/hdc_ap/1237')
        .expect(403)
    })
  })

  describe('local PDF creation', () => {
    it('Gets pdf data and renders response as PDF', async () => {
      pdfServiceStub.getPdfLicenceData.resolves({ values: { OFF_NAME: 'NAME', OFF_NOMS: 'NOMS', OFF_DOB: 'DOB' } })

      const res = await request(app)
        .get('/hdc/pdf/create/hdc_ap/123')
        .expect(200)
        .expect('Content-Type', 'application/pdf')

      expect(Buffer.isBuffer(res.body)).to.equal(true)
      expect(pdfServiceStub.getPdfLicenceData).to.be.calledOnce()
      expect(pdfServiceStub.getPdfLicenceData).to.be.calledWith(
        'hdc_ap',
        '123',
        { licence: { key: 'value' } },
        'token',
        false
      )

      const pdf = await pdfParse(res.body)
      const pdfText = pdf.text.replace(/([\t\n])/gm, ' ') // The extracted PDF text has newline and tab characters

      // Just enough to verify that we made a PDF with some text and some licence data in it
      expect(pdfText).to.contain('Name: NAMEPrison no: NOMSDate of Birth: DOB')
      expect(pdfText).to.contain('Page 1 of 3 - Basic licence v1.0')
    })
  })

  describe('GET /create', () => {
    it('Calls pdf service and renders response as PDF', () => {
      pdfServiceStub.getPdfLicenceData.resolves({ values: { OFF_NOMS: 'XX01234X' } })

      return request(app)
        .get('/hdc/pdf/create/hdc_ap/123')
        .expect(200)
        .expect('Content-Type', 'application/pdf')
        .expect(res => {
          expect(res.body.toString()).to.include('%PDF-1.4')
        })
    })

    it('Audits the PDF creation event', () => {
      pdfServiceStub.getPdfLicenceData.resolves({ values: { OFF_NOMS: 'XX01234X' } })

      return request(app)
        .get('/hdc/pdf/create/hdc_ap/123')
        .expect(200)
        .expect('Content-Type', 'application/pdf')
        .expect(() => {
          expect(auditStub.record).to.be.calledOnce()
          expect(auditStub.record).to.be.calledWith('CREATE_PDF', 'CA_USER_TEST', {
            path: '/hdc/pdf/create/hdc_ap/123',
            bookingId: '123',
            userInput: {},
          })
        })
    })

    it('should throw if a non ca or ro tries to create the pdf', () => {
      app = createApp({}, 'dmUser')

      return request(app)
        .get('/hdc/pdf/create/hdc_ap_pss/123')
        .expect(403)
    })
  })
})

function createApp({ licenceServiceStub, pdfServiceStub, prisonerServiceStub }, user) {
  const prisonerService = prisonerServiceStub || createPrisonerServiceStub()
  const licenceService = licenceServiceStub || createLicenceServiceStub()
  const signInService = createSignInServiceStub()

  const baseRouter = standardRouter({ licenceService, prisonerService, audit: auditStub, signInService })
  const route = baseRouter(createPdfRouter({ pdfService: pdfServiceStub, prisonerService }), {
    auditKey: 'CREATE_PDF',
  })

  return appSetup(route, user, '/hdc/pdf/')
}
