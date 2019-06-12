const createDeliusRoService = require('../../server/services/deliusRoService')

describe('deliusRoService', () => {
  let service
  let nomisClient
  let deliusClient

  const roResponse = [
    {
      forenames: 'COMFIRST',
      surname: 'comLast',
      staffCode: 'delius1',
    },
  ]

  const roPrisoners = [{ nomsNumber: 'A' }, { nomsNumber: 'B' }, { nomsNumber: 'C' }]

  beforeEach(() => {
    nomisClient = {
      getOffenderSentencesByNomisId: sinon.stub().resolves([]),
      getBooking: sinon.stub().resolves({ offenderNo: 1 }),
    }

    deliusClient = {
      getROPrisoners: sinon.stub().resolves(roPrisoners),
      getResponsibleOfficer: sinon.stub().resolves(roResponse),
    }

    const nomisClientBuilder = sinon.stub().returns(nomisClient)

    service = createDeliusRoService(deliusClient, nomisClientBuilder)
  })

  describe('formatCom', () => {
    it('should extract first coms first and last name and capitalise', () => {
      const expectedOutput = {
        deliusId: 'deliusStaffCode',
        name: 'First Last',
        message: null,
      }

      expect(service.formatCom([{ forenames: 'first', surname: 'last', staffCode: 'deliusStaffCode' }])).to.eql(
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

      expect(service.formatCom([])).to.eql(expectedOutput)
    })
  })

  describe('getROPrisoners', () => {
    it('should call getROPrisoners from deliusClient && getOffenderSentencesByNomisId from nomisClient', async () => {
      deliusClient.getROPrisoners.resolves(roPrisoners)
      await service.getROPrisoners(123, 'token')
      expect(deliusClient.getROPrisoners).to.be.calledOnce()
      expect(nomisClient.getOffenderSentencesByNomisId).to.be.calledOnce()
      expect(nomisClient.getOffenderSentencesByNomisId).to.be.calledWith(['A', 'B', 'C'])
    })

    it('should not call getOffenderSentencesByBookingId when no results from getROPrisoners', async () => {
      deliusClient.getROPrisoners.resolves([])
      await service.getROPrisoners(123, 'token')
      expect(deliusClient.getROPrisoners).to.be.calledOnce()
      expect(nomisClient.getOffenderSentencesByNomisId).not.to.be.calledOnce()
    })

    it('should return empty array and explanation message if no eligible releases found', async () => {
      deliusClient.getROPrisoners.resolves([])
      const result = await service.getROPrisoners(123, 'token')
      expect(result).to.eql([])
    })
  })

  describe('findResponsibleOfficer', () => {
    it('should call the api with the offenderNo', async () => {
      await service.findResponsibleOfficer('123', 'token')

      expect(nomisClient.getBooking).to.be.calledOnce()
      expect(nomisClient.getBooking).to.be.calledWith('123')

      expect(deliusClient.getResponsibleOfficer).to.be.calledOnce()
      expect(deliusClient.getResponsibleOfficer).to.be.calledWith(1)
    })

    it('should return the result of the api call', () => {
      const expectedComData = {
        deliusId: 'delius1',
        name: 'Comfirst Comlast',
        message: null,
      }

      return expect(service.findResponsibleOfficer('123', 'token')).to.eventually.eql(expectedComData)
    })

    it('should throw if error in api when getting ro', () => {
      deliusClient.getResponsibleOfficer.rejects(new Error('dead'))
      return expect(service.findResponsibleOfficer('123', 'token')).to.be.rejected()
    })

    it('should throw if error in api when getting relationships if error status other than 404', () => {
      deliusClient.getResponsibleOfficer.rejects({ status: 401 })
      return expect(service.findResponsibleOfficer('123', 'token')).to.be.rejected()
    })

    it('should return message when 404 in api when getting RO relationship', () => {
      deliusClient.getResponsibleOfficer.rejects({ status: 404 })
      return expect(service.findResponsibleOfficer('123', 'token')).to.eventually.eql({
        message: 'No RO relationship',
      })
    })
  })
})
