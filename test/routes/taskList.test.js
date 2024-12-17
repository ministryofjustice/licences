const request = require('supertest')
const { mockAudit } = require('../mockClients')
const { appSetup } = require('../supertestSetup')

const {
  createPrisonerServiceStub,
  createLicenceServiceStub,
  createSignInServiceStub,
  createCaServiceStub,
} = require('../mockServices')

const standardRouter = require('../../server/routes/routeWorkers/standardRouter')
const createRoute = require('../../server/routes/taskList')
const NullTokenVerifier = require('../../server/authentication/tokenverifier/NullTokenVerifier')

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

const dmAddressRefusal = {
  stage: 'APPROVAL',
  licence: {
    approval: {
      release: {
        reason: 'addressUnsuitable',
        decision: 'No',
        decisionMaker: 'Diane Matthews',
        reasonForDecision: '',
      },
    },
  },
}

const dmHasProvidedHdcDecisionComments = {
  stage: 'DECIDED',
  licence: {
    approval: {
      release: {
        reason: 'addressUnsuitable',
        decision: 'No',
        decisionMaker: 'Diane Matthews',
        reasonForDecision: 'The reason for the prisoner not being granted HDC is ...',
      },
    },
  },
}

const caHasRefusedHdcButNotProvidedReason = {
  stage: 'DECIDED',
  licence: {
    approval: {
      release: {
        decision: 'Yes',
      },
    },
    finalChecks: {
      refusal: {
        decision: 'Yes',
      },
    },
  },
}

const caHasRefusedHdcAndProvidedReason = {
  stage: 'DECIDED',
  licence: {
    approval: {
      release: {
        decision: 'Yes',
      },
    },
    finalChecks: {
      refusal: {
        decision: 'Yes',
        reason: 'addressUnsuitable',
      },
    },
  },
}

const licenceWithEligibilityCompleteAndProposedAddress = {
  eligibility: {
    excluded: {
      decision: 'Yes',
      reason: 'blah',
    },
    suitability: {
      decision: 'Yes',
      reason: 'blah',
    },
    exceptionalCircumstances: {
      decision: 'Yes',
    },
    crdTime: {
      decision: 'No',
    },
  },
  bassReferral: {
    bassRequest: {
      bassRequested: 'No',
    },
  },
  proposedAddress: {
    optOut: {
      decision: 'No',
    },
    curfewAddress: {
      postCode: 'T1 1TT',
      telephone: '00000000000',
      addressTown: 'test address',
      addressLine1: 'test address',
    },
    addressProposed: {
      decision: 'Yes',
    },
  },
}

