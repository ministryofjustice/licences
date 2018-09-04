const nock = require('nock');

const createUserService = require('../../server/services/admin/userService');

describe('userService', () => {

    let userClient;
    let service;

    const user1 = {
        nomis_id: 'user1',
        staff_id: 'd1',
        first_name: 'f1',
        last_name: 'l1'
    };

    const user2 = {
        nomis_id: 'user2',
        staff_id: 'd2',
        first_name: 'f2',
        last_name: 'l2'
    };

    beforeEach(() => {
        userClient = {
            getRoUsers: sinon.stub().resolves([user1, user2]),
            getRoUser: sinon.stub().resolves(user2),
            getRoUserByDeliusId: sinon.stub().resolves(user2),
            updateRoUser: sinon.stub().resolves({}),
            deleteRoUser: sinon.stub().resolves({}),
            addRoUser: sinon.stub().resolves({})
        };

        service = createUserService(userClient);
    });

    afterEach(() => {
        nock.cleanAll();
    });

    describe('getRoUsers', () => {

        it('should call user client', async () => {

            const result = await service.getRoUsers();

            expect(userClient.getRoUsers).to.be.calledOnce();
            expect(userClient.getRoUsers).to.be.calledWith();
            expect(result[0].nomis_id).to.eql('user1');
        });
    });

    describe('getRoUser', () => {

        it('should call user client with params', async () => {

            const result = await service.getRoUser('id');

            expect(userClient.getRoUser).to.be.calledOnce();
            expect(userClient.getRoUser).to.be.calledWith('id');
            expect(result.nomis_id).to.eql('user2');
        });
    });

    describe('updateRoUser', () => {

        it('should reject when user already exists', async () => {
            return expect(service.updateRoUser('nomisId', 'newNomisId', 'deliusId', 'newDeliusId', 'first', 'last'))
                .to.be.rejected();
        });

        it('should call user client with params', async () => {

            userClient.getRoUser.resolves();
            userClient.getRoUserByDeliusId.resolves();

            await service.updateRoUser('nomisId', 'newNomisId', 'deliusId', 'newDeliusId', 'first', 'last');

            expect(userClient.updateRoUser).to.be.calledOnce();
            expect(userClient.updateRoUser)
                .to.be.calledWith('nomisId', 'newNomisId', 'newDeliusId', 'first', 'last');
        });
    });

    describe('getRoUser', () => {

        it('should call user client with params', async () => {

            await service.deleteRoUser('id');

            expect(userClient.deleteRoUser).to.be.calledOnce();
            expect(userClient.deleteRoUser).to.be.calledWith('id');
        });
    });

    describe('addRoUser', () => {

        it('should reject when user already exists', async () => {
            return expect(service.addRoUser('nomisId', 'deliusId', 'first', 'last')).to.be.rejected();
        });

        it('should call user client to check for existing, then to update', async () => {

            userClient.getRoUser.resolves();
            userClient.getRoUserByDeliusId.resolves();

            await service.addRoUser('nomisId', 'deliusId', 'first', 'last');

            expect(userClient.getRoUser).to.be.calledOnce();
            expect(userClient.getRoUser).to.be.calledWith('nomisId');

            expect(userClient.addRoUser).to.be.calledOnce();
            expect(userClient.addRoUser).to.be.calledWith('nomisId', 'deliusId', 'first', 'last');
        });
    });
});
