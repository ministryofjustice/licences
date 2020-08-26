const request = require('supertest')
const pdfParse = require('pdf-parse')
const { mockAudit } = require('../mockClients')
const { appSetup } = require('../supertestSetup')

const {
  createPdfServiceStub,
  createPrisonerServiceStub,
  createLicenceServiceStub,
  createSignInServiceStub,
} = require('../mockServices')

const standardRouter = require('../../server/routes/routeWorkers/standardRouter')
const createPdfRouter = require('../../server/routes/pdf')
const NullTokenVerifier = require('../../server/authentication/tokenverifier/NullTokenVerifier')

const valuesWithMissing = {
  values: {
    OFF_NAME: 'FIRST LAST',
  },
  missing: {
    firstNight: { mandatoryPreRelease: { CURFEW_FIRST_FROM: 'Curfew first night from' } },
    reporting: { mandatory: { REPORTING_AT: 'reporting date' } },
    sentence: { mandatory: { OFF_NOMS: 'noms id' } },
    varyApproval: { mandatoryPostRelease: { VARY_APPROVER: 'Name of approver' } },
  },
}

const valuesWithCurfewFirstNightMissing = {
  values: {
    OFF_NAME: 'FIRST LAST',
  },
  missing: {
    firstNight: { mandatoryPreRelease: { CURFEW_FIRST_FROM: 'Curfew first night from' } },
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
  const audit = mockAudit()

  let app

  beforeEach(() => {
    app = createApp({ licenceServiceStub, pdfServiceStub, prisonerServiceStub, audit }, 'caUser')
    pdfServiceStub.getPdfLicenceData.mockReset()
    pdfServiceStub.updateLicenceType.mockReset()
    pdfServiceStub.checkAndTakeSnapshot.mockReset()
    licenceServiceStub.getLicence.mockResolvedValue({
      licence: { key: 'value', document: { template: { decision: 'hdc_ap_pss' } } },
    })
    prisonerServiceStub.getPrisonerPersonalDetails.mockResolvedValue({ agencyLocationId: 'somewhere' })
  })

  describe('GET /selectLicenceType', () => {
    test('renders dropdown containing licence types', () => {
      licenceServiceStub.getLicence.mockReset()
      licenceServiceStub.getLicence.mockResolvedValue({ licence: { key: 'value' } })

      return request(app)
        .get('/hdc/pdf/selectLicenceType/123')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('<input id="hdc_ap" type="radio" name="licenceTypeRadio" value="hdc_ap">')
          expect(res.text).toContain('<input id="hdc_ap_pss" type="radio" name="licenceTypeRadio" value="hdc_ap_pss">')
          expect(res.text).toContain('<input id="hdc_yn" type="radio" name="licenceTypeRadio" value="hdc_yn">')
          expect(res.text).toContain('<input id="hdc_pss" type="radio" name="licenceTypeRadio" value="hdc_pss">')
        })
    })

    test('defaults to type used in last version', () => {
      licenceServiceStub.getLicence.mockResolvedValue({
        approvedVersionDetails: { template: 'hdc_ap' },
        licence: { document: { template: { decision: 'hdc_ap', offenceCommittedBeforeFeb2015: 'Yes' } } },
      })

      return request(app)
        .get('/hdc/pdf/selectLicenceType/123')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('<input id="hdc_ap" type="radio" name="licenceTypeRadio" value="hdc_ap" checked>')
          expect(res.text).toContain('<input id="hdc_ap_pss" type="radio" name="licenceTypeRadio" value="hdc_ap_pss">')
          expect(res.text).toContain('<input id="hdc_yn" type="radio" name="licenceTypeRadio" value="hdc_yn">')
          expect(res.text).toContain('<input id="hdc_pss" type="radio" name="licenceTypeRadio" value="hdc_pss">')
        })
    })

    test('should throw if a non ca or ro tries to access the page', () => {
      app = createApp({}, 'dmUser')

      licenceServiceStub.getLicence.mockResolvedValue({ approvedVersionDetails: { template: 'hdc_ap' } })

      return request(app).get('/hdc/pdf/selectLicenceType/123').expect(403)
    })
  })

  describe('POST /selectLicenceType', () => {
    test('redirects to the page of the selected pdf', () => {
      return request(app)
        .post('/hdc/pdf/selectLicenceType/123')
        .send({ offenceBeforeCutoff: 'Yes', licenceTypeRadio: 'hdc_ap_pss' })
        .expect(302)
        .expect('Location', '/hdc/pdf/taskList/123')
    })

    test('redirects back to the select page if nothing selected', () => {
      return request(app)
        .post('/hdc/pdf/selectLicenceType/123')
        .send({ decision: '' })
        .expect(302)
        .expect('Location', '/hdc/pdf/selectLicenceType/123')
    })

    test('should throw if a non ca or ro tries to post to the route', () => {
      app = createApp({}, 'dmUser')

      return request(app).post('/hdc/pdf/selectLicenceType/123').send({ decision: '' }).expect(403)
    })
  })

  describe('GET /taskList', () => {
    test('Shows incomplete status on each task with missing data', () => {
      pdfServiceStub.getPdfLicenceData.mockResolvedValue(valuesWithMissing)

      return request(app)
        .get('/hdc/pdf/taskList/1231')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('id="firstNightTaskStatus">Not complete')
          expect(res.text).toContain('id="reportingTaskStatus">Not complete')
          expect(res.text).toContain('id="sentenceTaskStatus">Not complete')
          expect(res.text).not.toContain('id="varApprovalTaskStatus">')
          expect(pdfServiceStub.getPdfLicenceData).toHaveBeenCalled()
          expect(pdfServiceStub.getPdfLicenceData).toHaveBeenCalledWith(
            '1231',
            { licence: { key: 'value', document: { template: { decision: 'hdc_ap_pss' } } } },
            'token'
          )
        })
    })

    test('Shows incomplete status on var approver task when post approval', () => {
      prisonerServiceStub.getPrisonerPersonalDetails.mockResolvedValue({ agencyLocationId: 'out' })
      pdfServiceStub.getPdfLicenceData.mockResolvedValue(valuesWithMissing)

      return request(app)
        .get('/hdc/pdf/taskList/1232')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).not.toContain('id="firstNightTaskStatus">Not complete')
          expect(res.text).not.toContain('id="reportingTaskStatus">Not complete')
          expect(res.text).toContain('id="sentenceTaskStatus">Not complete')
          expect(res.text).toContain('id="varApprovalTaskStatus">Not complete')
          expect(pdfServiceStub.getPdfLicenceData).toHaveBeenCalled()
          expect(pdfServiceStub.getPdfLicenceData).toHaveBeenCalledWith(
            '1232',
            { licence: { key: 'value', document: { template: { decision: 'hdc_ap_pss' } } } },
            'token'
          )
        })
    })

    test('Does not allow print when missing values', () => {
      pdfServiceStub.getPdfLicenceData.mockResolvedValue(valuesWithMissing)

      return request(app)
        .get('/hdc/pdf/taskList/1233')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).not.toContain('Ready to create')
          expect(pdfServiceStub.getPdfLicenceData).toHaveBeenCalled()
          expect(pdfServiceStub.getPdfLicenceData).toHaveBeenCalledWith(
            '1233',
            { licence: { key: 'value', document: { template: { decision: 'hdc_ap_pss' } } } },
            'token'
          )
        })
    })

    test('Allows print when missing values  are pre-release only for vary', () => {
      prisonerServiceStub.getPrisonerPersonalDetails.mockResolvedValue({ agencyLocationId: 'OUT' })
      pdfServiceStub.getPdfLicenceData.mockResolvedValue(valuesWithCurfewFirstNightMissing)

      return request(app)
        .get('/hdc/pdf/taskList/1233')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('Ready to print')
          expect(pdfServiceStub.getPdfLicenceData).toHaveBeenCalled()
          expect(pdfServiceStub.getPdfLicenceData).toHaveBeenCalledWith(
            '1233',
            { licence: { key: 'value', document: { template: { decision: 'hdc_ap_pss' } } } },
            'token'
          )
        })
    })

    test('Shows template version info - same version when same template', () => {
      pdfServiceStub.getPdfLicenceData.mockResolvedValue(valuesWithoutMissing)

      licenceServiceStub.getLicence.mockResolvedValue({
        versionDetails: { version: 1 },
        approvedVersionDetails: { template: 'hdc_ap', version: 1, timestamp: '11/12/13' },
        licence: { document: { template: { decision: 'hdc_ap' } } },
      })

      return request(app)
        .get('/hdc/pdf/taskList/1234')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('Ready to print')
          expect(res.text).toContain('11/12/13')
          expect(res.text).toContain('Basic licence')
          expect(res.text).toContain('Version 1')
        })
    })

    test('Shows template version info - new version when new template', () => {
      pdfServiceStub.getPdfLicenceData.mockResolvedValue(valuesWithoutMissing)

      licenceServiceStub.getLicence.mockResolvedValue({
        version: 2,
        versionDetails: { version: 1, vary_version: 0 },
        approvedVersionDetails: { template: 'hdc_ap', version: 1, vary_version: 0, timestamp: '11/12/13' },
        licence: { document: { template: { decision: 'hdc_ap_pss' } } },
      })

      return request(app)
        .get('/hdc/pdf/taskList/1235')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('Ready to print new version')
          expect(res.text).toContain('Basic licence with top-up supervision')
          expect(res.text).toContain('11/12/13')
          expect(res.text).toContain('Basic licence')
          expect(res.text).toContain('Version 1.0')
        })
    })

    test('Shows template version info - new version when modified licence version', () => {
      pdfServiceStub.getPdfLicenceData.mockResolvedValue(valuesWithoutMissing)

      licenceServiceStub.getLicence.mockResolvedValue({
        version: 3.2,
        versionDetails: { version: 2, vary_version: 0 },
        approvedVersionDetails: { template: 'hdc_ap', version: 1, vary_version: 1, timestamp: '11/12/13' },
        licence: { document: { template: { decision: 'hdc_ap' } } },
      })

      return request(app)
        .get('/hdc/pdf/taskList/1236')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('Ready to print new version')
          expect(res.text).toContain('11/12/13')
          expect(res.text).toContain('Basic licence')
          expect(res.text).toContain('Version 1.1')
        })
    })

    test('should throw if a non ca or ro tries to access the taskList', () => {
      app = createApp({}, 'dmUser')

      pdfServiceStub.getPdfLicenceData.mockResolvedValue(valuesWithoutMissing)

      licenceServiceStub.getLicence.mockResolvedValue({
        version: 2,
        approvedVersionDetails: { template: 'hdc_ap', version: 1, timestamp: '11/12/13' },
      })

      return request(app).get('/hdc/pdf/taskList/1237').expect(403)
    })
  })

  describe('local PDF creation', () => {
    test('Gets pdf data and renders response as PDF', async () => {
      const rawLicence = {
        licence: { key: 'value', document: { template: { decision: 'hdc_ap' } } },
        version: '1.0',
        versionDetails: { version: 1, vary_version: 0 },
        approvedVersionDetails: { version: 1, vary_version: 0 },
      }
      licenceServiceStub.getLicence.mockReset()
      licenceServiceStub.getLicence.mockResolvedValue(rawLicence)
      pdfServiceStub.getPdfLicenceData.mockResolvedValue({
        values: { OFF_NAME: 'NAME', OFF_NOMS: 'NOMS', OFF_DOB: 'DOB' },
      })
      pdfServiceStub.checkAndTakeSnapshot.mockResolvedValue(rawLicence)
      const res = await request(app).get('/hdc/pdf/create/123').expect(200).expect('Content-Type', 'application/pdf')

      expect(Buffer.isBuffer(res.body)).toBe(true)
      expect(pdfServiceStub.getPdfLicenceData).toHaveBeenCalled()
      expect(pdfServiceStub.getPdfLicenceData).toHaveBeenCalledWith('123', rawLicence, 'token')

      const pdf = await pdfParse(res.body)
      const pdfText = pdf.text.replace(/([\t\n])/gm, ' ') // The extracted PDF text has newline and tab characters

      // Just enough to verify that we made a PDF with some text and some licence data in it
      expect(pdfText).toContain('Name: NAMEPrison no: NOMSDate of Birth: DOB')
      expect(pdfText).toContain('Page 1 of 3 - Basic licence v1.0')
    })
  })

  describe('GET /create', () => {
    test('Calls pdf service and renders response as PDF', () => {
      pdfServiceStub.getPdfLicenceData.mockResolvedValue({ values: { OFF_NOMS: 'XX01234X' } })

      return request(app)
        .get('/hdc/pdf/create/123')
        .expect(200)
        .expect('Content-Type', 'application/pdf')
        .expect((res) => {
          expect(res.body.toString()).toContain('%PDF-1.4')
        })
    })

    test('Audits the PDF creation event', () => {
      pdfServiceStub.getPdfLicenceData.mockResolvedValue({ values: { OFF_NOMS: 'XX01234X' } })

      return request(app)
        .get('/hdc/pdf/create/123')
        .expect(200)
        .expect('Content-Type', 'application/pdf')
        .expect(() => {
          expect(audit.record).toHaveBeenCalled()
          expect(audit.record).toHaveBeenCalledWith('CREATE_PDF', 'CA_USER_TEST', {
            path: '/hdc/pdf/create/123',
            bookingId: '123',
            userInput: {},
          })
        })
    })

    test('should throw if a non ca or ro tries to create the pdf', () => {
      app = createApp({}, 'dmUser')

      return request(app).get('/hdc/pdf/create/123').expect(403)
    })
  })
})

function createApp(
  { licenceServiceStub = null, pdfServiceStub = null, prisonerServiceStub = null, audit = mockAudit() },
  user
) {
  const prisonerService = prisonerServiceStub || createPrisonerServiceStub()
  const licenceService = licenceServiceStub || createLicenceServiceStub()
  const signInService = createSignInServiceStub()

  const baseRouter = standardRouter({
    licenceService,
    prisonerService,
    audit,
    signInService,
    tokenVerifier: new NullTokenVerifier(),
    config: null,
  })
  const route = baseRouter(createPdfRouter({ pdfService: pdfServiceStub, prisonerService }), {
    auditKey: 'CREATE_PDF',
  })

  return appSetup(route, user, '/hdc/pdf/')
}
