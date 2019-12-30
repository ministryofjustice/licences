const request = require('supertest')

const {
  createPrisonerServiceStub,
  createLicenceServiceStub,
  caseListServiceStub,
  appSetup,
  auditStub,
  createSignInServiceStub,
  createCaServiceStub,
} = require('../supertestSetup')

const standardRouter = require('../../server/routes/routeWorkers/standardRouter')
const createRoute = require('../../server/routes/taskList')

const prisonerInfoResponse = {
  bookingId: 1,
  facialImageId: 2,
  dateOfBirth: '23/12/1971',
  firstName: 'F',
  middleName: 'M',
  lastName: 'L',
  offenderNo: 'noms',
  aliases: 'Alias',
  assignedLivingUnitDesc: 'Loc',
  physicalAttributes: { gender: 'Male' },
  imageId: 'imgId',
  captureDate: '23/11/1971',
  sentenceExpiryDate: '03/12/1985',
  sentenceDetail: {
    effectiveAutomaticReleaseDate: '01/01/2001',
  },
}

describe('GET /taskList/:prisonNumber', () => {
  let prisonerService
  let licenceService
  let caService

  beforeEach(() => {
    licenceService = createLicenceServiceStub()
    prisonerService = createPrisonerServiceStub()
    prisonerService.getPrisonerDetails = jest.fn().mockResolvedValue(prisonerInfoResponse)
    caService = createCaServiceStub
  })

  describe('User is CA', () => {
    test('should call caService.getReasonForNotContinuing', async () => {
      licenceService.getLicence.mockResolvedValue({ stage: 'ELIGIBILITY', licence: { anyKey: 1 } })

      const app = createApp({
        licenceServiceStub: licenceService,
        prisonerServiceStub: prisonerService,
        caServiceStub: caService,
      })

      return request(app)
        .get('/taskList/123')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(() => {
          expect(caService.getReasonForNotContinuing).toHaveBeenCalled()
        })
    })

    test('should return error message for NO_OFFENDER_NUMBER', async () => {
      licenceService.getLicence.mockResolvedValue({ stage: 'ELIGIBILITY', licence: { anyKey: 1 } })
      caService.getReasonForNotContinuing.mockResolvedValue(['NO_OFFENDER_NUMBER'])

      const app = createApp({
        licenceServiceStub: licenceService,
        prisonerServiceStub: prisonerService,
        caServiceStub: caService,
      })

      return request(app)
        .get('/taskList/123')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).toContain('Offender number required but it is not entered in Delius')
        })
    })

    test('should return error message for NO_COM_ASSIGNED', async () => {
      licenceService.getLicence.mockResolvedValue({ stage: 'ELIGIBILITY', licence: { anyKey: 1 } })
      caService.getReasonForNotContinuing.mockResolvedValue(['NO_COM_ASSIGNED'])

      const app = createApp({
        licenceServiceStub: licenceService,
        prisonerServiceStub: prisonerService,
        caServiceStub: caService,
      })

      return request(app)
        .get('/taskList/123')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).toContain('A Community Offender Manager has not been assigned')
        })
    })

    test('should return error messages for LDU_INACTIVE plus COM_NOT_ALLOCATED', async () => {
      licenceService.getLicence.mockResolvedValue({ stage: 'ELIGIBILITY', licence: { anyKey: 1 } })
      const errors = ['LDU_INACTIVE', 'COM_NOT_ALLOCATED']
      caService.getReasonForNotContinuing.mockResolvedValue(errors)

      const app = createApp({
        licenceServiceStub: licenceService,
        prisonerServiceStub: prisonerService,
        caServiceStub: caService,
      })

      return request(app)
        .get('/taskList/123')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).toContain(
            'The Local Delivery Unit is in a geographical area that is currently inactive. Please refer via Nomis'
          )
          expect(res.text).toContain('The Community Offender Manager (COM) assigned is a pseudo.')
        })
    })

    test('should disable the Start now button if there is an error', async () => {
      licenceService.getLicence.mockResolvedValue({ stage: 'ELIGIBILITY', licence: { anyKey: 1 } })
      caService.getReasonForNotContinuing.mockResolvedValue(['LDU_INACTIVE'])

      const app = createApp({
        licenceServiceStub: licenceService,
        prisonerServiceStub: prisonerService,
        caServiceStub: caService,
      })

      return request(app)
        .get('/taskList/123')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).toContain('button-disabled')
        })
    })

    test('should NOT disable the Start now button if there are no errors', async () => {
      licenceService.getLicence.mockResolvedValue({ stage: 'ELIGIBILITY', licence: { anyKey: 1 } })
      caService.getReasonForNotContinuing.mockResolvedValue([])

      const app = createApp({
        licenceServiceStub: licenceService,
        prisonerServiceStub: prisonerService,
        caServiceStub: caService,
      })

      return request(app)
        .get('/taskList/123')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).not.toContain('button-disabled')
        })
    })

    test('should call getPrisonerDetails from prisonerDetailsService', () => {
      licenceService.getLicence.mockResolvedValue({ stage: 'ELIGIBILITY', licence: {} })
      const app = createApp({
        licenceServiceStub: licenceService,
        prisonerServiceStub: prisonerService,
        caServiceStub: caService,
      })
      return request(app)
        .get('/taskList/123')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(() => {
          expect(prisonerService.getPrisonerDetails).toHaveBeenCalled()
          expect(prisonerService.getPrisonerDetails).toHaveBeenCalledWith('123', 'token')
        })
    })

    test('should should show ARD if no CRD', () => {
      licenceService.getLicence.mockResolvedValue({ stage: 'ELIGIBILITY', licence: {} })
      const app = createApp({
        licenceServiceStub: licenceService,
        prisonerServiceStub: prisonerService,
        caServiceStub: caService,
      })
      return request(app)
        .get('/taskList/123')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).toEqual(expect.not.arrayContaining(['id="prisonerCrd"']))
          expect(res.text).toContain('id="prisonerArd"> 01/01/2001')
        })
    })

    test('should return the eligibility', () => {
      licenceService.getLicence.mockResolvedValue({
        stage: 'ELIGIBILITY',
        licence: {
          eligibility: {
            excluded: {
              decision: 'No',
            },
            suitability: {
              decision: 'No',
            },
            crdTime: {
              decision: 'No',
            },
          },
        },
      })

      const app = createApp({
        licenceServiceStub: licenceService,
        prisonerServiceStub: prisonerService,
        caServiceStub: caService,
      })

      return request(app)
        .get('/taskList/1233456')
        .expect(200)
        .expect(res => {
          expect(res.text).toEqual(expect.not.arrayContaining(['id="eligibilityCheckStart"']))
        })
    })

    test('should handle no eligibility', () => {
      licenceService.getLicence.mockResolvedValue({ stage: 'ELIGIBILITY', licence: {} })

      const app = createApp({
        licenceServiceStub: licenceService,
        prisonerServiceStub: prisonerService,
        caServiceStub: caService,
      })

      return request(app)
        .get('/taskList/1233456')
        .expect(200)
        .expect(res => {
          expect(res.text).toContain('id="eligibilityCheckStart"')
        })
    })

    describe('when the is no licence in the db for the offender', () => {
      test('should still load the taskList', () => {
        licenceService.getLicence.mockResolvedValue(null)
        const app = createApp({
          licenceServiceStub: licenceService,
          prisonerServiceStub: prisonerService,
          caServiceStub: caService,
        })
        return request(app)
          .get('/taskList/123')
          .expect(200)
          .expect('Content-Type', /html/)
          .expect(res => {
            expect(res.text).toContain('id="prisonerArd"> 01/01/2001')
          })
      })
    })
  })

  describe('POST /eligibilityStart', () => {
    beforeEach(() => {
      licenceService.getLicence.mockResolvedValue({ bookingId: '1' })
      licenceService.createLicence.mockResolvedValue()
    })

    test('should redirect to eligibility section', () => {
      const app = createApp({
        licenceServiceStub: licenceService,
        prisonerServiceStub: prisonerService,
        caServiceStub: caService,
      })

      return request(app)
        .post('/taskList/eligibilityStart')
        .send({ bookingId: '123' })
        .expect(302)
        .expect(res => {
          expect(res.header.location).toContain('/hdc/eligibility/excluded/123')
        })
    })

    describe('licence exists in db', () => {
      test('should not create a new licence', () => {
        const app = createApp({
          licenceServiceStub: licenceService,
          prisonerServiceStub: prisonerService,
          caServiceStub: caService,
        })

        return request(app)
          .post('/taskList/eligibilityStart')
          .send({ bookingId: '123' })
          .expect(302)
          .expect(() => {
            expect(licenceService.createLicence).not.toHaveBeenCalled()
          })
      })
    })

    describe('licence does not exist in db', () => {
      test('should create a new licence', () => {
        licenceService.getLicence.mockResolvedValue(undefined)
        licenceService.createLicence.mockResolvedValue()

        const app = createApp({
          licenceServiceStub: licenceService,
          prisonerServiceStub: prisonerService,
          caServiceStub: caService,
        })

        return request(app)
          .post('/taskList/eligibilityStart')
          .send({ bookingId: '123' })
          .expect(302)
          .expect(() => {
            expect(licenceService.createLicence).toHaveBeenCalled()
            expect(licenceService.createLicence).toHaveBeenCalledWith({ bookingId: '123' })
          })
      })

      test('should audit the new licence creation event', () => {
        licenceService.getLicence.mockResolvedValue(undefined)
        licenceService.createLicence.mockResolvedValue()

        const app = createApp({
          licenceServiceStub: licenceService,
          prisonerServiceStub: prisonerService,
          caServiceStub: caService,
        })

        return request(app)
          .post('/taskList/eligibilityStart')
          .send({ bookingId: '123' })
          .expect(302)
          .expect(() => {
            expect(auditStub.record).toHaveBeenCalled()
            expect(auditStub.record).toHaveBeenCalledWith('LICENCE_RECORD_STARTED', 'CA_USER_TEST', {
              bookingId: '123',
            })
          })
      })
    })
  })

  describe('POST /varyStart', () => {
    beforeEach(() => {
      licenceService.getLicence.mockResolvedValue(undefined)
      licenceService.createLicence.mockResolvedValue()
    })

    test('should redirect to vary/evidence page', () => {
      const app = createApp({
        licenceServiceStub: licenceService,
        prisonerServiceStub: prisonerService,
        caServiceStub: caService,
      })

      return request(app)
        .post('/taskList/varyStart')
        .send({ bookingId: '123' })
        .expect(302)
        .expect('Location', '/hdc/vary/evidence/123')
    })

    describe('licence does not exist in db', () => {
      test('should create a new licence', () => {
        const app = createApp({
          licenceServiceStub: licenceService,
          prisonerServiceStub: prisonerService,
          caServiceStub: caService,
        })

        return request(app)
          .post('/taskList/varyStart')
          .send({ bookingId: '123' })
          .expect(302)
          .expect(() => {
            expect(licenceService.createLicence).toHaveBeenCalled()
            expect(licenceService.createLicence).toHaveBeenCalledWith({
              bookingId: '123',
              data: { variedFromLicenceNotInSystem: true },
              stage: 'VARY',
            })
          })
      })

      test('should audit the new licence creation event', () => {
        licenceService.getLicence.mockResolvedValue(undefined)
        licenceService.createLicence.mockResolvedValue()

        const app = createApp({
          licenceServiceStub: licenceService,
          prisonerServiceStub: prisonerService,
          caServiceStub: caService,
        })

        return request(app)
          .post('/taskList/varyStart')
          .send({ bookingId: '123' })
          .expect(302)
          .expect(() => {
            expect(auditStub.record).toHaveBeenCalled()
            expect(auditStub.record).toHaveBeenCalledWith('VARY_NOMIS_LICENCE_CREATED', 'CA_USER_TEST', {
              bookingId: '123',
            })
          })
      })
    })
  })

  describe('GET /image/:imageId', () => {
    test('should return an image', () => {
      const app = createApp({
        licenceServiceStub: licenceService,
        prisonerServiceStub: prisonerService,
        caServiceStub: caService,
      })

      return request(app)
        .get('/taskList/image/123')
        .expect(200)
        .expect('Content-Type', /image/)
    })

    test('should return placeholder if no image returned from nomis', () => {
      prisonerService.getPrisonerImage.mockResolvedValue(null)

      const app = createApp({
        licenceServiceStub: licenceService,
        prisonerServiceStub: prisonerService,
        caServiceStub: caService,
      })

      return request(app)
        .get('/taskList/image/123')
        .expect(302)
        .expect('Content-Type', /image/)
    })
  })

  describe('User is RO', () => {
    test('should pass the client credential token not the user one', () => {
      licenceService.getLicence.mockResolvedValue({ stage: 'ELIGIBILITY', licence: {} })
      const app = createApp(
        { licenceServiceStub: licenceService, prisonerServiceStub: prisonerService, caServiceStub: caService },
        'roUser'
      )
      return request(app)
        .get('/taskList/123')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(() => {
          expect(prisonerService.getPrisonerDetails).toHaveBeenCalled()
          expect(prisonerService.getPrisonerDetails).toHaveBeenCalledWith('123', 'system-token')
        })
    })

    describe('Prisoner has been released', () => {
      test('should allow a new variation to be started if no licence exists', () => {
        licenceService.getLicence.mockResolvedValue(undefined)
        prisonerService.getPrisonerDetails.mockResolvedValue({ agencyLocationId: 'Out' })

        const app = createApp(
          { licenceServiceStub: licenceService, prisonerServiceStub: prisonerService, caServiceStub: caService },
          'roUser'
        )

        return request(app)
          .get('/taskList/123')
          .expect(200)
          .expect('Content-Type', /html/)
          .expect(res => {
            expect(res.text).toContain('action="/hdc/taskList/varyStart/"')
          })
      })

      test('should link to evidence page if there is a licence', () => {
        licenceService.getLicence.mockResolvedValue({ stage: 'VARY', licence: { variedFromLicenceNotInSystem: true } })
        prisonerService.getPrisonerDetails.mockResolvedValue({ agencyLocationId: 'Out' })

        const app = createApp(
          { licenceServiceStub: licenceService, prisonerServiceStub: prisonerService, caServiceStub: caService },
          'roUser'
        )

        return request(app)
          .get('/taskList/123')
          .expect(200)
          .expect('Content-Type', /html/)
          .expect(res => {
            expect(res.text).toContain('/hdc/vary/evidence/')
          })
      })
    })
  })
})

function createApp({ licenceServiceStub, prisonerServiceStub, caServiceStub }, user) {
  const prisonerService = prisonerServiceStub || createPrisonerServiceStub()
  const licenceService = licenceServiceStub || createLicenceServiceStub()
  const signInService = createSignInServiceStub()
  const caService = caServiceStub || createCaServiceStub

  const baseRouter = standardRouter({ licenceService, prisonerService, audit: auditStub, signInService, caService })
  const route = baseRouter(
    createRoute({
      licenceService,
      prisonerService,
      caseListService: caseListServiceStub,
      audit: auditStub,
      caService,
    }),
    { licenceRequired: false }
  )

  return appSetup(route, user, '/taskList/')
}
