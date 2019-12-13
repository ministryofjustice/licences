const createRoService = require('../../server/services/roService')

describe('roService', () => {
  let service
  let nomisClient
  let deliusClient

  const roResponse = [
    {
      forenames: 'COMFIRST',
      surname: 'comLast',
      staffCode: 'delius1',
      lduCode: 'code-1',
      lduDescription: 'lduDescription-1',
      nomsNumber: 'AAAA12',
      probationAreaCode: 'prob-code-1',
      probationAreaDescription: 'prob-desc-1',
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
      getStaffDetailsByStaffCode: sinon.stub().resolves({ staffCode: 'N02A008' }),
      getStaffDetailsByUsername: sinon.stub().resolves({ staffCode: 'N02A008' }),
      getAllOffenderManagers: sinon.stub(),
    }

    const nomisClientBuilder = sinon.stub().returns(nomisClient)

    service = createRoService(deliusClient, nomisClientBuilder)
  })

  describe('getStaffByCode', () => {
    it('should call getStaffByCode from deliusClient', async () => {
      await service.getStaffByCode('code-1')
      expect(deliusClient.getStaffDetailsByStaffCode).to.be.calledWith('code-1')
    })

    it('should return message when 404 in api when getting RO relationship', () => {
      deliusClient.getStaffDetailsByStaffCode.rejects({ status: 404 })
      return expect(service.getStaffByCode('code-1')).to.eventually.eql({
        code: 'STAFF_NOT_PRESENT',
        message: `Staff does not exist in delius: code-1`,
      })
    })
  })

  describe('getStaffByUsername', () => {
    it('should call getStaffByCode from deliusClient', async () => {
      await service.getStaffByUsername('code-1')
      expect(deliusClient.getStaffDetailsByUsername).to.be.calledWith('code-1')
    })

    it('should return message when 404 in api when getting RO relationship', () => {
      deliusClient.getStaffDetailsByUsername.rejects({ status: 404 })
      return expect(service.getStaffByUsername('code-1')).to.eventually.eql(null)
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

    it('should return empty array when staff member not found in delius', async () => {
      deliusClient.getROPrisoners.rejects({ status: 404 })
      const result = await service.getROPrisoners(123, 'token')
      expect(result).to.eql([])
    })
  })

  describe('findResponsibleOfficer', () => {
    it('should call the api with the offenderNo', async () => {
      deliusClient.getAllOffenderManagers.resolves([])

      await service.findResponsibleOfficer('123', 'token')

      expect(nomisClient.getBooking).to.be.calledOnce()
      expect(nomisClient.getBooking).to.be.calledWith('123')

      expect(deliusClient.getAllOffenderManagers).to.be.calledOnce()
      expect(deliusClient.getAllOffenderManagers).to.be.calledWith(1)
    })

    it('should return the found COM', () => {
      deliusClient.getAllOffenderManagers.resolves([
        {
          isResponsibleOfficer: true,
          staff: { forenames: 'Jo', surname: 'Smith' },
          staffCode: 'CODE-1',
          isUnallocated: false,
          team: { localDeliveryUnit: { code: 'LDU-1', description: 'LDU-1 Description' } },
          probationArea: { code: 'PROB-1', description: 'PROB-1 Description' },
        },
      ])

      const expectedComData = {
        deliusId: 'CODE-1',
        lduCode: 'LDU-1',
        isAllocated: true,
        lduDescription: 'LDU-1 Description',
        name: 'Jo Smith',
        nomsNumber: 1,
        probationAreaCode: 'PROB-1',
        probationAreaDescription: 'PROB-1 Description',
      }

      return expect(service.findResponsibleOfficer('123', 'token')).to.eventually.eql(expectedComData)
    })

    it('offender has not been assigned a COM', () => {
      deliusClient.getAllOffenderManagers.resolves([{ isPrisonOffenderManager: true }])

      const expectedComData = {
        code: 'NO_COM_ASSIGNED',
        message: 'Offender has not been assigned a COM: 1',
      }

      return expect(service.findResponsibleOfficer('123', 'token')).to.eventually.eql(expectedComData)
    })

    it('should throw if error in api when getting ro', () => {
      deliusClient.getAllOffenderManagers.rejects(new Error('dead'))
      return expect(service.findResponsibleOfficer('123', 'token')).to.be.rejected()
    })

    it('should throw if error in api when getting relationships if error status other than 404', () => {
      deliusClient.getAllOffenderManagers.rejects({ status: 401 })
      return expect(service.findResponsibleOfficer('123', 'token')).to.be.rejected()
    })

    it('should return message when 404 in api when getting RO relationship', () => {
      deliusClient.getAllOffenderManagers.rejects({ status: 404 })
      return expect(service.findResponsibleOfficer('123', 'token')).to.eventually.eql({
        code: 'NO_OFFENDER_NUMBER',
        message: 'Offender number not entered in delius',
      })
    })
  })
})
