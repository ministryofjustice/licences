const nock = require('nock')

import { ConditionsService } from '../../server/services/conditionsService'
import PdfService from '../../server/services/pdfService'
import { createPrisonerServiceStub, createConditionsServiceFactoryStub } from '../mockServices'

describe('pdfService', () => {
  let licenceService
  let conditionsService
  let prisonerService
  let pdfFormatter
  let service

  const licence = {
    key: 'value',
    document: { template: { decision: 'hdc_ap_pss' } },
  }
  const licenceResponse = { licence }
  const prisonerResponse = { facialImageId: 'imageId' }
  const establishmentResponse = {}
  const imageResponse = {}
  const values = {
    OFF_NAME: 'FIRST LAST',
  }
  const templateName = 'hdc_ap_pss'
  const logger = {
    info: jest.fn(),
    error: jest.fn(),
  }

  beforeEach(() => {
    licenceService = {
      getLicence: jest.fn().mockReturnValue(licenceResponse),
      saveApprovedLicenceVersion: jest.fn().mockReturnValue({}),
      update: jest.fn().mockReturnValue({}),
    }

    conditionsService = {
      populateLicenceWithConditions: jest.fn().mockReturnValue(licence),
    } as unknown as jest.Mocked<ConditionsService>

    prisonerService = createPrisonerServiceStub()
    prisonerService.getPrisonerDetails.mockReturnValue(prisonerResponse)
    prisonerService.getEstablishmentForPrisoner.mockReturnValue(establishmentResponse)
    prisonerService.getPrisonerImage.mockReturnValue(imageResponse)

    pdfFormatter = {
      formatPdfData: jest.fn().mockReturnValue({ values }),
      DEFAULT_PLACEHOLDER: 'placeholder',
    }

    const conditionServiceFactory = createConditionsServiceFactoryStub()
    conditionServiceFactory.forLicence.mockReturnValue(conditionsService)
    service = new PdfService(logger, licenceService, conditionServiceFactory, prisonerService, pdfFormatter)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('getPdfLicenceData', () => {
    const rawLicence = {
      licence,
      approvedVersion: 1.3,
      approvedVersionDetails: { a: 'a' },
      versionDetails: { a: 'a' },
    }

    test('should request details from services and pass to formatter', async () => {
      await service.getPdfLicenceData('123', rawLicence, 'token')

      expect(conditionsService.populateLicenceWithConditions).toHaveBeenCalled()
      expect(conditionsService.populateLicenceWithConditions).toHaveBeenCalledWith(licence)

      expect(prisonerService.getPrisonerDetails).toHaveBeenCalled()
      expect(prisonerService.getPrisonerDetails).toHaveBeenCalledWith('123', 'token')

      expect(prisonerService.getEstablishmentForPrisoner).toHaveBeenCalled()
      expect(prisonerService.getEstablishmentForPrisoner).toHaveBeenCalledWith('123', 'token')

      expect(prisonerService.getPrisonerImage).toHaveBeenCalled()
      expect(prisonerService.getPrisonerImage).toHaveBeenCalledWith('imageId', 'token')

      expect(pdfFormatter.formatPdfData).toHaveBeenCalled()
      expect(pdfFormatter.formatPdfData).toHaveBeenCalledWith(
        templateName,
        {
          licence,
          prisonerInfo: prisonerResponse,
          establishment: establishmentResponse,
        },
        imageResponse,
        { a: 'a', approvedVersion: 1.3 }
      )
    })

    test('should throw if error in other service', () => {
      prisonerService.getPrisonerDetails.mockRejectedValue(new Error('dead'))
      return expect(service.getPdfLicenceData('123', rawLicence, 'token')).rejects.toEqual(Error('dead'))
    })

    test('should not try to get image data if missing facialImageId, use null instead', async () => {
      prisonerService.getPrisonerDetails.mockResolvedValue({})

      await service.getPdfLicenceData('123', rawLicence, 'token')

      expect(prisonerService.getPrisonerImage).not.toHaveBeenCalled()

      expect(pdfFormatter.formatPdfData).toHaveBeenCalled()
      expect(pdfFormatter.formatPdfData).toHaveBeenCalledWith(
        templateName,
        {
          licence,
          prisonerInfo: {},
          establishment: establishmentResponse,
        },
        null,
        { a: 'a', approvedVersion: 1.3 }
      )
    })

    test('should use null for photo if error getting image', async () => {
      prisonerService.getPrisonerImage.mockRejectedValue(new Error('dead'))

      await service.getPdfLicenceData('123', rawLicence, 'token')

      expect(prisonerService.getPrisonerImage).toHaveBeenCalled()

      expect(pdfFormatter.formatPdfData).toHaveBeenCalled()
      expect(pdfFormatter.formatPdfData).toHaveBeenCalledWith(
        templateName,
        {
          licence,
          prisonerInfo: prisonerResponse,
          establishment: establishmentResponse,
        },
        null,
        { a: 'a', approvedVersion: 1.3 }
      )
    })

    test('should take snapshot if template is different to previous version', async () => {
      const rawLicenceData = {
        licence: {
          key: 'value',
          document: {
            template: {
              decision: 'hdc_ap',
            },
          },
        },
        versionDetails: { version: 4, vary_version: 0 },
        approvedVersionDetails: { version: 4, template: 'hdc_ap_pss' },
      }

      await service.checkAndTakeSnapshot(rawLicenceData, '123')

      expect(licenceService.saveApprovedLicenceVersion).toHaveBeenCalled()
    })

    test('should take snapshot if version is different to previous version', async () => {
      const rawLicenceData = {
        licence: {
          key: 'value',
          document: {
            template: {
              decision: 'hdc_ap_pss',
            },
          },
        },
        versionDetails: { version: 4, vary_version: 0 },
        approvedVersionDetails: { version: 3, template: 'hdc_ap_pss' },
      }

      await service.checkAndTakeSnapshot(rawLicenceData, '123')

      expect(licenceService.saveApprovedLicenceVersion).toHaveBeenCalled()
    })

    test('should not take snapshot if template and version are the same', async () => {
      const rawLicenceData = {
        licence: {
          key: 'value',
          document: {
            template: {
              decision: 'hdc_ap_pss',
            },
          },
        },
        versionDetails: { version: 4, vary_version: 0 },
        approvedVersionDetails: { version: 4, template: 'hdc_ap_pss' },
      }

      await service.checkAndTakeSnapshot(rawLicenceData, '123')

      expect(licenceService.saveApprovedLicenceVersion).not.toHaveBeenCalled()
    })

    test('should write to the database when there is no licence type', async () => {
      const rawLicenceData = {
        licence: {
          key: 'value',
          document: {
            template: {
              decision: 'hdc_ap_pss',
              offenceCommittedBeforeFeb2015: 'Yes',
            },
          },
        },
        versionDetails: { version: 4, vary_version: 0 },
        approvedVersionDetails: { version: 3, template: 'hdc_ap_pss' },
      }

      const templateId = ''
      const offenceCommittedBefore = 'Yes'
      await service.updateLicenceType(rawLicenceData, '123', offenceCommittedBefore, templateId, 'token')

      expect(licenceService.update).toHaveBeenCalled()
    })

    test('should not write to the database if templateId and licece type havent changed', async () => {
      const rawLicenceData = {
        licence: {
          key: 'value',
          document: {
            template: {
              decision: '',
              offenceCommittedBeforeFeb2015: 'Yes',
            },
          },
        },
        versionDetails: { version: 4, vary_version: 0 },
        approvedVersionDetails: { version: 3, template: 'hdc_ap_pss' },
      }

      const templateId = ''
      const offenceCommittedBefore = 'Yes'
      await service.updateLicenceType(rawLicenceData, '123', offenceCommittedBefore, templateId, 'token')

      expect(licenceService.update).not.toHaveBeenCalled()
    })
  })
})
