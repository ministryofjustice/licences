const createNomisRoService = require('../../server/services/nomisRoService')

describe('nomisRoService', () => {
  let service
  let nomisClient

  const comRelationResponse = [
    {
      firstName: 'COMFIRST',
      lastName: 'comLast',
      personId: 'personId',
    },
  ]

  const comIdentifiersResponse = [{ identifierType: 'EXTERNAL_REL', identifierValue: 'delius1' }]

  const roPrisoners = [{ bookingId: 'A' }, { bookingId: 'B' }, { bookingId: 'C' }]

  beforeEach(() => {
    nomisClient = {
      getOffenderSentencesByBookingId: sinon.stub().resolves([]),
      getRoRelations: sinon.stub().resolves(comRelationResponse),
      getPersonIdentifiers: sinon.stub().resolves(comIdentifiersResponse),
      getROPrisoners: sinon.stub().resolves(roPrisoners),
    }

    const nomisClientBuilder = sinon.stub().returns(nomisClient)

    service = createNomisRoService(nomisClientBuilder)
  })

  describe('formatCom', () => {
    it('should extract first coms first and last name and capitalise', () => {
      const expectedOutput = {
        deliusId: 'deliusStaffCode',
        name: 'First Last',
        message: null,
      }

      expect(service.formatCom({ firstName: 'first', lastName: 'last', deliusId: 'deliusStaffCode' })).to.eql(
        expectedOutput
      )
    })

    it('should give nulls if com missing', () => {
      const expectedOutput = {
        deliusId: null,
        name: null,
        message: null,
      }

      expect(service.formatCom(undefined)).to.eql(expectedOutput)
    })

    it('should give nulls if com empty', () => {
      const expectedOutput = {
        deliusId: null,
        name: null,
        message: null,
      }

      expect(service.formatCom({})).to.eql(expectedOutput)
    })
  })

  describe('getROPrisoners', () => {
    it('should call getROPrisoners && getOffenderSentencesByBookingId from nomisClient', async () => {
      nomisClient.getROPrisoners.resolves(roPrisoners)
      await service.getROPrisoners(123, 'token')
      expect(nomisClient.getROPrisoners).to.be.calledOnce()
      expect(nomisClient.getROPrisoners).to.be.calledWith(123)
      expect(nomisClient.getOffenderSentencesByBookingId).to.be.calledOnce()
      expect(nomisClient.getOffenderSentencesByBookingId).to.be.calledWith(['A', 'B', 'C'])
    })

    it('should not call getOffenderSentencesByBookingId when no results from getROPrisoners', async () => {
      nomisClient.getROPrisoners.resolves([])
      await service.getROPrisoners(123, 'token')
      expect(nomisClient.getROPrisoners).to.be.calledOnce()
      expect(nomisClient.getOffenderSentencesByBookingId).not.to.be.calledOnce()
    })

    it('should return empty array and explanation message if no eligible releases found', async () => {
      nomisClient.getROPrisoners.resolves([])
      const result = await service.getROPrisoners(123, 'token')
      expect(result).to.eql([])
    })
  })

  describe('findResponsibleOfficer', () => {
    it('should call the api with the nomis id', async () => {
      await service.findResponsibleOfficer('123', 'token')

      expect(nomisClient.getRoRelations).to.be.calledOnce()
      expect(nomisClient.getRoRelations).to.be.calledWith('123')

      expect(nomisClient.getPersonIdentifiers).to.be.calledOnce()
      expect(nomisClient.getPersonIdentifiers).to.be.calledWith('personId')
    })

    it('should get person details for all relations with a person ID', async () => {
      nomisClient.getRoRelations.resolves([
        { personId: '1' },
        { personId: '2' },
        { personId: '3' },
        { missingPersonId: 'missing' },
      ])

      await service.findResponsibleOfficer('123', 'token')

      expect(nomisClient.getPersonIdentifiers).to.be.calledThrice()
      expect(nomisClient.getPersonIdentifiers).to.be.calledWith('1')
      expect(nomisClient.getPersonIdentifiers).to.be.calledWith('2')
      expect(nomisClient.getPersonIdentifiers).to.be.calledWith('3')
      expect(nomisClient.getPersonIdentifiers).not.to.be.calledWith('missing')
    })

    it('should not get person details when no relations have person ID', async () => {
      nomisClient.getRoRelations.resolves([{ missingPersonId: '1' }, { missingPersonId: '2' }])

      await service.findResponsibleOfficer('123', 'token')

      expect(nomisClient.getPersonIdentifiers).not.to.be.calledOnce()
    })

    it('should return the result of the api call', () => {
      const expectedComData = {
        deliusId: 'delius1',
        name: 'Comfirst Comlast',
        message: null,
      }

      return expect(service.findResponsibleOfficer('123', nomisClient)).to.eventually.eql(expectedComData)
    })

    it('should obtain delius user id from first identifer of type delius', () => {
      nomisClient.getPersonIdentifiers = sinon
        .stub()
        .resolves([
          { identifierType: 'EXTERNAL_REL', identifierValue: 'delius1' },
          { identifierType: 'EXTERNAL_REL', identifierValue: 'delius2' },
        ])

      const expectedComData = {
        deliusId: 'delius1',
        name: 'Comfirst Comlast',
        message: null,
      }

      return expect(service.findResponsibleOfficer('123', 'token')).to.eventually.eql(expectedComData)
    })

    it('should throw if error in api when getting relationships', () => {
      nomisClient.getRoRelations.rejects(new Error('dead'))
      return expect(service.findResponsibleOfficer('123', 'token')).to.be.rejected()
    })

    it('should throw if error in api when getting identifiers', () => {
      nomisClient.getRoRelations.resolves([{ personId: '123' }])
      nomisClient.getPersonIdentifiers.rejects(new Error('dead'))
      return expect(service.findResponsibleOfficer('123', 'token')).to.be.rejected()
    })

    it('should throw if error in api when getting relationships if error status other than 404', () => {
      nomisClient.getRoRelations.rejects({ status: 401 })
      return expect(service.findResponsibleOfficer('123', 'token')).to.be.rejected()
    })

    it('should throw if error in api when getting identifiers if error status other than 404', () => {
      nomisClient.getRoRelations.resolves([{ personId: '123' }])
      nomisClient.getPersonIdentifiers.rejects({ status: 401 })
      return expect(service.findResponsibleOfficer('123', 'token')).to.be.rejected()
    })

    it('should return message when 404 in api when getting RO relationship', () => {
      nomisClient.getRoRelations.rejects({ status: 404 })
      return expect(service.findResponsibleOfficer('123', 'token')).to.eventually.eql({
        message: 'No RO relationship',
      })
    })

    it('should return message when 404 in api when getting person identifiers', () => {
      nomisClient.getRoRelations.resolves([{ personId: '123' }])
      nomisClient.getPersonIdentifiers.rejects({ status: 404 })
      return expect(service.findResponsibleOfficer('123', 'token')).to.eventually.eql({
        message: 'No RO external relationship',
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
        nomisClient.getRoRelations.resolves(scenario.relationships)
        nomisClient.getPersonIdentifiers.resolves(scenario.identifiers)
        return expect(service.findResponsibleOfficer('123', 'token')).to.eventually.eql({
          message: scenario.message,
        })
      })
    })

    it('should get the only delius ID of multiple persons but only one with delius ID', async () => {
      const relations = [{ personId: 1 }, { personId: 2 }, { personId: 3 }]
      const person1 = [{ identifierType: 'EXTERNAL_REL', identifierValue: null }]
      const person2 = [{ identifierType: 'EXTERNAL_REL', identifierValue: 'delius2' }]
      const person3 = [{ identifierType: 'EXTERNAL_REL', identifierValue: null }]

      nomisClient.getRoRelations.resolves(relations)
      nomisClient.getPersonIdentifiers.withArgs(1).resolves(person1)
      nomisClient.getPersonIdentifiers.withArgs(2).resolves(person2)
      nomisClient.getPersonIdentifiers.withArgs(3).resolves(person3)

      const ro = await service.findResponsibleOfficer('123', 'token')

      expect(ro.deliusId).to.eql('delius2')
    })

    it('should get the delius ID for the highest person ID when multiple persons with delius IDs', async () => {
      const relations = [{ personId: 1 }, { personId: 2 }, { personId: 3 }]
      const person1 = [{ identifierType: 'EXTERNAL_REL', identifierValue: '999' }]
      const person2 = [{ identifierType: 'EXTERNAL_REL', identifierValue: '1' }]
      const person3 = [{ identifierType: 'EXTERNAL_REL', identifierValue: '-1' }]

      nomisClient.getRoRelations.resolves(relations)
      nomisClient.getPersonIdentifiers.withArgs(1).resolves(person1)
      nomisClient.getPersonIdentifiers.withArgs(2).resolves(person2)
      nomisClient.getPersonIdentifiers.withArgs(3).resolves(person3)

      const ro = await service.findResponsibleOfficer('123', 'token')

      expect(ro.deliusId).to.eql('-1')
    })

    it('should get the available delius ID when duplicate person IDs', async () => {
      const relations = [{ personId: 1 }, { personId: 1 }]
      const person1 = [{ identifierType: 'EXTERNAL_REL', identifierValue: null }]
      const person2 = [{ identifierType: 'EXTERNAL_REL', identifierValue: 'delius1' }]

      nomisClient.getRoRelations.resolves(relations)
      nomisClient.getPersonIdentifiers.onCall(0).resolves(person1)
      nomisClient.getPersonIdentifiers.onCall(1).resolves(person2)

      const ro = await service.findResponsibleOfficer('123', 'token')

      expect(ro.deliusId).to.eql('delius1')
    })

    it('should get the delius ID of the only available person ID', async () => {
      const relations = [{ personId: '' }, { personId: null }, { personId: 1 }]
      const identifiers = [{ identifierType: 'EXTERNAL_REL', identifierValue: 'delius1' }]

      nomisClient.getRoRelations.resolves(relations)
      nomisClient.getPersonIdentifiers.withArgs(1).resolves(identifiers)

      const ro = await service.findResponsibleOfficer('123', 'token')

      expect(ro.deliusId).to.eql('delius1')
    })
  })
})
