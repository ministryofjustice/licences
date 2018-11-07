const createUserService = require('../../server/services/userService');

describe('userServiceTest', () => {
    let service;
    let nomisClient;

    let user = {token: 'token'};
    const activeCaseLoads = [{
        caseLoadId: 'this'
    }, {
        caseLoadId: 'that'
    }];

    beforeEach(() => {
        nomisClient = {
            getUserRoles: sinon.stub().resolves([{
                roleCode: 'LEI_LICENCE_CA'
            }]),
            getUserCaseLoads: sinon.stub().resolves(activeCaseLoads),
            putActiveCaseLoad: sinon.stub().resolves({}),
            getLoggedInUserInfo: sinon.stub().resolves({activeCaseLoadId: 'this'})
        };
        const nomisClientBuilder = sinon.stub().returns(nomisClient);
        service = createUserService(nomisClientBuilder);
    });

    describe('getAllRoles', () => {
        it('should return the roles as an array', () => {
            return expect(service.getAllRoles(user)).to.eventually.eql(['CA']);
        });

        it('should allow multiple roles', () => {
            nomisClient.getUserRoles.resolves([{
                roleCode: 'LEI_LICENCE_CA'
            }, {
                roleCode: 'LEI_LICENCE_RO'
            }, {
                roleCode: 'LEI_LICENCE_DM'
            }]);

            return expect(service.getAllRoles(user)).to.eventually.eql(['CA', 'RO', 'DM']);

        });

        it('should filter invalid roles', () => {
            nomisClient.getUserRoles.resolves([{
                roleCode: 'LEI_LICENCE_CA'
            }, {
                roleCode: 'LEI_LICENCE_NO'
            }, {
                roleCode: 'LEI_LICENCE_RO'
            }, {
                roleCode: 'LEI_LICENCE_DM'
            }]);

            return expect(service.getAllRoles(user)).to.eventually.eql(['CA', 'RO', 'DM']);

        });
    });

    describe('setRole', () => {
        beforeEach(() => {
            user = {
                token: 'token',
                role: 'OLD'
            };
        });

        it('should set the user role to CA', async () => {
            const newUser = await service.setRole('CA', user);
            expect(newUser).to.eql({
                token: 'token',
                role: 'CA'
            });
        });

        it('should set the user role to RO', async () => {
            const newUser = await service.setRole('RO', user);
            expect(newUser).to.eql({
                token: 'token',
                role: 'RO'
            });
        });

        it('should set the user role to DM', async () => {
            const newUser = await service.setRole('DM', user);
            expect(newUser).to.eql({
                token: 'token',
                role: 'DM'
            });
        });

        it('should not set invalid roles role', async () => {
            const newUser = await service.setRole('NO', user);
            expect(newUser).to.eql({
                token: 'token',
                role: 'OLD'
            });
        });
    });

    describe('getAllCaseLoads', () => {

        it('should call getUserCaseLoads from nomis client', async () => {
            await service.getAllCaseLoads('token');
            expect(nomisClient.getUserCaseLoads).to.be.calledOnce();
        });

        it('should return results', async () => {
            const answer = await service.getAllCaseLoads('token');
            expect(answer).to.eql(activeCaseLoads);
        });

    });

    describe('setActiveCaseLoad', () => {
        it('should call putActiveCaseLoad from nomis client', async () => {
            await service.setActiveCaseLoad('id', user);
            expect(nomisClient.putActiveCaseLoad).to.be.calledOnce();
            expect(nomisClient.putActiveCaseLoad).to.be.calledWith('id');
        });

        it('should call getLoggedInUserInfo from nomis client', async () => {
            await service.setActiveCaseLoad('id', user);
            expect(nomisClient.getLoggedInUserInfo).to.be.calledOnce();
        });

        it('should call getUserCaseLoads from nomis client', async () => {
            await service.setActiveCaseLoad('id', user);
            expect(nomisClient.getUserCaseLoads).to.be.calledOnce();
        });

        it('should set the user caseload with a corresponding id', async () => {
            const result = await service.setActiveCaseLoad('id', user);
            expect(result).to.eql({
                ...user,
                activeCaseLoad: {caseLoadId: 'this'}
            });
        });
    });
});
