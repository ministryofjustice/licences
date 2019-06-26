const createFormService = require('../../server/services/formService')

describe('formService', () => {
  let service
  let pdfFormatter
  let clock

  const creationDate = '25th April 2019'

  const address = {
    addressLine1: 'line1',
    addressLine2: 'line2',
    addressTown: 'town',
    postCode: 'postcode',
  }

  beforeEach(() => {
    pdfFormatter = {
      pickCurfewAddress: sinon.stub().returns(address),
    }
    service = createFormService(pdfFormatter)
    clock = sinon.useFakeTimers(new Date('April 25, 2019 01:00:00').getTime())
  })

  afterEach(() => {
    clock.restore()
  })

  describe('getTemplateData', () => {
    it('should call pdf service with template name and expected data', async () => {
      const licence = {}
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
      expect(pdfFormatter.pickCurfewAddress).to.be.calledOnce()

      expect(data).to.eql(expectedData)
    })

    it('should combine offender name, ignoring empty', async () => {
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
      expect(data).to.eql(expectedData)
    })

    it('should map refusal reason from DM refusal', async () => {
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
      expect(data).to.eql(expectedData)
    })

    it('should map first refusal reason from DM refusal with multiple reasons', async () => {
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
      expect(data).to.eql(expectedData)
    })

    it('should map refusal reason from final checks refusal', async () => {
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
      expect(data).to.eql(expectedData)
    })

    it('should map first refusal reason from final checks refusal with multiple reasons', async () => {
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
      expect(data).to.eql(expectedData)
    })

    it('should map excluded reason', async () => {
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
      expect(data).to.eql(expectedData)
    })

    it('should map first excluded reason when multiple', async () => {
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
      expect(data).to.eql(expectedData)
    })

    it('should map unsuitable reason', async () => {
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
      expect(data).to.eql(expectedData)
    })

    it('should map first unsuitable reason when multiple', async () => {
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
      expect(data).to.eql(expectedData)
    })

    it('should format dates', async () => {
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
      expect(data).to.eql(expectedData)
    })

    it('should use unformatted date when invalid', async () => {
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
      expect(data).to.eql(expectedData)
    })
  })
})
