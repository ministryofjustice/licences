const { createPrisonerService } = require('../../server/services/prisonerService')

describe('prisonerDetailsService', () => {
  let nomisClientMock
  let roService
  let service

  const hdcPrisonersResponse = [{ bookingId: 1, facialImageId: 2, agencyLocationId: 'ABC', middleName: 'Middle' }]
  const identifiersResponse = [{ type: 'PNC', value: 'PNC001' }, { type: 'CRO', value: 'CRO001' }]
  const aliasesResponse = [{ firstName: 'ALIAS', lastName: 'One' }, { firstName: 'AKA', lastName: 'Two' }]
  const mainOffenceResponse = [{ offenceDescription: 'Robbery, conspiracy to rob' }]
  const imageInfoResponse = { imageId: 'imgId', captureDate: '1971-11-23' }
  const imageDataResponse = Buffer.from('image')
  const establishmentResponse = { premise: 'HMP Licence Test Prison' }
  const prisonerInfoResponse = {
    bookingId: 1,
    facialImageId: 2,
    imageId: 'imgId',
    captureDate: '23/11/1971',
    aliases: 'Alias One, Aka Two',
    offences: 'Robbery, conspiracy to rob',
    com: {
      deliusId: 'delius1',
      name: 'Comfirst Comlast',
      message: null,
    },
    agencyLocationId: 'ABC',
    CRO: 'CRO001',
    PNC: 'PNC001',
    middleName: 'Middle',
  }
  const recentMovementsResponse = [{ movementType: 'REL', fromAgency: 'RELEASING AGENCY' }]

  beforeEach(() => {
    nomisClientMock = {
      getOffenderSentencesByBookingId: sinon.stub().resolves(hdcPrisonersResponse),
      getIdentifiers: sinon.stub().resolves(identifiersResponse),
      getAliases: sinon.stub().resolves(aliasesResponse),
      getMainOffence: sinon.stub().resolves(mainOffenceResponse),
      getImageInfo: sinon.stub().resolves(imageInfoResponse),
      getImageData: sinon.stub().resolves(imageDataResponse),
      getEstablishment: sinon.stub().resolves(establishmentResponse),
      getRecentMovements: sinon.stub().resolves(recentMovementsResponse),
    }
    const nomisClientBuilder = sinon.stub().returns(nomisClientMock)
    roService = {
      findResponsibleOfficer: sinon.stub().resolves({
        deliusId: 'delius1',
        name: 'Comfirst Comlast',
        message: null,
      }),
    }
    service = createPrisonerService(nomisClientBuilder, roService)
  })

  describe('getPrisonerDetails', () => {
    it('should call the api with the booking id', async () => {
      await service.getPrisonerDetails(1, 'username')

      expect(nomisClientMock.getOffenderSentencesByBookingId).to.be.calledOnce()
      expect(nomisClientMock.getAliases).to.be.calledOnce()
      expect(nomisClientMock.getMainOffence).to.be.calledOnce()
      expect(nomisClientMock.getImageInfo).to.be.calledOnce()
      expect(nomisClientMock.getIdentifiers).to.be.calledOnce()
      expect(roService.findResponsibleOfficer).to.be.calledOnce()

      expect(nomisClientMock.getOffenderSentencesByBookingId).to.be.calledWith(1)
      expect(nomisClientMock.getAliases).to.be.calledWith(1)
      expect(nomisClientMock.getMainOffence).to.be.calledWith(1)
      expect(nomisClientMock.getImageInfo).to.be.calledWith(2)
      expect(nomisClientMock.getIdentifiers).to.be.calledWith(1)
      expect(roService.findResponsibleOfficer).to.be.calledWith(1)
    })

    it('should return the result of the api call', () => {
      return expect(service.getPrisonerDetails('123', 'username')).to.eventually.eql(prisonerInfoResponse)
    })

    it('should return the only selected identifiers', () => {
      const identifiersResponseWithOthers = [
        { type: 'PNC', value: 'PNC001' },
        { type: 'IGNORE', value: 'IGNORE001' },
        { type: 'CRO', value: 'CRO001' },
      ]

      nomisClientMock.getIdentifiers.resolves(identifiersResponseWithOthers)

      return expect(service.getPrisonerDetails('123', 'username')).to.eventually.eql(prisonerInfoResponse)
    })

    it('should throw if error in api', () => {
      nomisClientMock.getOffenderSentencesByBookingId.rejects(new Error('dead'))

      return expect(service.getPrisonerDetails('123', 'username')).to.be.rejected()
    })

    it('it should return false for imageId of no image', async () => {
      const prisonerResponse2 = [{ bookingId: 1, facialImageId: null }]

      nomisClientMock.getOffenderSentencesByBookingId.resolves(prisonerResponse2)

      const result = await service.getPrisonerDetails('123', 'username')
      return expect(result.imageId).to.eql(false)
    })
  })

  describe('getPrisonerImage', () => {
    it('should call getImageData with the imageId', async () => {
      await service.getPrisonerImage('123', 'username')

      expect(nomisClientMock.getImageData).to.be.calledOnce()
      expect(nomisClientMock.getImageData).to.be.calledWith('123')
    })

    it('should return the image', async () => {
      return expect(service.getPrisonerImage('123', 'username')).to.eventually.eql(imageDataResponse)
    })
  })

  describe('getEstablishmentForPrisoner', () => {
    it('should call the api with the nomis id', async () => {
      nomisClientMock.getOffenderSentencesByBookingId.resolves(hdcPrisonersResponse)

      await service.getEstablishmentForPrisoner('123', 'username')

      expect(nomisClientMock.getOffenderSentencesByBookingId).to.be.calledOnce()
      expect(nomisClientMock.getEstablishment).to.be.calledOnce()
      expect(nomisClientMock.getOffenderSentencesByBookingId).to.be.calledWith('123')
      expect(nomisClientMock.getEstablishment).to.be.calledWith('ABC')
    })

    it('should return the result of the api call', () => {
      return expect(service.getEstablishmentForPrisoner('123', 'username')).to.eventually.eql(establishmentResponse)
    })

    it('should throw if error in api when getting offender', () => {
      nomisClientMock.getOffenderSentencesByBookingId.rejects(new Error('dead'))
      return expect(service.getEstablishmentForPrisoner('123', 'username')).to.be.rejected()
    })

    it('should throw if error in api when getting establishment', () => {
      nomisClientMock.getOffenderSentencesByBookingId.resolves(hdcPrisonersResponse)
      nomisClientMock.getEstablishment.rejects(new Error('dead'))
      return expect(service.getEstablishmentForPrisoner('123', 'username')).to.be.rejected()
    })

    it('should NOT throw but return null if 404 in api when getting establishment', () => {
      nomisClientMock.getOffenderSentencesByBookingId.resolves(hdcPrisonersResponse)
      nomisClientMock.getEstablishment.rejects({ status: 404 })
      return expect(service.getEstablishmentForPrisoner('123', 'username')).to.eventually.eql(null)
    })

    it('should throw if error in api when getting establishment if error ststus other than 404', () => {
      nomisClientMock.getOffenderSentencesByBookingId.resolves(hdcPrisonersResponse)
      nomisClientMock.getEstablishment.rejects({ status: 401 })
      return expect(service.getEstablishmentForPrisoner('123', 'username')).to.be.rejected()
    })

    it('should get latest movement if prisoner is out', async () => {
      nomisClientMock.getOffenderSentencesByBookingId.resolves([
        { bookingId: 1, facialImageId: 2, agencyLocationId: 'OUT', middleName: 'Middle' },
      ])

      await service.getEstablishmentForPrisoner('123', 'token')
      expect(nomisClientMock.getRecentMovements).to.be.calledOnce()
      expect(nomisClientMock.getEstablishment).to.be.calledWith('RELEASING AGENCY')
    })
  })

  describe('getResponsibleOfficer', () => {
    it('should call the ro service with the nomis id', async () => {
      await service.getResponsibleOfficer('123', 'username')

      expect(roService.findResponsibleOfficer).to.be.calledOnce()
      expect(roService.findResponsibleOfficer).to.be.calledWith('123')
    })
  })

  describe('getOrganisationContactDetails', () => {
    it('should get COM for RO', async () => {
      await service.getOrganisationContactDetails('RO', '123', 'token')
      expect(roService.findResponsibleOfficer).to.be.calledOnce()
    })

    it('should get establishment for CA', async () => {
      await service.getOrganisationContactDetails('CA', '123', 'token')
      expect(nomisClientMock.getEstablishment).to.be.calledOnce()
    })

    it('should not call anything for DM', async () => {
      await service.getOrganisationContactDetails('DM', '123', 'token')
      expect(nomisClientMock.getEstablishment).to.not.be.calledOnce()
      expect(roService.findResponsibleOfficer).to.not.be.calledOnce()
    })
  })
})
