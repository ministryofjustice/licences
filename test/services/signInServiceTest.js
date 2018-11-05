const createUserService = require('../../server/services/userService');

describe('userServiceTest', () => {
    let service;
    let nomisClient;

    let user = {token: 'token'};

    beforeEach(() => {
        nomisClient = {
            getUserRoles: sinon.stub().resolves([{
                roleCode: 'LEI_LICENCE_CA'
            }])
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
});
