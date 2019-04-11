const nock = require('nock')

const createUserService = require('../../server/services/userAdminService')

describe('userAdminService', () => {
  let userClient
  let nomisClient
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

  const incomplete1 = { bookingId: 1, sentStaffCode: 'DELIUS', sentName: 'FIRST LAST LAST2' }
  const incomplete2 = { bookingId: 2 }

  beforeEach(() => {
    userClient = {
      getRoUsers: sinon.stub().resolves([user1, user2]),
      getIncompleteRoUsers: sinon.stub().resolves(),
      getRoUser: sinon.stub().resolves(user2),
      getRoUserByDeliusId: sinon.stub().resolves(user2),
      updateRoUser: sinon.stub().resolves({}),
      deleteRoUser: sinon.stub().resolves({}),
      addRoUser: sinon.stub().resolves({}),
    }

    nomisClient = {
      getUserInfo: sinon.stub().resolves({}),
      getOffenderSentencesByBookingId: sinon.stub().resolves({}),
    }

    const nomisClientBuilder = sinon.stub().returns(nomisClient)

    service = createUserService(nomisClientBuilder, userClient)
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
    it('should call user client and should not call nomisClient if no incomplete users', async () => {
      userClient.getIncompleteRoUsers = sinon.stub().resolves([])
      const result = await service.getIncompleteRoUsers()

      expect(userClient.getIncompleteRoUsers).to.be.calledOnce()
      expect(userClient.getIncompleteRoUsers).to.be.calledWith()
      expect(result).to.eql([])
      expect(nomisClient.getOffenderSentencesByBookingId).not.to.be.calledOnce()
    })

    it('should call nomisClient with incomplete users booking IDs', async () => {
      userClient.getIncompleteRoUsers = sinon.stub().resolves([incomplete1, incomplete2])
      const expectedBookingIds = [1, 2]

      await service.getIncompleteRoUsers()
      expect(nomisClient.getOffenderSentencesByBookingId).to.be.calledOnce()
      expect(nomisClient.getOffenderSentencesByBookingId).to.be.calledWith(expectedBookingIds, false)
    })

    it('should add mapping data', async () => {
      userClient.getIncompleteRoUsers = sinon.stub().resolves([incomplete1, incomplete2])
      const expected1 = {
        bookingId: 1,
        sentName: 'FIRST LAST LAST2',
        sentStaffCode: 'DELIUS',
        offenderNomis: undefined,
        mapping: {
          deliusId: 'DELIUS',
          first: 'FIRST',
          last: 'LAST LAST2',
        },
      }

      const expected2 = {
        bookingId: 2,
        offenderNomis: undefined,
        mapping: {
          deliusId: undefined,
          first: undefined,
          last: undefined,
        },
      }

      const result = await service.getIncompleteRoUsers()
      expect(result).to.eql([expected1, expected2])
    })

    it('should add offender numbers from nomis', async () => {
      userClient.getIncompleteRoUsers = sinon.stub().resolves([incomplete1, incomplete2])
      nomisClient.getOffenderSentencesByBookingId.resolves([
        { bookingId: 1, offenderNo: 'NOMIS 1' },
        { bookingId: 2, offenderNo: 'NOMIS 2' },
      ])

      const result = await service.getIncompleteRoUsers()
      expect(result[0].offenderNomis).to.eql('NOMIS 1')
      expect(result[1].offenderNomis).to.eql('NOMIS 2')
    })
  })
})
