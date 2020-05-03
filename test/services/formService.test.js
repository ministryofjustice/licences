const createFormService = require('../../server/services/formService')
const { pickCurfewAddress } = require('../../server/services/utils/pdfFormatter')
const { createPrisonerServiceStub } = require('../mockServices')

describe('formService', () => {
  let service
  let pdfFormatter
  let conditionsService
  let prisonerService
  let configClient

  const creationDate = '25th April 2019'

  const address = {
    addressLine1: 'line1',
    addressLine2: 'line2',
    addressTown: 'town',
    postCode: 'postcode',
  }

  let realDateNow

  beforeEach(() => {
    pdfFormatter = {
      pickCurfewAddress,
    }
    conditionsService = {
      getFullTextForApprovedConditions: jest.fn().mockReturnValue({}),
    }
    prisonerService = createPrisonerServiceStub()
    prisonerService.getPrisonerDetails.mockReturnValue({})

    configClient = {
      getMailboxes: jest.fn().mockReturnValue([{ email: 'first' }, { email: 'second' }]),
    }
    service = createFormService(pdfFormatter, conditionsService, prisonerService, configClient)
    const time = new Date('April 25, 2019 01:00:00')
    realDateNow = Date.now.bind(global.Date)
    jest.spyOn(Date, 'now').mockImplementation(() => time.getTime())
  })

  afterEach(() => {
    global.Date.now = realDateNow
  })

  describe('getTemplateData', () => {
    test('should call pdf service with template name and expected data', async () => {
      const licence = { proposedAddress: { curfewAddress: address } }
      const prisoner = {
        offenderNo: 123,
        agencyLocationDesc: 'location',
        sentenceDetail: { homeDetentionCurfewEligibilityDate: 'hdced', releaseDate: 'crd' },
      }

      const expectedData = {
        CREATION_DATE: creationDate,
        CURFEW_ADDRESS: 'line1\nline2\ntown\npostcode',
        EST_PREMISE: 'location',
        OFF_NAME: '',
        OFF_NOMS: 123,
        SENT_CRD: 'crd',
        SENT_HDCED: 'hdced',
      }

      const data = await service.getTemplateData('approved', licence, prisoner)

      expect(data).toEqual(expectedData)
    })

    test('should combine offender name, ignoring empty', async () => {
      const licence = {}
      const prisoner = { firstName: 'first', middleName: null, lastName: 'last name' }

      const expectedData = {
        CREATION_DATE: creationDate,
        EST_PREMISE: '',
        OFF_NAME: 'first last name',
        OFF_NOMS: '',
        SENT_CRD: '',
        SENT_HDCED: '',
      }

      const data = await service.getTemplateData('eligible', licence, prisoner)
      expect(data).toEqual(expectedData)
    })

    test('should map refusal reason from DM refusal', async () => {
      const prisoner = {}
      const licence = { approval: { release: { reason: 'insufficientTime' } } }

      const expectedData = {
        CREATION_DATE: creationDate,
        EST_PREMISE: '',
        OFF_NAME: '',
        OFF_NOMS: '',
        REFUSAL_REASON: 'there is not enough time before you’re due to be released',
        SENT_CRD: '',
      }

      const data = await service.getTemplateData('refused', licence, prisoner)
      expect(data).toEqual(expectedData)
    })

    test('should map first refusal reason from DM refusal with multiple reasons', async () => {
      const prisoner = {}
      const licence = {
        approval: { release: { reason: ['insufficientTime', 'other', 'other', 'other'] } },
      }

      const expectedData = {
        CREATION_DATE: creationDate,
        EST_PREMISE: '',
        OFF_NAME: '',
        OFF_NOMS: '',
        REFUSAL_REASON: 'there is not enough time before you’re due to be released',
        SENT_CRD: '',
      }

      const data = await service.getTemplateData('refused', licence, prisoner)
      expect(data).toEqual(expectedData)
    })

    test('should map refusal reason from final checks refusal', async () => {
      const prisoner = {}
      const licence = {
        finalChecks: { refusal: { reason: 'noAvailableAddress' } },
        approval: { release: { reason: 'insufficientTime' } },
      }

      const expectedData = {
        CREATION_DATE: creationDate,
        EST_PREMISE: '',
        OFF_NAME: '',
        OFF_NOMS: '',
        REFUSAL_REASON: 'there is no suitable address for you to live at',
        SENT_CRD: '',
      }

      const data = await service.getTemplateData('refused', licence, prisoner)
      expect(data).toEqual(expectedData)
    })

    test('should map first refusal reason from final checks refusal with multiple reasons', async () => {
      const prisoner = {}
      const licence = {
        finalChecks: { refusal: { reason: ['noAvailableAddress', 'other', 'other'] } },
        approval: { release: { reason: 'insufficientTime' } },
      }

      const expectedData = {
        CREATION_DATE: creationDate,
        EST_PREMISE: '',
        OFF_NAME: '',
        OFF_NOMS: '',
        REFUSAL_REASON: 'there is no suitable address for you to live at',
        SENT_CRD: '',
      }

      const data = await service.getTemplateData('refused', licence, prisoner)
      expect(data).toEqual(expectedData)
    })

    test('should map excluded reason', async () => {
      const prisoner = {}
      const licence = { eligibility: { excluded: { reason: 'sexOffenderRegister' } } }

      const expectedData = {
        CREATION_DATE: creationDate,
        EST_PREMISE: '',
        OFF_NAME: '',
        OFF_NOMS: '',
        INELIGIBLE_REASON: 'of your conviction history',
      }

      const data = await service.getTemplateData('ineligible', licence, prisoner)
      expect(data).toEqual(expectedData)
    })

    test('should map excluded reason cja2003_19ZA', async () => {
      const prisoner = {}
      const licence = { eligibility: { excluded: { reason: 'cja2003_19ZA' } } }

      const expectedData = {
        CREATION_DATE: creationDate,
        EST_PREMISE: '',
        OFF_NAME: '',
        OFF_NOMS: '',
        INELIGIBLE_REASON:
          'you are currently serving for a terrorism or terrorism-related offence in schedule 19ZA of the Criminal Justice Act 2003',
      }

      const data = await service.getTemplateData('ineligible', licence, prisoner)
      expect(data).toEqual(expectedData)
    })

    test('should map first excluded reason when multiple', async () => {
      const prisoner = {}
      const licence = { eligibility: { excluded: { reason: ['sexOffenderRegister', 'other', 'other'] } } }

      const expectedData = {
        CREATION_DATE: creationDate,
        EST_PREMISE: '',
        OFF_NAME: '',
        OFF_NOMS: '',
        INELIGIBLE_REASON: 'of your conviction history',
      }

      const data = await service.getTemplateData('ineligible', licence, prisoner)
      expect(data).toEqual(expectedData)
    })

    test('should map unsuitable reason', async () => {
      const prisoner = {}
      const licence = { eligibility: { suitability: { reason: 'deportationLiable' } } }

      const expectedData = {
        CREATION_DATE: creationDate,
        EST_PREMISE: '',
        OFF_NAME: '',
        OFF_NOMS: '',
        UNSUITABLE_REASON: 'you are likely to be deported',
      }

      const data = await service.getTemplateData('unsuitable', licence, prisoner)
      expect(data).toEqual(expectedData)
    })

    test('should map unsuitable reason historyOfTerrorism', async () => {
      const prisoner = {}
      const licence = { eligibility: { suitability: { reason: 'historyOfTerrorism' } } }

      const expectedData = {
        CREATION_DATE: creationDate,
        EST_PREMISE: '',
        OFF_NAME: '',
        OFF_NOMS: '',
        UNSUITABLE_REASON: 'you have a history of terrorism or terrorism-related offending',
      }

      const data = await service.getTemplateData('unsuitable', licence, prisoner)
      expect(data).toEqual(expectedData)
    })

    test('should map first unsuitable reason when multiple', async () => {
      const prisoner = {}
      const licence = { eligibility: { suitability: { reason: ['deportationLiable', 'other', 'other'] } } }

      const expectedData = {
        CREATION_DATE: creationDate,
        EST_PREMISE: '',
        OFF_NAME: '',
        OFF_NOMS: '',
        UNSUITABLE_REASON: 'you are likely to be deported',
      }

      const data = await service.getTemplateData('unsuitable', licence, prisoner)
      expect(data).toEqual(expectedData)
    })

    test('should format dates', async () => {
      const licence = {}
      const prisoner = { sentenceDetail: { homeDetentionCurfewEligibilityDate: '1/5/2019', releaseDate: '3/12/2019' } }

      const expectedData = {
        CREATION_DATE: creationDate,
        EST_PREMISE: '',
        OFF_NAME: '',
        OFF_NOMS: '',
        SENT_CRD: '3rd December 2019',
        SENT_HDCED: '1st May 2019',
      }

      const data = await service.getTemplateData('eligible', licence, prisoner)
      expect(data).toEqual(expectedData)
    })

    test('should use unformatted date when invalid', async () => {
      const licence = {}
      const prisoner = {
        sentenceDetail: { homeDetentionCurfewEligibilityDate: 'Not a date', releaseDate: '32/13/100' },
      }

      const expectedData = {
        CREATION_DATE: creationDate,
        EST_PREMISE: '',
        OFF_NAME: '',
        OFF_NOMS: '',
        SENT_CRD: '32/13/100',
        SENT_HDCED: 'Not a date',
      }

      const data = await service.getTemplateData('eligible', licence, prisoner)
      expect(data).toEqual(expectedData)
    })

    test('get curfew telephone', async () => {
      const licence = {
        proposedAddress: {
          curfewAddress: { ...address, telephone: '0123456789' },
        },
      }
      const prisoner = {
        sentenceDetail: { homeDetentionCurfewEligibilityDate: 'Not a date', releaseDate: '32/13/100' },
      }

      const expectedData = {
        CREATION_DATE: creationDate,
        EST_PREMISE: '',
        OFF_NAME: '',
        OFF_NOMS: '',
        SENT_CRD: '32/13/100',
        SENT_HDCED: 'Not a date',
        CURFEW_ADDRESS: 'line1\nline2\ntown\npostcode',
        CURFEW_FIRST: '',
        CURFEW_HOURS: '',
        CURFEW_TELEPHONE: '0123456789',
      }

      const data = await service.getTemplateData('agency_notification', licence, prisoner)
      expect(data).toEqual(expectedData)
    })
  })

  describe('getCurfewAddressCheckData', () => {
    const licence = {
      bassReferral: {
        bassRequest: 'bassRequest',
        bassAreaCheck: 'bassAreaCheck',
      },
      proposedAddress: {
        curfewAddress: { occupier: 'occupier' },
      },
      curfew: {
        curfewAddressReview: 'curfewAddressReview',
        approvedPremisesAddress: 'approvedPremisesAddress',
      },
    }
    const agencyLocationId = 'agencyLocationId'
    const bookingId = 'bookingId'
    const token = 'token'
    const isBass = false
    const isAp = false

    const curfewAddressRequest = { agencyLocationId, licence, isBass, isAp, bookingId, token }

    test('should call services for data', async () => {
      await service.getCurfewAddressCheckData(curfewAddressRequest)

      expect(conditionsService.getFullTextForApprovedConditions).toHaveBeenCalled()
      expect(conditionsService.getFullTextForApprovedConditions).toHaveBeenCalledWith(licence)

      expect(prisonerService.getPrisonerDetails).toHaveBeenCalled()
      expect(prisonerService.getPrisonerDetails).toHaveBeenCalledWith('bookingId', 'token')

      expect(configClient.getMailboxes).toHaveBeenCalled()
      expect(configClient.getMailboxes).toHaveBeenCalledWith('agencyLocationId', 'CA')
    })

    test('should select first CA email', async () => {
      const data = await service.getCurfewAddressCheckData(curfewAddressRequest)
      expect(data.prisonEmail).toBe('first')
    })

    test('should return bass data when is Bass', async () => {
      const data = await service.getCurfewAddressCheckData({
        agencyLocationId,
        licence,
        isBass: true,
        isAp,
        bookingId,
        token,
      })
      expect(data.bassRequest).toBe('bassRequest')
      expect(data.bassAreaCheck).toBe('bassAreaCheck')
      expect(data.approvedPremisesAddress).toEqual(undefined)
      expect(data.curfewAddress).toEqual(undefined)
      expect(data.curfewAddressReview).toEqual(undefined)
      expect(data.occupier).toEqual(undefined)
    })

    test('should return AP data when is AP', async () => {
      const data = await service.getCurfewAddressCheckData({
        agencyLocationId,
        licence,
        isBass,
        isAp: true,
        bookingId,
        token,
      })
      expect(data.bassRequest).toEqual(undefined)
      expect(data.bassAreaCheck).toEqual(undefined)
      expect(data.approvedPremisesAddress).toBe('approvedPremisesAddress')
      expect(data.curfewAddress).toEqual(undefined)
      expect(data.curfewAddressReview).toEqual(undefined)
      expect(data.occupier).toEqual(undefined)
    })

    test('should return curfew address data when not Bass and not AP', async () => {
      const data = await service.getCurfewAddressCheckData(curfewAddressRequest)
      expect(data.bassRequest).toEqual(undefined)
      expect(data.bassAreaCheck).toEqual(undefined)
      expect(data.approvedPremisesAddress).toEqual(undefined)
      expect(data.curfewAddress).toEqual({ occupier: 'occupier' })
      expect(data.curfewAddressReview).toBe('curfewAddressReview')
      expect(data.occupier).toBe('occupier')
    })

    test('should require isAp to be true or false but never undefined', async () => {
      return expect(
        service.getCurfewAddressCheckData({
          agencyLocationId,
          licence,
          isBass,
          isAp: undefined,
          bookingId,
          token,
        })
      ).rejects.not.toBeNull()
    })

    test('should require isAp to be true or false but never missing', async () => {
      return expect(
        service.getCurfewAddressCheckData({
          agencyLocationId,
          licence,
          isBass,
          bookingId,
          token,
        })
      ).rejects.not.toBeNull()
    })

    test('should require isBass to be true or false but never undefined', async () => {
      return expect(
        service.getCurfewAddressCheckData({
          agencyLocationId,
          licence,
          isBass: undefined,
          isAp: false,
          bookingId,
          token,
        })
      ).rejects.not.toBeNull()
    })

    test('should require isBass to be true or false but never missing', async () => {
      return expect(
        service.getCurfewAddressCheckData({
          agencyLocationId,
          licence,
          isAp: false,
          bookingId,
          token,
        })
      ).rejects.not.toBeNull()
    })
  })
})
