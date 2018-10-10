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
        fakeOauth = nock(`${config.nomis.authUrl}`);
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
            fakeNomis
                .get(`/users/me`)
                .reply(200, {key: 'value', activeCaseLoadId: 'ID'});

            fakeNomis
                .get(`/users/me/roles`)
                .reply(200, [{roleCode: 'CA'}]);

            fakeNomis
                .get(`/users/me/caseLoads`)
                .reply(200, [{description: 'Prison', caseLoadId: 'ID'}, {description: 'None', caseLoadId: 'wrong'}]);

            const expectedOutput = {
                key: 'value',
                token: 'type token',
                refreshToken: 'refresh',
                role: 'CA',
                username: 'un',
                activeCaseLoadId: 'ID',
                activeCaseLoad: {description: 'Prison', caseLoadId: 'ID'},
                refreshTime: in15Mins
            };

            return expect(service.signIn('type token', 'refresh', '1200', 'un')).to.eventually.eql(expectedOutput);
        });

        it('should audit the login', async () => {
            fakeNomis
                .get(`/users/me`)
                .reply(200, {key: 'value', activeCaseLoadId: 'ID', staffId: 'staff-id'});

            fakeNomis
                .get(`/users/me/roles`)
                .reply(200, [{roleCode: 'LICENCE_CA'}]);

            fakeNomis
                .get(`/users/me/caseLoads`)
                .reply(200, [{description: 'Prison', caseLoadId: 'ID'}, {description: 'None', caseLoadId: 'wrong'}]);

            await service.signIn('type token', 'refresh', '1200', 'un');
            return expect(auditStub.record).to.be.calledWith('LOGIN', 'staff-id');
        });

        it('should get RO client credentials token when user role is RO', async () => {
            fakeOauth
                .post(`/oauth/token`, 'grant_type=client_credentials&username=UN')
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
                username: 'UN'
            };

            return expect(service.signIn('type token_2', 'refresh', '1200', 'UN')).to.eventually.eql(expectedOutput);
        });

        it('should throw if there is an error with roles api', () => {
            fakeNomis
                .get(`/users/me`)
                .reply(200, {key: 'value'});

            fakeNomis
                .get(`/users/me/roles`)
                .reply(500, [{roleCode: 'CA'}]);

            return expect(service.signIn('type token', 'refresh', '1200', 'un')).to.eventually.be.rejected();
        });

        it('should return null if there is no active caseload', () => {
            fakeNomis
                .get(`/users/me`)
                .reply(200, {key: 'value', activeCaseLoadId: 'ID'});

            fakeNomis
                .get(`/users/me/roles`)
                .reply(200, [{roleCode: 'CA'}]);

            fakeNomis
                .get(`/users/me/caseLoads`)
                .reply(500);

            const expectedOutput = {
                key: 'value',
                token: 'type token',
                refreshToken: 'refresh',
                role: 'CA',
                username: 'un',
                activeCaseLoadId: 'ID',
                activeCaseLoad: null,
                refreshTime: in15Mins
            };

            return expect(service.signIn('type token', 'refresh', '1200', 'un')).to.eventually.eql(expectedOutput);
        });

        it('should not get caseload but return null if there is no active caseload ID', () => {
            fakeNomis
                .get(`/users/me`)
                .reply(200, {key: 'value', activeCaseLoadId: ''});

            fakeNomis
                .get(`/users/me/roles`)
                .reply(200, [{roleCode: 'CA'}]);

            const expectedOutput = {
                key: 'value',
                token: 'type token',
                refreshToken: 'refresh',
                role: 'CA',
                username: 'un',
                activeCaseLoadId: '',
                activeCaseLoad: null,
                refreshTime: in15Mins
            };

            return expect(service.signIn('type token', 'refresh', '1200', 'un')).to.eventually.eql(expectedOutput);
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

    describe('find role code', () => {

        it('should find matching role code appearing at end of role', () => {
            fakeNomis
                .get(`/users/me`)
                .reply(200);

            fakeNomis
                .get(`/users/me/roles`)
                .reply(200, [{roleCode: 'ANYTHING_SOMETHING_CA'}]);

            const expectedOutput = {
                token: 'type token',
                refreshToken: 'refresh',
                role: 'CA',
                username: 'un',
                activeCaseLoad: null,
                refreshTime: in15Mins
            };

            return expect(service.signIn('type token', 'refresh', '1200', 'un')).to.eventually.eql(expectedOutput);
        });

        it('should not find matching role code appearing when not at end of role', () => {
            fakeNomis
                .get(`/users/me`)
                .reply(200);

            fakeNomis
                .get(`/users/me/roles`)
                .reply(200, [{roleCode: 'CA_DM'}]);

            const expectedOutput = {
                token: 'type token',
                refreshToken: 'refresh',
                role: 'DM',
                username: 'un',
                activeCaseLoad: null,
                refreshTime: in15Mins
            };

            return expect(service.signIn('type token', 'refresh', '1200', 'un')).to.eventually.eql(expectedOutput);
        });

    });

});
