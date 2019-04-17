const nock = require('nock')

const createUserService = require('../../server/services/userAdminService')

describe('userAdminService', () => {
  let userClient
  let nomisClient
  let signInService
  let prisonerService
  let service

  const user1 = {
    nomis_id: 'user1',
    staff_id: 'd1',
    first_name: 'f1',
    last_name: 'l1',
  }

  const user2 = {
    nomis_id: 'user2',
    staff_id: 'd2',
    first_name: 'f2',
    last_name: 'l2',
  }

  beforeEach(() => {
    userClient = {
      getRoUsers: sinon.stub().resolves([user1, user2]),
      getCasesRequiringRo: sinon.stub().resolves(),
      getRoUser: sinon.stub().resolves(user2),
      getRoUserByDeliusId: sinon.stub().resolves(user2),
      updateRoUser: sinon.stub().resolves({}),
      deleteRoUser: sinon.stub().resolves({}),
      addRoUser: sinon.stub().resolves({}),
    }

    nomisClient = {
      getUserInfo: sinon.stub().resolves({}),
      getOffenderSentencesByBookingId: sinon.stub().resolves({}),
      getBooking: sinon.stub().resolves({}),
    }

    signInService = {
      getClientCredentialsTokens: sinon.stub().resolves({ token: 'system-token' }),
    }

    prisonerService = {
      getResponsibleOfficer: sinon.stub().resolves({}),
    }

    const nomisClientBuilder = sinon.stub().returns(nomisClient)

    service = createUserService(nomisClientBuilder, userClient, signInService, prisonerService)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('getRoUsers', () => {
    it('should call user client', async () => {
      const result = await service.getRoUsers()

      expect(userClient.getRoUsers).to.be.calledOnce()
      expect(userClient.getRoUsers).to.be.calledWith()
      expect(result[0].nomis_id).to.eql('user1')
    })
  })

  describe('getRoUser', () => {
    it('should call user client with params', async () => {
      const result = await service.getRoUser('id')

      expect(userClient.getRoUser).to.be.calledOnce()
      expect(userClient.getRoUser).to.be.calledWith('id')
      expect(result.nomis_id).to.eql('user2')
    })
  })

  describe('getRoUserByDeliusId', () => {
    it('should call user client with params', async () => {
      const result = await service.getRoUserByDeliusId('id')

      expect(userClient.getRoUserByDeliusId).to.be.calledOnce()
      expect(userClient.getRoUserByDeliusId).to.be.calledWith('id')
      expect(result.nomis_id).to.eql('user2')
    })
  })

  describe('updateRoUser', () => {
    it('should reject when user already exists', async () => {
      return expect(
        service.updateRoUser('nomisId', 'newNomisId', 'deliusId', 'newDeliusId', 'first', 'last')
      ).to.be.rejected()
    })

    it('should call user client with params', async () => {
      userClient.getRoUser.resolves()
      userClient.getRoUserByDeliusId.resolves()

      await service.updateRoUser('token', 'nomisId', {
        nomisId: 1,
        originalDeliusId: 2,
        deliusId: 3,
        first: 4,
        last: 5,
        organisation: 6,
        jobRole: 7,
        email: 8,
        orgEmail: 9,
        telephone: 10,
        onboarded: 11,
      })

      expect(userClient.updateRoUser).to.be.calledOnce()
      expect(userClient.updateRoUser).to.be.calledWith('nomisId', 1, 3, 4, 5, 6, 7, 8, 9, 10, 11)
    })
  })

  describe('deleteRoUser', () => {
    it('should call user client with params', async () => {
      await service.deleteRoUser('id')

      expect(userClient.deleteRoUser).to.be.calledOnce()
      expect(userClient.deleteRoUser).to.be.calledWith('id')
    })
  })

  describe('addRoUser', () => {
    it('should reject when user already exists', async () => {
      return expect(service.addRoUser('nomisId', 'deliusId', 'first', 'last')).to.be.rejected()
    })

    it('should call user client to check for existing, then to update', async () => {
      userClient.getRoUser.resolves()
      userClient.getRoUserByDeliusId.resolves()

      await service.addRoUser('token', {
        nomisId: 'nomisId',
        deliusId: 2,
        first: 3,
        last: 4,
        organisation: 5,
        jobRole: 6,
        email: 7,
        orgEmail: 8,
        telephone: 9,
        onboarded: 10,
      })

      expect(userClient.getRoUser).to.be.calledOnce()
      expect(userClient.getRoUser).to.be.calledWith('nomisId')

      expect(userClient.addRoUser).to.be.calledOnce()
      expect(userClient.addRoUser).to.be.calledWith('nomisId', 2, 3, 4, 5, 6, 7, 8, 9, 10)
    })
  })

  describe('verifyUserDetails', () => {
    it('should call nomis client with params', async () => {
      await service.verifyUserDetails('token', 'userName')

      expect(nomisClient.getUserInfo).to.be.calledOnce()
      expect(nomisClient.getUserInfo).to.be.calledWith('userName')
    })
  })

  describe('getIncompleteRoUsers', () => {
    it('should call user client but not proceed if no bookingIds', async () => {
      userClient.getCasesRequiringRo = sinon.stub().resolves([])

      const result = await service.getIncompleteRoUsers()

      expect(userClient.getCasesRequiringRo).to.be.calledOnce()
      expect(userClient.getCasesRequiringRo).to.be.calledWith()
      expect(prisonerService.getResponsibleOfficer).not.to.be.calledOnce()
      expect(result).to.eql([])
    })

    it('should call getResponsibleOfficer for each booking ID', async () => {
      userClient.getCasesRequiringRo = sinon.stub().resolves([1, 2])

      await service.getIncompleteRoUsers()

      expect(prisonerService.getResponsibleOfficer).to.be.calledTwice()
      expect(prisonerService.getResponsibleOfficer).to.be.calledWith(1, 'system-token')
      expect(prisonerService.getResponsibleOfficer).to.be.calledWith(2, 'system-token')
    })

    it('should not lookup staff records if none required', async () => {
      userClient.getCasesRequiringRo = sinon.stub().resolves([1, 2])
      prisonerService.getResponsibleOfficer = sinon.stub().resolves({})

      await service.getIncompleteRoUsers()

      expect(userClient.getRoUserByDeliusId).not.to.be.calledOnce()
    })

    it('should lookup staff record for each unique assignedId', async () => {
      userClient.getCasesRequiringRo = sinon.stub().resolves([1, 2, 3])
      prisonerService.getResponsibleOfficer = sinon.stub()
      prisonerService.getResponsibleOfficer.onCall(0).resolves({ com: { deliusId: 'delius0', name: 'deliusName0' } })
      prisonerService.getResponsibleOfficer.onCall(1).resolves({ com: { deliusId: 'delius1', name: 'deliusName1' } })
      prisonerService.getResponsibleOfficer.onCall(2).resolves({ com: { deliusId: 'delius1', name: 'deliusName2' } })

      await service.getIncompleteRoUsers()

      expect(userClient.getRoUserByDeliusId).to.be.calledTwice()
      expect(userClient.getRoUserByDeliusId).to.be.calledWith('delius0')
      expect(userClient.getRoUserByDeliusId).to.be.calledWith('delius1')
    })

    it('should add offender nomis for each incomplete', async () => {
      userClient.getCasesRequiringRo = sinon.stub().resolves([1, 2, 3])
      prisonerService.getResponsibleOfficer = sinon.stub()
      prisonerService.getResponsibleOfficer.onCall(0).resolves({ com: { deliusId: 'delius0', name: 'deliusName0' } })
      prisonerService.getResponsibleOfficer.onCall(1).resolves({ com: { deliusId: 'delius1', name: 'deliusName1' } })
      prisonerService.getResponsibleOfficer.onCall(2).resolves({ com: { deliusId: 'delius2', name: 'deliusName2' } })
      userClient.getRoUserByDeliusId = sinon.stub().resolves(null)

      await service.getIncompleteRoUsers()

      expect(nomisClient.getBooking).to.be.calledThrice()
      expect(nomisClient.getBooking).to.be.calledWith(1)
      expect(nomisClient.getBooking).to.be.calledWith(2)
      expect(nomisClient.getBooking).to.be.calledWith(3)
    })

    it('should not return if present and onboarded', async () => {
      userClient.getCasesRequiringRo = sinon.stub().resolves([1])
      prisonerService.getResponsibleOfficer = sinon.stub()
      userClient.getRoUserByDeliusId = sinon.stub().resolves({ onboarded: true })

      const result = await service.getIncompleteRoUsers()

      expect(result).to.eql([])
    })

    it('should return mapped if present but not onboarded', async () => {
      userClient.getCasesRequiringRo = sinon.stub().resolves([1])
      prisonerService.getResponsibleOfficer = sinon
        .stub()
        .resolves({ com: { deliusId: 'delius1', name: 'deliusName1' } })
      userClient.getRoUserByDeliusId = sinon.stub().resolves({ onboarded: false })
      nomisClient.getBooking = sinon.stub().resolves({ offenderNo: 'off1' })

      const result = await service.getIncompleteRoUsers()

      expect(result).to.eql([
        {
          assignedId: 'delius1',
          assignedName: 'deliusName1',
          bookingId: 1,
          mapped: true,
          offenderNo: 'off1',
          onboarded: false,
        },
      ])
    })

    it('should return unmapped if not present', async () => {
      userClient.getCasesRequiringRo = sinon.stub().resolves([1])
      prisonerService.getResponsibleOfficer = sinon
        .stub()
        .resolves({ com: { deliusId: 'delius1', name: 'deliusName1' } })
      userClient.getRoUserByDeliusId = sinon.stub().resolves(null)
      nomisClient.getBooking = sinon.stub().resolves({ offenderNo: 'off1' })

      const result = await service.getIncompleteRoUsers()

      expect(result).to.eql([
        {
          assignedId: 'delius1',
          assignedName: 'deliusName1',
          bookingId: 1,
          mapped: false,
          offenderNo: 'off1',
        },
      ])
    })
  })
})
