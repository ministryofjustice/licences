const signInService = require('../../server/authentication/signInService');
const {
    sandbox,
    expect,
    nock
} = require('../testSetup');
const config = require('../../server/config');

const fakeNomis = nock(`${config.nomis.apiUrl}`);
const fakeOauth = nock(`${config.nomis.apiUrl.replace('/api', '')}`);
const fakeStore = {store: sandbox.stub(), get: sandbox.stub()};
const service = signInService(fakeStore);

describe('signInSAervice', () => {
    describe('signIn', () => {

        afterEach(() => {
            nock.cleanAll();
            sandbox.reset();
        });

        it('should return user object if all apis succeed', () => {
            fakeOauth
                .post(`/oauth/token`)
                .reply(200, {token_type: 'type', access_token: 'token', refresh_token: 'refresh'});

            fakeNomis
                .get(`/users/me`)
                .reply(200, {key: 'value', activeCaseLoadId: 'ID'});

            fakeNomis
                .get(`/users/me/roles`)
                .reply(200, [{roleCode: 'LICENCE'}]);

            fakeNomis
                .get(`/users/me/caseLoads`)
                .reply(200, [{description: 'Prison', caseLoadId: 'ID'}, {description: 'None', caseLoadId: 'wrong'}]);

            const expectedOutput = {
                key: 'value',
                token: 'type token',
                refreshToken: 'refresh',
                role: 'LICENCE',
                username: 'un',
                activeCaseLoadId: 'ID',
                activeCaseLoad: {description: 'Prison', caseLoadId: 'ID'}
            };

            return expect(service.signIn('un', 'pw')).to.eventually.eql(expectedOutput);
        });

        it('should add the token to the token store', async () => {

            fakeOauth
                .post(`/oauth/token`)
                .reply(200, {token_type: 'type', access_token: 'token', refresh_token: 'refresh'});

            fakeNomis
                .get(`/users/me`)
                .reply(200, {key: 'value', activeCaseLoadId: 'ID'});

            fakeNomis
                .get(`/users/me/roles`)
                .reply(200, [{roleCode: 'LICENCE_CA'}]);

            fakeNomis
                .get(`/users/me/caseLoads`)
                .reply(200, [{description: 'Prison', caseLoadId: 'ID'}, {description: 'None', caseLoadId: 'wrong'}]);

            await service.signIn('un', 'pw');
            return expect(fakeStore.store).to.be.calledWith('un', 'CA', 'type token', 'refresh');
        });

        it('should get RO client credentials token when user role is RO', async () => {

            fakeOauth
                .post(`/oauth/token`, 'grant_type=password&username=un&password=pw')
                .reply(200, {token_type: 'type', access_token: 'token', refresh_token: 'refresh'});

            fakeOauth
                .post(`/oauth/token`, 'grant_type=client_credentials&username=un')
                .reply(200, {token_type: 'type', access_token: 'token_2', refresh_token: 'refresh'});

            fakeNomis
                .get(`/users/me`)
                .reply(200, {key: 'value', activeCaseLoadId: 'ID'});

            fakeNomis
                .get(`/users/me/roles`)
                .reply(200, [{roleCode: 'LICENCE_RO'}]);

            fakeNomis
                .get(`/users/me/caseLoads`)
                .reply(200, [{description: 'Prison', caseLoadId: 'ID'}, {description: 'None', caseLoadId: 'wrong'}]);

            await service.signIn('un', 'pw');

            expect(fakeStore.store).to.be.calledOnce();
            expect(fakeStore.store).to.be.calledWith('un', 'RO', 'type token_2', 'refresh');
        });


        it('should return empty object if authentication forbidden', () => {
            nock.cleanAll();
            fakeOauth
                .post(`/oauth/token`)
                .reply(400, {token_type: 'type', access_token: 'token'});

            const expectedOutput = {};

            return expect(service.signIn('un', 'pw')).to.eventually.eql(expectedOutput);
        });

        it('should throw if there is a non 400 error with authentication', () => {
            fakeOauth
                .post(`/oauth/token`)
                .reply(500, {token_type: 'type', access_token: 'token'});

            return expect(service.signIn('un', 'pw')).to.eventually.be.rejected();
        });

        it('should throw if there is an non-200 response from user api', () => {
            fakeOauth
                .post(`/oauth/token`)
                .reply(200, {token_type: 'type', access_token: 'token'});

            fakeNomis
                .get(`/users/me`)
                .reply(300, {key: 'value'});

            return expect(service.signIn('un', 'pw')).to.eventually.be.rejected();
        });

        it('should throw if there is an error with roles api', () => {
            fakeOauth
                .post(`/oauth/token`)
                .reply(200, {token_type: 'type', access_token: 'token'});

            fakeNomis
                .get(`/users/me`)
                .reply(200, {key: 'value'});

            fakeNomis
                .get(`/users/me/roles`)
                .reply(500, [{roleCode: 'LICENCE'}]);

            return expect(service.signIn('un', 'pw')).to.eventually.be.rejected();
        });

        it('should return null if there is no active caseload', () => {
            fakeOauth
                .post(`/oauth/token`)
                .reply(200, {token_type: 'type', access_token: 'token', refresh_token: 'refresh'});

            fakeNomis
                .get(`/users/me`)
                .reply(200, {key: 'value', activeCaseLoadId: 'ID'});

            fakeNomis
                .get(`/users/me/roles`)
                .reply(200, [{roleCode: 'LICENCE'}]);

            fakeNomis
                .get(`/users/me/caseLoads`)
                .reply(500);

            const expectedOutput = {
                key: 'value',
                token: 'type token',
                refreshToken: 'refresh',
                role: 'LICENCE',
                username: 'un',
                activeCaseLoadId: 'ID',
                activeCaseLoad: null
            };

            return expect(service.signIn('un', 'pw')).to.eventually.eql(expectedOutput);
        });
    });

    describe('refresh', () => {

        it('should throw when no token exists for the user', () => {
            expect(service.refresh('un')).to.eventually.be.rejected();
        });

        it('should get and store new token using refresh token when not RO', async () => {

            fakeStore.get.returns({role: 'CA', refreshToken: 'refresh'});

            fakeOauth
                .post(`/oauth/token`, 'grant_type=refresh_token&refresh_token=refresh')
                .reply(200, {token_type: 'type', access_token: 'token', refresh_token: 'refresh'});

            await service.refresh('un');

            expect(fakeStore.store).to.be.calledWith('un', 'CA', 'type token', 'refresh');
        });

        it('should get and store new token using client credentials when RO', async () => {

            fakeStore.get.returns({role: 'RO', refreshToken: 'refresh'});

            fakeOauth
                .post(`/oauth/token`, 'grant_type=client_credentials&username=un')
                .reply(200, {token_type: 'type', access_token: 'token', refresh_token: 'refresh'});

            await service.refresh('un');

            expect(fakeStore.store).to.be.calledWith('un', 'RO', 'type token', 'refresh');
        });

        it('should throw if there is a non 400 error with authentication', () => {
            fakeOauth
                .post(`/oauth/token`)
                .reply(500, {token_type: 'type', access_token: 'token'});

            return expect(service.refresh('un')).to.eventually.be.rejected();
        });
    });
});
