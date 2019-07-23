const nock = require('nock')

const createPdfService = require('../../server/services/pdfService')
const config = require('../../server/config')

describe('pdfService', () => {
  let licenceService
  let conditionsService
  let prisonerService
  let pdfFormatter
  let service
  let fakePdfGenerator

  const licence = { key: 'value' }
  const licenceResponse = { licence }
  const prisonerResponse = { facialImageId: 'imageId' }
  const establishmentResponse = {}
  const imageResponse = {}
  const values = {
    OFF_NAME: 'FIRST LAST',
  }
  const pdf1AsBytes = [80, 68, 70, 45, 49]
  const templateName = 'hdc_ap_pss'
  const logger = {
    info: sinon.stub(),
    error: sinon.stub(),
  }

  beforeEach(() => {
    licenceService = {
      getLicence: sinon.stub().resolves(licenceResponse),
      saveApprovedLicenceVersion: sinon.stub().resolves({}),
      update: sinon.stub().resolves({}),
    }

    conditionsService = {
      populateLicenceWithConditions: sinon.stub().resolves(licence),
    }

    prisonerService = {
      getPrisonerDetails: sinon.stub().resolves(prisonerResponse),
      getEstablishmentForPrisoner: sinon.stub().resolves(establishmentResponse),
      getPrisonerImage: sinon.stub().resolves(imageResponse),
    }

    pdfFormatter = {
      formatPdfData: sinon.stub().resolves({ values }),
      DEFAULT_PLACEHOLDER: 'placeholder',
    }

    service = createPdfService(logger, licenceService, conditionsService, prisonerService, pdfFormatter)
    fakePdfGenerator = nock(`${config.pdf.licences.pdfServiceHost}`)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('generatePdf', () => {
    it('should call services, format data, and return as buffer', async () => {
      fakePdfGenerator.post('/generate', { templateName, values }).reply(200, pdf1AsBytes)

      const result = await service.generatePdf(templateName, '123', { licence: { key: 'value' } }, 'token', false)

      expect(conditionsService.populateLicenceWithConditions).to.be.calledOnce()
      expect(prisonerService.getPrisonerDetails).to.be.calledOnce()
      expect(prisonerService.getEstablishmentForPrisoner).to.be.calledOnce()
      expect(prisonerService.getPrisonerImage).to.be.calledOnce()
      expect(pdfFormatter.formatPdfData).to.be.calledOnce()

      expect(result).to.eql(Buffer.from(pdf1AsBytes))
    })

    it('should increment the version if first version', async () => {
      fakePdfGenerator.post('/generate', { templateName, values }).reply(200, pdf1AsBytes)

      const rawLicence = { licence: { key: 'value' } }
      await service.generatePdf(templateName, '123', rawLicence, 'username')

      expect(licenceService.saveApprovedLicenceVersion).to.be.calledOnce()
      expect(licenceService.saveApprovedLicenceVersion).to.be.calledWith('123')
      expect(licenceService.getLicence).to.be.calledOnce()
    })

    it('should increment the version if approved version is lower than current version', async () => {
      fakePdfGenerator.post('/generate', { templateName, values }).reply(200, pdf1AsBytes)

      const rawLicence = {
        licence: { key: 'value' },
        versionDetails: { version: 4, vary_version: 0 },
        approvedVersionDetails: { version: 3, vary_version: 0 },
      }
      await service.generatePdf(templateName, '123', rawLicence, 'username')

      expect(licenceService.saveApprovedLicenceVersion).to.be.calledOnce()
      expect(licenceService.saveApprovedLicenceVersion).to.be.calledWith('123')
      expect(licenceService.getLicence).to.be.calledOnce()
    })

    it('should update licence & increment version if template is different', async () => {
      fakePdfGenerator.post('/generate', { templateName: 'vary_hdc_ap_pss', values }).reply(200, pdf1AsBytes)

      const rawLicence = {
        licence: { key: 'value' },
        versionDetails: { version: 4, vary_version: 0 },
        approvedVersionDetails: { version: 4, template: 'other_template' },
      }

      await service.generatePdf('hdc_ap_pss', '123', rawLicence, 'token', true)

      expect(licenceService.update).to.be.calledOnce()
      expect(licenceService.saveApprovedLicenceVersion).to.be.calledOnce()
      expect(licenceService.saveApprovedLicenceVersion).to.be.calledWith('123')
      expect(licenceService.getLicence).to.be.calledOnce()
    })

    it('should pass postRelease to update', async () => {
      fakePdfGenerator.post('/generate', { templateName: 'vary_hdc_ap_pss', values }).reply(200, pdf1AsBytes)
      const postRelease = true

      const rawLicence = {
        licence: { key: 'value' },
        versionDetails: { version: 4, vary_version: 0 },
        approvedVersionDetails: { version: 4, template: 'other_template' },
      }

      await service.generatePdf('hdc_ap_pss', '123', rawLicence, 'token', postRelease)

      expect(licenceService.update.getCalls()[0].args[0].postRelease).to.eql(true)
    })

    it('should not update licence when incrementing version if template is same', async () => {
      fakePdfGenerator.post('/generate', { templateName, values }).reply(200, pdf1AsBytes)

      const rawLicence = {
        licence: { key: 'value' },
        versionDetails: { version: 4, vary_version: 0 },
        approvedVersionDetails: { version: 3, template: 'hdc_ap_pss' },
      }

      await service.generatePdf(templateName, '123', rawLicence, 'token')

      expect(licenceService.update).not.to.be.calledOnce()
      expect(licenceService.saveApprovedLicenceVersion).to.be.calledOnce()
      expect(licenceService.saveApprovedLicenceVersion).to.be.calledWith('123')
      expect(licenceService.getLicence).to.be.calledOnce()
    })

    it('should not update licence when incrementing version if first version', async () => {
      fakePdfGenerator.post('/generate', { templateName, values }).reply(200, pdf1AsBytes)

      const rawLicence = {
        licence: { key: 'value' },
        versionDetails: { version: 1, vary_version: 0 },
      }

      await service.generatePdf(templateName, '123', rawLicence, 'token')

      expect(licenceService.update).not.to.be.calledOnce()
      expect(licenceService.saveApprovedLicenceVersion).to.be.calledOnce()
      expect(licenceService.saveApprovedLicenceVersion).to.be.calledWith('123')
      expect(licenceService.getLicence).to.be.calledOnce()
    })
  })

  describe('getPdf', () => {
    it('Posts to PDF generator and renders response as byte buffer', async () => {
      fakePdfGenerator.post('/generate', { templateName, values }).reply(200, pdf1AsBytes)

      const result = await service.getPdf(templateName, values)
      expect(result).to.eql(Buffer.from(pdf1AsBytes))
    })

    it('should throw if error in PDF generator service', () => {
      fakePdfGenerator.post('/generate', { templateName, values }).reply(500, 'DIED')

      return expect(service.getPdf(templateName, values)).to.be.rejected()
    })
  })

  describe('getPdfLicenceData', () => {
    const rawLicence = {
      licence: { key: 'value' },
      approvedVersion: 1.3,
      approvedVersionDetails: { a: 'a' },
      versionDetails: { a: 'a' },
    }

    it('should request details from services and pass to formatter', async () => {
      await service.getPdfLicenceData(templateName, '123', rawLicence, 'token', false)

      expect(conditionsService.populateLicenceWithConditions).to.be.calledOnce()
      expect(conditionsService.populateLicenceWithConditions).to.be.calledWith(licence)

      expect(prisonerService.getPrisonerDetails).to.be.calledOnce()
      expect(prisonerService.getPrisonerDetails).to.be.calledWith('123')

      expect(prisonerService.getEstablishmentForPrisoner).to.be.calledOnce()
      expect(prisonerService.getEstablishmentForPrisoner).to.be.calledWith('123')

      expect(prisonerService.getPrisonerImage).to.be.calledOnce()
      expect(prisonerService.getPrisonerImage).to.be.calledWith('imageId')

      expect(pdfFormatter.formatPdfData).to.be.calledOnce()
      expect(pdfFormatter.formatPdfData).to.be.calledWith(
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

    it('should throw if error in other service', () => {
      prisonerService.getPrisonerDetails.rejects(new Error('dead'))
      return expect(service.getPdfLicenceData(templateName, '123', rawLicence, 'token', false)).to.be.rejected()
    })

    it('should not try to get image data if missing facialImageId, use null instead', async () => {
      prisonerService.getPrisonerDetails.resolves({})

      await service.getPdfLicenceData(templateName, '123', rawLicence, 'token', false)

      expect(prisonerService.getPrisonerImage).not.to.be.calledOnce()

      expect(pdfFormatter.formatPdfData).to.be.calledOnce()
      expect(pdfFormatter.formatPdfData).to.be.calledWith(
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

    it('should use null for photo if error getting image', async () => {
      prisonerService.getPrisonerImage.rejects(new Error('dead'))

      await service.getPdfLicenceData(templateName, '123', rawLicence, 'token', false)

      expect(prisonerService.getPrisonerImage).to.be.calledOnce()

      expect(pdfFormatter.formatPdfData).to.be.calledOnce()
      expect(pdfFormatter.formatPdfData).to.be.calledWith(
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

    it('should update licence if template and offence date check are different to previous version', async () => {
      fakePdfGenerator.post('/generate', { templateName, values }).reply(200, pdf1AsBytes)

      const rawLicenceData = {
        licence: {
          key: 'value',
          document: {
            template: {
              decision: 'hdc_ap',
              offenceCommittedBeforeFeb2015: 'No',
            },
          },
        },
        versionDetails: { version: 4, vary_version: 0 },
        approvedVersionDetails: { version: 3, template: 'hdc_ap_pss' },
      }

      await service.getPdfLicenceDataAndUpdateLicenceType(templateName, 'Yes', '123', rawLicenceData, 'token')

      expect(licenceService.update).to.be.calledOnce()
    })

    it('should not update licence if template and offence date check is same', async () => {
      fakePdfGenerator.post('/generate', { templateName, values }).reply(200, pdf1AsBytes)

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

      await service.getPdfLicenceDataAndUpdateLicenceType(templateName, 'Yes', '123', rawLicenceData, 'token')

      expect(licenceService.update).not.to.be.calledOnce()
    })

    it('should write to the database when there is no licence type', async () => {
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
      await service.updateOffenceCommittedBefore(rawLicenceData, '123', offenceCommittedBefore, templateId, 'token')

      expect(licenceService.update).to.be.calledOnce()
    })

    it('should not write to the database if templateId and licece type havent changed', async () => {
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
      await service.updateOffenceCommittedBefore(rawLicenceData, '123', offenceCommittedBefore, templateId, 'token')

      expect(licenceService.update).not.to.be.calledOnce()
    })
  })
})
