const nock = require('nock');
const signInService = require('../../server/authentication/signInService');
const config = require('../../server/config');


describe('signInService', () => {
    let fakeOauth;
    let service;
    let clock;
    let in15Mins;

    beforeEach(() => {
        fakeOauth = nock(`${config.nomis.authUrl}`);
        service = signInService();
        clock = sinon.useFakeTimers(new Date('May 31, 2018 12:00:00').getTime());
        in15Mins = new Date('May 31, 2018 12:15:00').getTime();
    });

    afterEach(() => {
        nock.cleanAll();
        clock.restore();
    });

    describe('signIn', () => {

        it('should return the tokens if the api succeeds', () => {
            fakeOauth
                .post(`/oauth/token`)
                .reply(200, {token_type: 'type', access_token: 'token', refresh_token: 'refresh', expires_in: '1200'});

            const expectedOutput = {
                token: 'token',
                refreshToken: 'refresh',
                expiresIn: '1200'
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
    });

    describe('getRefreshedToken', () => {

        it('should get and return new token using refresh token when not RO', async () => {

            fakeOauth
                .post(`/oauth/token`, 'grant_type=refresh_token&refresh_token=refresh')
                .reply(200,
                    {token_type: 'type', access_token: 'token', refresh_token: 'refreshed', expires_in: '1200'});

            const newToken = await service.getRefreshedToken({username: 'un', role: 'CA', refreshToken: 'refresh'});

            expect(newToken).to.be.eql({refreshToken: 'refreshed', refreshTime: in15Mins, token: 'token'});
        });

    });
});
