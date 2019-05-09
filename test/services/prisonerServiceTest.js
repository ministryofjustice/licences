const { createPrisonerService } = require('../../server/services/prisonerService')

describe('prisonerDetailsService', () => {
  let nomisClientMock
  let service

  const hdcPrisonersResponse = [{ bookingId: 1, facialImageId: 2, agencyLocationId: 'ABC', middleName: 'Middle' }]
  const identifiersResponse = [{ type: 'PNC', value: 'PNC001' }, { type: 'CRO', value: 'CRO001' }]
  const aliasesResponse = [{ firstName: 'ALIAS', lastName: 'One' }, { firstName: 'AKA', lastName: 'Two' }]
  const mainOffenceResponse = [{ offenceDescription: 'Robbery, conspiracy to rob' }]
  const comRelationResponse = [
    {
      firstName: 'COMFIRST',
      lastName: 'comLast',
      personId: 'personId',
    },
  ]
  const imageInfoResponse = { imageId: 'imgId', captureDate: '1971-11-23' }
  const imageDataResponse = Buffer.from('image')
  const establishmentResponse = { premise: 'HMP Licence Test Prison' }
  const comIdentifiersResponse = [{ identifierType: 'EXTERNAL_REL', identifierValue: 'delius1' }]
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
      getRoRelations: sinon.stub().resolves(comRelationResponse),
      getPersonIdentifiers: sinon.stub().resolves(comIdentifiersResponse),
      getRecentMovements: sinon.stub().resolves(recentMovementsResponse),
    }
    const nomisClientBuilder = sinon.stub().returns(nomisClientMock)
    service = createPrisonerService(nomisClientBuilder)
  })

  describe('getPrisonerDetails', () => {
    it('should call the api with the booking id', async () => {
      await service.getPrisonerDetails(1, 'username')

      expect(nomisClientMock.getOffenderSentencesByBookingId).to.be.calledOnce()
      expect(nomisClientMock.getAliases).to.be.calledOnce()
      expect(nomisClientMock.getMainOffence).to.be.calledOnce()
      expect(nomisClientMock.getRoRelations).to.be.calledOnce()
      expect(nomisClientMock.getPersonIdentifiers).to.be.calledOnce()
      expect(nomisClientMock.getImageInfo).to.be.calledOnce()
      expect(nomisClientMock.getIdentifiers).to.be.calledOnce()

      expect(nomisClientMock.getOffenderSentencesByBookingId).to.be.calledWith(1)
      expect(nomisClientMock.getAliases).to.be.calledWith(1)
      expect(nomisClientMock.getMainOffence).to.be.calledWith(1)
      expect(nomisClientMock.getRoRelations).to.be.calledWith(1)
      expect(nomisClientMock.getPersonIdentifiers).to.be.calledWith('personId')
      expect(nomisClientMock.getImageInfo).to.be.calledWith(2)
      expect(nomisClientMock.getIdentifiers).to.be.calledWith(1)
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
    it('should call the api with the nomis id', async () => {
      await service.getResponsibleOfficer('123', 'username')

      expect(nomisClientMock.getRoRelations).to.be.calledOnce()
      expect(nomisClientMock.getRoRelations).to.be.calledWith('123')

      expect(nomisClientMock.getPersonIdentifiers).to.be.calledOnce()
      expect(nomisClientMock.getPersonIdentifiers).to.be.calledWith('personId')
    })

    it('should get person details for all relations with a person ID', async () => {
      nomisClientMock.getRoRelations.resolves([
        { personId: '1' },
        { personId: '2' },
        { personId: '3' },
        { missingPersonId: 'missing' },
      ])

      await service.getResponsibleOfficer('123', 'username')

      expect(nomisClientMock.getPersonIdentifiers).to.be.calledThrice()
      expect(nomisClientMock.getPersonIdentifiers).to.be.calledWith('1')
      expect(nomisClientMock.getPersonIdentifiers).to.be.calledWith('2')
      expect(nomisClientMock.getPersonIdentifiers).to.be.calledWith('3')
      expect(nomisClientMock.getPersonIdentifiers).not.to.be.calledWith('missing')
    })

    it('should not get person details when no relations have person ID', async () => {
      nomisClientMock.getRoRelations.resolves([{ missingPersonId: '1' }, { missingPersonId: '2' }])

      await service.getResponsibleOfficer('123', 'username')

      expect(nomisClientMock.getPersonIdentifiers).not.to.be.calledOnce()
    })

    it('should return the result of the api call', () => {
      const expectedComData = {
        com: {
          deliusId: 'delius1',
          name: 'Comfirst Comlast',
          message: null,
        },
      }

      return expect(service.getResponsibleOfficer('123', 'username')).to.eventually.eql(expectedComData)
    })

    it('should obtain delius user id from first identifer of type delius', () => {
      nomisClientMock.getPersonIdentifiers = sinon
        .stub()
        .resolves([
          { identifierType: 'EXTERNAL_REL', identifierValue: 'delius1' },
          { identifierType: 'EXTERNAL_REL', identifierValue: 'delius2' },
        ])

      const expectedComData = {
        com: {
          deliusId: 'delius1',
          name: 'Comfirst Comlast',
          message: null,
        },
      }

      return expect(service.getResponsibleOfficer('123', 'username')).to.eventually.eql(expectedComData)
    })

    it('should throw if error in api when getting relationships', () => {
      nomisClientMock.getRoRelations.rejects(new Error('dead'))
      return expect(service.getResponsibleOfficer('123', 'username')).to.be.rejected()
    })

    it('should throw if error in api when getting identifiers', () => {
      nomisClientMock.getRoRelations.resolves([{ personId: '123' }])
      nomisClientMock.getPersonIdentifiers.rejects(new Error('dead'))
      return expect(service.getResponsibleOfficer('123', 'username')).to.be.rejected()
    })

    it('should throw if error in api when getting relationships if error status other than 404', () => {
      nomisClientMock.getRoRelations.rejects({ status: 401 })
      return expect(service.getResponsibleOfficer('123', 'username')).to.be.rejected()
    })

    it('should throw if error in api when getting identifiers if error status other than 404', () => {
      nomisClientMock.getRoRelations.resolves([{ personId: '123' }])
      nomisClientMock.getPersonIdentifiers.rejects({ status: 401 })
      return expect(service.getResponsibleOfficer('123', 'username')).to.be.rejected()
    })

    it('should return message when 404 in api when getting RO relationship', () => {
      nomisClientMock.getRoRelations.rejects({ status: 404 })
      return expect(service.getResponsibleOfficer('123', 'username')).to.eventually.eql({
        com: {
          deliusId: null,
          message: 'No RO relationship',
          name: null,
        },
      })
    })

    it('should return message when 404 in api when getting person identifiers', () => {
      nomisClientMock.getRoRelations.resolves([{ personId: '123' }])
      nomisClientMock.getPersonIdentifiers.rejects({ status: 404 })
      return expect(service.getResponsibleOfficer('123', 'username')).to.eventually.eql({
        com: {
          deliusId: null,
          message: 'No RO external relationship',
          name: null,
        },
      })
    })

    const errorMessageScenarios = [
      {
        label: 'empty RO relationships',
        relationships: [],
        identifiers: {},
        message: 'No RO relationship',
      },
      {
        label: 'multiple missing person identifier',
        relationships: [{ personId: '' }, { personId: null }, { personId: undefined }],
        identifiers: {},
        message: 'No RO person identifier',
      },
      {
        label: 'missing person identifier',
        relationships: [{ personId: '' }],
        identifiers: {},
        message: 'No RO person identifier',
      },
      {
        label: 'missing person identifiers',
        relationships: [{ personId: '123' }],
        identifiers: [],
        message: 'No RO with a Delius staff code',
      },
      {
        label: 'missing external rel identifier type',
        relationships: [{ personId: '123' }],
        identifiers: [{ identifierType: 'other' }],
        message: 'No RO with a Delius staff code',
      },
      {
        label: 'missing external rel identifier value',
        relationships: [{ personId: '123' }],
        identifiers: [{ identifierType: 'EXTERNAL_REL', identifierValue: '' }],
        message: 'No RO with a Delius staff code',
      },
    ]

    errorMessageScenarios.forEach(scenario => {
      it(`should return message if ${scenario.label}`, () => {
        nomisClientMock.getRoRelations.resolves(scenario.relationships)
        nomisClientMock.getPersonIdentifiers.resolves(scenario.identifiers)
        return expect(service.getResponsibleOfficer('123', 'username')).to.eventually.eql({
          com: {
            deliusId: null,
            message: scenario.message,
            name: null,
          },
        })
      })
    })

    const sortingScenarios = [
      {
        label: 'only one person id, use that one',
        relationships: [{ personId: '' }, { personId: null }, { personId: 1 }],
        identifiers: [[{ identifierType: 'EXTERNAL_REL', identifierValue: 'delius1' }]],
        selected: 'delius1',
      },
      {
        label: 'only one delius id, use that one',
        relationships: [{ personId: 1 }, { personId: 2 }, { personId: 3 }],
        identifiers: [
          [{ identifierType: 'EXTERNAL_REL', identifierValue: null }],
          [{ identifierType: 'EXTERNAL_REL', identifierValue: 'delius2' }],
          [{}],
        ],
        selected: 'delius2',
      },
      {
        label: 'multiple delius ids, use highest person id (NB not highest delius id)',
        relationships: [{ personId: '1' }, { personId: '2' }, { personId: '3' }],
        identifiers: [
          [{ identifierType: 'EXTERNAL_REL', identifierValue: '999' }],
          [{ identifierType: 'EXTERNAL_REL', identifierValue: '1' }],
          [{ identifierType: 'EXTERNAL_REL', identifierValue: '-1' }],
        ],
        selected: '-1',
      },
      {
        label: 'multiple delius ids, use either one if same person id',
        relationships: [{ personId: 1 }, { personId: 1 }],
        identifiers: [
          [{ identifierType: 'EXTERNAL_REL', identifierValue: 'delius1' }],
          [{ identifierType: 'EXTERNAL_REL', identifierValue: 'delius1' }],
        ],
        selected: 'delius1',
      },
    ]

    sortingScenarios.forEach(scenario => {
      it(`should select person id where ${scenario.label}`, async () => {
        nomisClientMock.getRoRelations.resolves(scenario.relationships)

        scenario.identifiers.forEach((response, index) => {
          nomisClientMock.getPersonIdentifiers.onCall(index).resolves(response)
        })

        const ro = await service.getResponsibleOfficer('123', 'username')

        expect(ro.com.deliusId).to.eql(scenario.selected)
      })
    })
  })

  describe('getOrganisationContactDetails', () => {
    it('should get COM for RO', async () => {
      await service.getOrganisationContactDetails('RO', '123', 'token')
      expect(nomisClientMock.getRoRelations).to.be.calledOnce()
    })

    it('should get establishment for CA', async () => {
      await service.getOrganisationContactDetails('CA', '123', 'token')
      expect(nomisClientMock.getEstablishment).to.be.calledOnce()
    })

    it('should not call anything for DM', async () => {
      await service.getOrganisationContactDetails('DM', '123', 'token')
      expect(nomisClientMock.getEstablishment).to.not.be.calledOnce()
      expect(nomisClientMock.getRoRelations).to.not.be.calledOnce()
    })
  })
})
