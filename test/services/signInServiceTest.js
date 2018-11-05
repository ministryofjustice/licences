const nock = require('nock');
const config = require('../../server/config');
const createSignInService = require('../../server/authentication/signInService');

describe('prisonerDetailsService', () => {
    let service;
    let fakeNomis;
    let user = {token: 'token'};
    const audit = sinon.stub();

    beforeEach(() => {
        fakeNomis = nock(`${config.nomis.apiUrl}`);
        service = createSignInService(audit);
    });

    afterEach(() => {
        nock.cleanAll();
    });

    describe('getAllRoles', () => {
        it('should return the roles as an array', () => {
            fakeNomis
                .get(`/users/me/roles`)
                .reply(200, [{
                    roleCode: 'LEI_LICENCE_CA'
                }]);

            return expect(service.getAllRoles(user)).to.eventually.eql(['CA']);

        });

        it('should allow multiple roles', () => {
            fakeNomis
                .get(`/users/me/roles`)
                .reply(200, [{
                    roleCode: 'LEI_LICENCE_CA'
                }, {
                    roleCode: 'LEI_LICENCE_RO'
                }, {
                    roleCode: 'LEI_LICENCE_DM'
                }]);

            return expect(service.getAllRoles(user)).to.eventually.eql(['CA', 'RO', 'DM']);

        });

        it('should filter invalid roles', () => {
            fakeNomis
                .get(`/users/me/roles`)
                .reply(200, [{
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
