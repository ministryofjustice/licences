const nock = require('nock');
const signInService = require('../../server/authentication/signInService');
const config = require('../../server/config');


describe('signInService', () => {
    let fakeNomis;
    let fakeOauth;
    let service;
    let auditStub;
    let clock;
    let in15Mins;

    beforeEach(() => {
        fakeNomis = nock(`${config.nomis.apiUrl}`);
        fakeOauth = nock(`${config.nomis.apiUrl.replace('/api', '')}`);
        auditStub = {record: sinon.stub()};
        service = signInService(auditStub);
        clock = sinon.useFakeTimers(new Date('May 31, 2018 12:00:00').getTime());
        in15Mins = new Date('May 31, 2018 12:15:00').getTime();
    });

    afterEach(() => {
        nock.cleanAll();
        clock.restore();
    });

    describe('signIn', () => {

        it('should return user object if all apis succeed', () => {
            fakeOauth
                .post(`/oauth/token`)
                .reply(200, {token_type: 'type', access_token: 'token', refresh_token: 'refresh', expires_in: '1200'});

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
                activeCaseLoad: {description: 'Prison', caseLoadId: 'ID'},
                refreshTime: in15Mins
            };

            return expect(service.signIn('un', 'pw')).to.eventually.eql(expectedOutput);
        });

        it('should audit the login', async () => {
            fakeOauth
                .post(`/oauth/token`)
                .reply(200, {token_type: 'type', access_token: 'token', refresh_token: 'refresh'});

            fakeNomis
                .get(`/users/me`)
                .reply(200, {key: 'value', activeCaseLoadId: 'ID', staffId: 'staff-id'});

            fakeNomis
                .get(`/users/me/roles`)
                .reply(200, [{roleCode: 'LICENCE_CA'}]);

            fakeNomis
                .get(`/users/me/caseLoads`)
                .reply(200, [{description: 'Prison', caseLoadId: 'ID'}, {description: 'None', caseLoadId: 'wrong'}]);

            await service.signIn('un', 'pw');
            return expect(auditStub.record).to.be.calledWith('LOGIN', 'staff-id');
        });

        it('should get RO client credentials token when user role is RO', async () => {
            fakeOauth
                .post(`/oauth/token`, 'grant_type=password&username=un&password=pw')
                .reply(200, {token_type: 'type', access_token: 'token', refresh_token: 'refresh', expires_in: '1200'});

            fakeOauth
                .post(`/oauth/token`, 'grant_type=client_credentials&username=un')
                .reply(200,
                    {token_type: 'type', access_token: 'token_2', refresh_token: 'refresh', expires_in: '1200'});

            fakeNomis
                .get(`/users/me`)
                .reply(200, {key: 'value', activeCaseLoadId: 'ID'});

            fakeNomis
                .get(`/users/me/roles`)
                .reply(200, [{roleCode: 'LICENCE_RO'}]);

            fakeNomis
                .get(`/users/me/caseLoads`)
                .reply(200, [{description: 'Prison', caseLoadId: 'ID'}, {description: 'None', caseLoadId: 'wrong'}]);

            const expectedOutput = {
                activeCaseLoad: {
                    caseLoadId: 'ID',
                    description: 'Prison'
                },
                activeCaseLoadId: 'ID',
                key: 'value',
                refreshTime: in15Mins,
                refreshToken: 'refresh',
                role: 'RO',
                token: 'type token_2',
                username: 'un'
            };

            return expect(service.signIn('un', 'pw')).to.eventually.eql(expectedOutput);

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
                .reply(200, {token_type: 'type', access_token: 'token', refresh_token: 'refresh', expires_in: '1200'});

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
                activeCaseLoad: null,
                refreshTime: in15Mins
            };

            return expect(service.signIn('un', 'pw')).to.eventually.eql(expectedOutput);
        });
    });

    describe('getRefreshedToken', () => {

        it('should get and return new token using refresh token when not RO', async () => {

            fakeOauth
                .post(`/oauth/token`, 'grant_type=refresh_token&refresh_token=refresh')
                .reply(200,
                    {token_type: 'type', access_token: 'token', refresh_token: 'refreshed', expires_in: '1200'});

            const newToken = await service.getRefreshedToken({username: 'un', role: 'CA', refreshToken: 'refresh'});

            expect(newToken).to.be.eql({refreshToken: 'refreshed', refreshTime: in15Mins, token: 'type token'});
        });

        it('should get and store new token using client credentials when RO', async () => {

            fakeOauth
                .post(`/oauth/token`, 'grant_type=client_credentials&username=un')
                .reply(200,
                    {token_type: 'type', access_token: 'token', refresh_token: 'refreshed', expires_in: '1200'});

            const newToken = await service.getRefreshedToken({username: 'un', role: 'RO', refreshToken: 'refresh'});

            expect(newToken).to.be.eql({refreshToken: 'refreshed', refreshTime: in15Mins, token: 'type token'});
        });

    });
});