const licenceWithEligibilityCompleteAndCAS2Address = {
  eligibility: {
    excluded: {
      decision: 'Yes',
      reason: 'blah',
    },
    suitability: {
      decision: 'Yes',
      reason: 'blah',
    },
    exceptionalCircumstances: {
      decision: 'Yes',
    },
    crdTime: {
      decision: 'No',
    },
  },
  bassReferral: {
    bassRequest: {
      bassRequested: 'Yes',
    },
  },
  proposedAddress: {
    optOut: {
      decision: 'No',
    },
    addressProposed: {
      decision: 'No',
    },
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
      licenceService.getLicence.mockResolvedValue({
        stage: 'ELIGIBILITY',
        licence: licenceWithEligibilityCompleteAndProposedAddress,
      })

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

    test('should return error message for NO_OFFENDER_NUMBER when curfew address proposed', async () => {
      licenceService.getLicence.mockResolvedValue({
        stage: 'ELIGIBILITY',
        licence: licenceWithEligibilityCompleteAndProposedAddress,
      })
      caService.getReasonForNotContinuing.mockResolvedValue('NO_OFFENDER_NUMBER')

      const app = createApp({
        licenceServiceStub: licenceService,
        prisonerServiceStub: prisonerService,
        caServiceStub: caService,
      })

      return request(app)
        .get('/taskList/123')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('This is because there is no offender number recorded in Delius')
        })
    })

    test('should return error message for NO_OFFENDER_NUMBER when CAS2 requested', async () => {
      licenceService.getLicence.mockResolvedValue({
        stage: 'ELIGIBILITY',
        licence: licenceWithEligibilityCompleteAndCAS2Address,
      })
      caService.getReasonForNotContinuing.mockResolvedValue('NO_OFFENDER_NUMBER')

      const app = createApp({
        licenceServiceStub: licenceService,
        prisonerServiceStub: prisonerService,
        caServiceStub: caService,
      })

      return request(app)
        .get('/taskList/123')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('This is because there is no offender number recorded in Delius')
        })
    })

    test('should return error messages for LDU_INACTIVE when curfew address proposed', async () => {
      licenceService.getLicence.mockResolvedValue({
        stage: 'ELIGIBILITY',
        licence: licenceWithEligibilityCompleteAndProposedAddress,
      })
      caService.getReasonForNotContinuing.mockResolvedValue('LDU_INACTIVE')

      const app = createApp({
        licenceServiceStub: licenceService,
        prisonerServiceStub: prisonerService,
        caServiceStub: caService,
      })

      return request(app)
        .get('/taskList/123')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain(
            "You need to contact the probation team to ask them to review this person's Community Offender Manager allocation in Delius."
          )
        })
    })

    test('should return error messages for LDU_INACTIVE when CAS2 requested', async () => {
      licenceService.getLicence.mockResolvedValue({
        stage: 'ELIGIBILITY',
        licence: licenceWithEligibilityCompleteAndCAS2Address,
      })
      caService.getReasonForNotContinuing.mockResolvedValue('LDU_INACTIVE')

      const app = createApp({
        licenceServiceStub: licenceService,
        prisonerServiceStub: prisonerService,
        caServiceStub: caService,
      })

      return request(app)
        .get('/taskList/123')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain(
            "You need to contact the probation team to ask them to review this person's Community Offender Manager allocation in Delius."
          )
        })
    })

    test('should return error messages for COM_NOT_ALLOCATED when curfew address proposed', async () => {
      licenceService.getLicence.mockResolvedValue({
        stage: 'ELIGIBILITY',
        licence: licenceWithEligibilityCompleteAndProposedAddress,
      })
      caService.getReasonForNotContinuing.mockResolvedValue('COM_NOT_ALLOCATED')

      const app = createApp({
        licenceServiceStub: licenceService,
        prisonerServiceStub: prisonerService,
        caServiceStub: caService,
      })

      return request(app)
        .get('/taskList/123')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('This is because there is no Community Offender Manager showing in Delius')
        })
    })

    test('should return error messages for COM_NOT_ALLOCATED when CAS2 requested', async () => {
      licenceService.getLicence.mockResolvedValue({
        stage: 'ELIGIBILITY',
        licence: licenceWithEligibilityCompleteAndCAS2Address,
      })
      caService.getReasonForNotContinuing.mockResolvedValue('COM_NOT_ALLOCATED')

      const app = createApp({
        licenceServiceStub: licenceService,
        prisonerServiceStub: prisonerService,
        caServiceStub: caService,
      })

      return request(app)
        .get('/taskList/123')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('This is because there is no Community Offender Manager showing in Delius')
        })
    })

    test('should NOT disable the Start now button if there are no errors when curfew address proposed', async () => {
      licenceService.getLicence.mockResolvedValue({
        stage: 'ELIGIBILITY',
        licence: licenceWithEligibilityCompleteAndProposedAddress,
      })
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
        .expect((res) => {
          expect(res.text).not.toContain('button-disabled')
        })
    })

    test('should NOT disable the Start now button if there are no errors when CAS2 requested', async () => {
      licenceService.getLicence.mockResolvedValue({
        stage: 'ELIGIBILITY',
        licence: licenceWithEligibilityCompleteAndCAS2Address,
      })
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
        .expect((res) => {
          expect(res.text).not.toContain('button-disabled')
        })
    })

    test('should not display the create licence task if the licence is to be created in CVL', async () => {
      licenceService.getLicence.mockResolvedValue({
        stage: 'DECIDED',
        licence: {
          risk: {
            riskManagement: {
              version: '3',
              emsInformation: 'No',
              pomConsultation: 'Yes',
              mentalHealthPlan: 'No',
              unsuitableReason: '',
              hasConsideredChecks: 'Yes',
              manageInTheCommunity: 'Yes',
              emsInformationDetails: '',
              riskManagementDetails: '',
              proposedAddressSuitable: 'Yes',
              awaitingOtherInformation: 'No',
              nonDisclosableInformation: 'No',
              nonDisclosableInformationDetails: '',
              manageInTheCommunityNotPossibleReason: '',
            },
          },
          curfew: {
            curfewHours: {
              allFrom: '19:00',
              allUntil: '07:00',
              fridayFrom: '19:00',
              mondayFrom: '19:00',
              sundayFrom: '19:00',
              fridayUntil: '07:00',
              mondayUntil: '07:00',
              sundayUntil: '07:00',
              tuesdayFrom: '19:00',
              saturdayFrom: '19:00',
              thursdayFrom: '19:00',
              tuesdayUntil: '07:00',
              saturdayUntil: '07:00',
              thursdayUntil: '07:00',
              wednesdayFrom: '19:00',
              wednesdayUntil: '07:00',
              daySpecificInputs: 'No',
            },
            approvedPremises: {
              required: 'No',
            },
            curfewAddressReview: {
              version: '2',
              electricity: 'Yes',
              homeVisitConducted: 'No',
              consentHavingSpoken: 'Yes',
              addressReviewComments: '',
            },
          },
          victim: {
            victimLiaison: {
              decision: 'No',
            },
          },
          approval: {
            release: {
              decision: 'Yes',
            },
            consideration: {
              decision: 'Yes',
            },
          },
          reporting: {
            reportingInstructions: {
              name: 'Test Person',
              postcode: 'B1 2TJ',
              telephone: '00000000001',
              townOrCity: 'Test',
              organisation: 'Test',
              reportingDate: '01/01/2025',
              reportingTime: '09:00',
              buildingAndStreet1: 'Test Street',
              buildingAndStreet2: '',
            },
          },
          eligibility: {
            crdTime: {
              decision: 'No',
            },
            excluded: {
              decision: 'No',
            },
            suitability: {
              decision: 'No',
            },
          },
          finalChecks: {
            onRemand: {
              decision: 'No',
            },
            segregation: {
              decision: 'No',
            },
            seriousOffence: {
              decision: 'No',
            },
            confiscationOrder: {
              decision: 'No',
            },
            undulyLenientSentence: {
              decision: 'No',
            },
          },
          bassReferral: {
            bassRequest: {
              bassRequested: 'No',
            },
          },
          proposedAddress: {
            optOut: {
              decision: 'No',
            },
            curfewAddress: {
              occupier: {
                name: 'TEST',
                relationship: 'test',
              },
              postCode: 'B1 2TJ',
              residents: [],
              telephone: '00000000001',
              addressTown: 'Test Town',
              addressLine1: 'Test Street',
              addressLine2: '',
              additionalInformation: '',
              residentOffenceDetails: '',
              cautionedAgainstResident: 'No',
            },
            addressProposed: {
              decision: 'Yes',
            },
          },
          licenceConditions: {
            standard: {
              additionalConditionsRequired: 'No',
            },
          },
        },
        licenceInCvl: true,
      })
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
        .expect((res) => {
          expect(res.text).not.toContain('Create licence')
          expect(res.text).not.toContain('data-qa="continue"')
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
        .expect((res) => {
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
        .expect((res) => {
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
        .expect((res) => {
          expect(res.text).toContain('id="eligibilityCheckStart"')
        })
    })

    test('should contain "The reason for the prisoner not being granted HDC" ', () => {
      licenceService.getLicence.mockResolvedValue(dmHasProvidedHdcDecisionComments)

      const app = createApp(
        { licenceServiceStub: licenceService, prisonerServiceStub: prisonerService, caServiceStub: caService },
        'caUser'
      )

      return request(app)
        .get('/taskList/123')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('The reason for the prisoner not being granted HD')
        })
    })

    test('should contain "Home detention curfew refused by decision maker" ', () => {
      licenceService.getLicence.mockResolvedValue(dmHasProvidedHdcDecisionComments)

      const app = createApp(
        { licenceServiceStub: licenceService, prisonerServiceStub: prisonerService, caServiceStub: caService },
        'caUser'
      )

      return request(app)
        .get('/taskList/123')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('Home detention curfew refused by decision maker')
        })
    })

    test('should contain "Home detention curfew refused by prison case admin" ', () => {
      licenceService.getLicence.mockResolvedValue(caHasRefusedHdcButNotProvidedReason)

      const app = createApp(
        { licenceServiceStub: licenceService, prisonerServiceStub: prisonerService, caServiceStub: caService },
        'caUser'
      )

      return request(app)
        .get('/taskList/123')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('Home detention curfew refused by prison case admin')
          expect(res.text).not.toContain('case admin:')
        })
    })

    test('should contain "Home detention curfew refused by prison case admin: No available address" ', () => {
      licenceService.getLicence.mockResolvedValue(caHasRefusedHdcAndProvidedReason)

      const app = createApp(
        { licenceServiceStub: licenceService, prisonerServiceStub: prisonerService, caServiceStub: caService },
        'caUser'
      )

      return request(app)
        .get('/taskList/123')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('Home detention curfew refused by prison case admin: No available address')
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
          .expect((res) => {
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
        .expect((res) => {
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
        const audit = mockAudit()
        licenceService.getLicence.mockResolvedValue(undefined)
        licenceService.createLicence.mockResolvedValue()

        const app = createApp({
          licenceServiceStub: licenceService,
          prisonerServiceStub: prisonerService,
          caServiceStub: caService,
          audit,
        })

        return request(app)
          .post('/taskList/eligibilityStart')
          .send({ bookingId: '123' })
          .expect(302)
          .expect(() => {
            expect(audit.record).toHaveBeenCalled()
            expect(audit.record).toHaveBeenCalledWith('LICENCE_RECORD_STARTED', 'CA_USER_TEST', {
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
        const audit = mockAudit()
        licenceService.getLicence.mockResolvedValue(undefined)
        licenceService.createLicence.mockResolvedValue()

        const app = createApp({
          licenceServiceStub: licenceService,
          prisonerServiceStub: prisonerService,
          caServiceStub: caService,
          audit,
        })

        return request(app)
          .post('/taskList/varyStart')
          .send({ bookingId: '123' })
          .expect(302)
          .expect(() => {
            expect(audit.record).toHaveBeenCalled()
            expect(audit.record).toHaveBeenCalledWith('VARY_NOMIS_LICENCE_CREATED', 'CA_USER_TEST', {
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

      return request(app).get('/taskList/image/123').expect(200).expect('Content-Type', /image/)
    })

    test('should return placeholder if no image returned from nomis', () => {
      prisonerService.getPrisonerImage.mockResolvedValue(null)

      const app = createApp({
        licenceServiceStub: licenceService,
        prisonerServiceStub: prisonerService,
        caServiceStub: caService,
      })

      return request(app).get('/taskList/image/123').expect(302).expect('Content-Type', /image/)
    })
  })

  describe('User is RO', () => {
    test('should pass the client credential token not the user one', () => {
      licenceService.getLicence.mockResolvedValue({ stage: 'PROCESSING_RO', licence: {} })
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
          .expect((res) => {
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
          .expect((res) => {
            expect(res.text).toContain('/hdc/vary/evidence/')
          })
      })

      test('should not contain "Home detention curfew refused" at head of page', () => {
        licenceService.getLicence.mockResolvedValue(dmAddressRefusal)

        const app = createApp(
          { licenceServiceStub: licenceService, prisonerServiceStub: prisonerService, caServiceStub: caService },
          'dmUser'
        )

        return request(app)
          .get('/taskList/123')
          .expect(200)
          .expect('Content-Type', /html/)
          .expect((res) => {
            expect(res.text).not.toContain('Home detention curfew refused')
          })
      })

      test('should not contain "Address unsuitable" content in the final decision task', () => {
        licenceService.getLicence.mockResolvedValue(dmAddressRefusal)
        const app = createApp(
          { licenceServiceStub: licenceService, prisonerServiceStub: prisonerService, caServiceStub: caService },
          'dmUser'
        )

        return request(app)
          .get('/taskList/123')
          .expect(200)
          .expect('Content-Type', /html/)
          .expect((res) => {
            expect(res.text).not.toContain('Address unsuitable')
          })
      })

      test('should display the Forms link', () => {
        licenceService.getLicence.mockResolvedValue({ stage: 'PROCESSING_RO', licence: {} })
        const app = createApp(
          { licenceServiceStub: licenceService, prisonerServiceStub: prisonerService, caServiceStub: caService },
          'roUser'
        )
        return request(app)
          .get('/taskList/123')
          .expect(200)
          .expect('Content-Type', /html/)
          .expect((res) => {
            expect(res.text).toContain('Forms')
          })
      })
    })
  })
})

function createApp({ licenceServiceStub, prisonerServiceStub, caServiceStub, audit = mockAudit() }, user) {
  const prisonerService = prisonerServiceStub || createPrisonerServiceStub()
  const licenceService = licenceServiceStub || createLicenceServiceStub()
  const signInService = createSignInServiceStub()
  const caService = caServiceStub || createCaServiceStub

  const baseRouter = standardRouter({
    licenceService,
    prisonerService,
    audit,
    signInService,
    tokenVerifier: new NullTokenVerifier(),
    config: null,
  })
  const route = baseRouter(createRoute(prisonerService, licenceService, audit, caService, signInService), {
    licenceRequired: false,
  })

  return appSetup(route, user, '/taskList/')
}
