const createFormService = require('../../server/services/formService')

describe('formService', () => {
  let service
  let pdfService
  let pdfFormatter
  let clock

  const address = {
    addressLine1: 'line1',
    addressLine2: 'line2',
    addressTown: 'town',
    postCode: 'postcode',
  }

  beforeEach(() => {
    pdfService = {
      getPdf: sinon.stub().resolves(),
    }
    pdfFormatter = {
      pickCurfewAddress: sinon.stub().returns(address),
    }
    service = createFormService(pdfService, pdfFormatter)
    clock = sinon.useFakeTimers(new Date('April 25, 2019 01:00:00').getTime())
  })

  afterEach(() => {
    clock.restore()
  })

  describe('generatePdf', () => {
    it('should call pdf service with template name and expected data', async () => {
      const licence = {}
      const prisoner = {
        offenderNo: 123,
        agencyLocationDesc: 'location',
        sentenceDetail: { homeDetentionCurfewEligibilityDate: 'hdced', releaseDate: 'crd' },
      }

      const expectedData = {
        CREATION_DATE: '25/04/2019',
        CURFEW_ADDRESS: 'line1\nline2\ntown\npostcode',
        EST_PREMISE: 'location',
        OFF_NAME: '',
        OFF_NOMS: 123,
        REFUSAL_REASON: '',
        SENT_CRD: 'crd',
        SENT_HDCED: 'hdced',
      }

      await service.generatePdf('templateName', licence, prisoner)
      expect(pdfFormatter.pickCurfewAddress).to.be.calledOnce()
      expect(pdfService.getPdf).to.be.calledOnce()
      expect(pdfService.getPdf).to.be.calledWith('templateName', expectedData)
    })

    it('should combine offender name, ignoring empty', async () => {
      const licence = {}
      const prisoner = { firstName: 'first', middleName: null, lastName: 'last name' }

      const expectedData = {
        CREATION_DATE: '25/04/2019',
        CURFEW_ADDRESS: 'line1\nline2\ntown\npostcode',
        EST_PREMISE: '',
        OFF_NAME: 'first last name',
        OFF_NOMS: '',
        REFUSAL_REASON: '',
        SENT_CRD: '',
        SENT_HDCED: '',
      }

      await service.generatePdf('templateName', licence, prisoner)
      expect(pdfService.getPdf).to.be.calledWith('templateName', expectedData)
    })

    it('should map refusal reason from DM refusal', async () => {
      const prisoner = {}
      const licence = { approval: { release: { reason: 'insufficientTime' } } }

      const expectedData = {
        CREATION_DATE: '25/04/2019',
        CURFEW_ADDRESS: 'line1\nline2\ntown\npostcode',
        EST_PREMISE: '',
        OFF_NAME: '',
        OFF_NOMS: '',
        REFUSAL_REASON: 'there is not enough time before you’re due to be released',
        SENT_CRD: '',
        SENT_HDCED: '',
      }

      await service.generatePdf('templateName', licence, prisoner)
      expect(pdfService.getPdf).to.be.calledWith('templateName', expectedData)
    })

    it('should map refusal reason from final checks refusal', async () => {
      const prisoner = {}
      const licence = {
        finalChecks: { release: { reason: 'noAvailableAddress' } },
        approval: { release: { reason: 'insufficientTime' } },
      }

      const expectedData = {
        CREATION_DATE: '25/04/2019',
        CURFEW_ADDRESS: 'line1\nline2\ntown\npostcode',
        EST_PREMISE: '',
        OFF_NAME: '',
        OFF_NOMS: '',
        REFUSAL_REASON: 'there is no suitable address for you to live at',
        SENT_CRD: '',
        SENT_HDCED: '',
      }

      await service.generatePdf('templateName', licence, prisoner)
      expect(pdfService.getPdf).to.be.calledWith('templateName', expectedData)
    })
  })
})
