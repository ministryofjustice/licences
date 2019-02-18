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

    beforeEach(() => {
        userClient = {
            getRoUsers: sinon.stub().resolves([user1, user2]),
            getRoUser: sinon.stub().resolves(user2),
            getRoUserByDeliusId: sinon.stub().resolves(user2),
            updateRoUser: sinon.stub().resolves({}),
            deleteRoUser: sinon.stub().resolves({}),
            addRoUser: sinon.stub().resolves({}),
        }

        nomisClient = {
            getUserInfo: sinon.stub().resolves({}),
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
            })

            expect(userClient.updateRoUser).to.be.calledOnce()
            expect(userClient.updateRoUser).to.be.calledWith('nomisId', 1, 3, 4, 5, 6, 7, 8, 9, 10)
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
            })

            expect(userClient.getRoUser).to.be.calledOnce()
            expect(userClient.getRoUser).to.be.calledWith('nomisId')

            expect(userClient.addRoUser).to.be.calledOnce()
            expect(userClient.addRoUser).to.be.calledWith('nomisId', 2, 3, 4, 5, 6, 7, 8, 9)
        })
    })

    describe('verifyUserDetails', () => {
        it('should call nomis client with params', async () => {
            await service.verifyUserDetails('token', 'userName')

            expect(nomisClient.getUserInfo).to.be.calledOnce()
            expect(nomisClient.getUserInfo).to.be.calledWith('userName')
        })
    })
})
