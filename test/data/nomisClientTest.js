const {
    nock,
    expect,
    sandbox,
    sinon,
    signInServiceStub
} = require('../supertestSetup');
const config = require('../../server/config');
const nomisClientBuilder = require('../../server/data/nomisClientBuilder');

const fakeNomis = nock(`${config.nomis.apiUrl}`);
const fakeStore = {
    get: sandbox.stub().returns(
        {token: 'token', refreshToken: 'refresh', timestamp: new Date('May 31, 2018 11:00:00').getTime()}
    ),
    store: sandbox.stub()
};


const nomisClient = nomisClientBuilder(fakeStore, signInServiceStub)('CA', 'username');

describe('nomisClient', function() {

    afterEach(() => {
        nock.cleanAll();
        sandbox.reset();
    });

    describe('getUpcomingReleasesByOffenders', () => {

        it('should return data from api', () => {
            fakeNomis
                .get(`/offender-releases?offenderNo=a`)
                .reply(200, {key: 'value'});

            return expect(nomisClient.getUpcomingReleasesByOffenders('a')).to.eventually.eql({key: 'value'});
        });

        it('should set the page-count header to match the number of offenders', () => {
            fakeNomis
                .get(`/offender-releases?offenderNo=a&offenderNo=b&offenderNo=c`)
                .reply(function(uri, requestBody) {
                    // The documented way to specify request headers doesn't work so this is a workaround
                    if (this.req.headers['page-limit'] === 3) { // eslint-disable-line
                        return 200, {key: 'value'};
                    }
                    return null;
                });

            return expect(nomisClient.getUpcomingReleasesByOffenders(['a', 'b', 'c']))
                .to.eventually.eql({key: 'value'});
        });

        it('should reject if api fails', () => {
            fakeNomis
                .get(`/offender-releases?offenderNo=a`)
                .reply(500);

            return expect(nomisClient.getUpcomingReleasesByOffenders('a')).to.be.rejected();
        });
    });

    describe('getBookings', () => {

        it('should return data from api', () => {
            fakeNomis
                .get(`/bookings?query=offenderNo%3Aeq%3A%27A1235HG%27`)
                .reply(200, {key: 'value'});

            return expect(nomisClient.getBookings('A1235HG')).to.eventually.eql({key: 'value'});
        });

        it('should reject if api fails', () => {
            fakeNomis
                .get(`/bookings?query=offenderNo%3Aeq%3AA1235HG`)
                .reply(500);

            return expect(nomisClient.getBookings('A1235HG')).to.be.rejected();
        });
    });

    describe('getBooking', () => {

        it('should return data from api', () => {
            fakeNomis
                .get(`/bookings/1`)
                .reply(200, {key: 'value'});

            return expect(nomisClient.getBooking('1')).to.eventually.eql({key: 'value'});
        });

        it('should reject if api fails', () => {
            fakeNomis
                .get(`/bookings/1`)
                .reply(500);

            return expect(nomisClient.getBooking('1')).to.be.rejected();
        });
    });

    describe('getImageInfo', () => {

        it('should return data from api', () => {
            fakeNomis
                .get(`/images/1`)
                .reply(200, {key: 'value'});

            return expect(nomisClient.getImageInfo('1')).to.eventually.eql({key: 'value'});
        });

        it('should reject if api fails', () => {
            fakeNomis
                .get(`/images/1`)
                .reply(500);

            return expect(nomisClient.getImageInfo('1')).to.be.rejected();
        });
    });

    describe('getImageData', () => {

        it('should return a buffer', () => {
            fakeNomis
                .get(`/images/1/data`)
                .reply(200, 'image');

            return expect(nomisClient.getImageData('1')).to.eventually.eql(new Buffer('image'));
        });

        it('should throw if not found', () => {
            fakeNomis
                .get(`/images/1`)
                .reply(404);

            return expect(nomisClient.getImageData('1')).to.be.rejected();
        });

        it('should throw if api fails', () => {
            fakeNomis
                .get(`/images/1`)
                .reply(500);

            return expect(nomisClient.getImageData('1')).to.be.rejected();
        });
    });

    describe('getHdcEligiblePrisoners', () => {

        const url = '/offender-sentences?query=homeDetentionCurfewEligibilityDate%3Ais%3Anot%20null%2Cand%3A' +
            'conditionalReleaseDate%3Ais%3Anot%20null';

        it('should return data from api', () => {
            fakeNomis
                .get(url)
                .reply(200, [{sentenceDetail: {conditionalReleaseDate: 'a'}}]);

            return expect(nomisClient.getHdcEligiblePrisoners()).to.eventually.eql([
                {sentenceDetail: {conditionalReleaseDate: 'a', releaseDate: 'a'}}]);
        });

        it('should reject if api fails', () => {
            fakeNomis
                .get(url)
                .reply(500);

            return expect(nomisClient.getHdcEligiblePrisoners()).to.be.rejected();
        });

        it('should set releaseDate as CRD if present', () => {
            fakeNomis
                .get(url)
                .reply(200, [
                    {sentenceDetail: {conditionalReleaseDate: 'a', automaticReleaseDate: 'b'}},
                    {sentenceDetail: {conditionalReleaseDate: 'c', automaticReleaseDate: 'd'}}
                ]);

            return expect(nomisClient.getHdcEligiblePrisoners()).to.eventually.eql([
                {sentenceDetail: {conditionalReleaseDate: 'a', automaticReleaseDate: 'b', releaseDate: 'a'}},
                {sentenceDetail: {conditionalReleaseDate: 'c', automaticReleaseDate: 'd', releaseDate: 'c'}}
            ]);
        });

        it('should set releaseDate as ARD if no CRD', () => {
            fakeNomis
                .get(url)
                .reply(200, [
                    {sentenceDetail: {automaticReleaseDate: 'b'}},
                    {sentenceDetail: {automaticReleaseDate: 'd'}}
                ]);

            return expect(nomisClient.getHdcEligiblePrisoners()).to.eventually.eql([
                {sentenceDetail: {automaticReleaseDate: 'b', releaseDate: 'b'}},
                {sentenceDetail: {automaticReleaseDate: 'd', releaseDate: 'd'}}
            ]);
        });

    });

    describe('getHdcEligiblePrisoner', () => {

        const url = '/offender-sentences?offenderNo=1';

        it('should return data from api', () => {
            fakeNomis
                .get(url)
                .reply(200, [{sentenceDetail: {conditionalReleaseDate: 'a'}}]);

            return expect(nomisClient.getHdcEligiblePrisoner('1')).to.eventually.eql([
                {sentenceDetail: {conditionalReleaseDate: 'a', releaseDate: 'a'}}]);
        });

        it('should reject if api fails', () => {
            fakeNomis
                .get(url)
                .reply(500);

            return expect(nomisClient.getHdcEligiblePrisoner('1')).to.be.rejected();
        });
    });

    describe('getAliases', () => {

        it('should return data from api', () => {
            fakeNomis
                .get(`/bookings/1/aliases`)
                .reply(200, {key: 'value'});

            return expect(nomisClient.getAliases('1')).to.eventually.eql({key: 'value'});
        });

        it('should reject if api fails', () => {
            fakeNomis
                .get(`/bookings/1/aliases`)
                .reply(500);

            return expect(nomisClient.getAliases('1')).to.be.rejected();
        });
    });

    describe('getIdentifiers', () => {

        it('should return data from api', () => {
            fakeNomis
                .get(`/bookings/1/identifiers`)
                .reply(200, [{key: '1'}, {key: '2'}]);

            return expect(nomisClient.getIdentifiers('1')).to.eventually.eql([{key: '1'}, {key: '2'}]);
        });

        it('should reject if api fails', () => {
            fakeNomis
                .get(`/bookings/1/identifiers`)
                .reply(500);

            return expect(nomisClient.getIdentifiers('1')).to.be.rejected();
        });
    });

    describe('getMainOffence', () => {

        it('should return data from api', () => {
            fakeNomis
                .get(`/bookings/1/mainOffence`)
                .reply(200, {key: 'value'});

            return expect(nomisClient.getMainOffence('1')).to.eventually.eql({key: 'value'});
        });

        it('should reject if api fails', () => {
            fakeNomis
                .get(`/bookings/1/mainOffence`)
                .reply(500);

            return expect(nomisClient.getMainOffence('1')).to.be.rejected();
        });
    });

    describe('getComRelation', () => {

        it('should return data from api', () => {
            fakeNomis
                .get(`/bookings/1/relationships?query=relationshipType%3Aeq%3A%27COM%27`)
                .reply(200, {key: 'value'});

            return expect(nomisClient.getComRelation('1')).to.eventually.eql({key: 'value'});
        });

        it('should reject if api fails', () => {
            fakeNomis
                .get(`/bookings/1/relationships?query=relationshipType%3Aeq%3A%27COM%27`)
                .reply(500);

            return expect(nomisClient.getComRelation('1')).to.be.rejected();
        });
    });

    describe('getROPrisoners', () => {

        const url = '/offender-relationships/externalRef/1/COM';

        it('should return data from api', () => {
            fakeNomis
                .get(url)
                .reply(200, {key: 'value'});

            return expect(nomisClient.getROPrisoners('1')).to.eventually.eql({key: 'value'});
        });

        it('should reject if api fails', () => {
            fakeNomis
                .get(url)
                .reply(500);

            return expect(nomisClient.getROPrisoners('1')).to.be.rejected();
        });
    });

    describe('getEstablishment', () => {

        it('should return data from api', () => {
            fakeNomis
                .get(`/agencies/prison/1`)
                .reply(200, {key: 'value'});

            return expect(nomisClient.getEstablishment('1')).to.eventually.eql({key: 'value'});
        });

        it('should reject if api fails', () => {
            fakeNomis
                .get(`/agencies/prison/1`)
                .reply(500);

            return expect(nomisClient.getEstablishment('1')).to.be.rejected();
        });
    });

    describe('token refreshing', () => {

        let clock;

        beforeEach(() => {
            clock = sinon.useFakeTimers(new Date('May 31, 2018 12:00:00').getTime());
        });

        afterEach(() => {
            clock.restore();
        });

        it('should try to refresh if it returns an unauthorised response', async () => {
            fakeNomis
                .get(`/agencies/prison/1`)
                .reply(401)
                .get(`/agencies/prison/1`)
                .reply(200, {response: 'this'});

            const result = await nomisClient.getEstablishment('1');

            expect(signInServiceStub.refresh).to.be.calledOnce();
            expect(fakeStore.get).to.be.calledTwice(); // get expired token, refresh, get new token
            expect(result).to.eql({response: 'this'});
        });

        it('should not try to refresh if not an unauthorised response', () => {
            fakeNomis
                .get(`/agencies/prison/1`)
                .reply(500)
                .get(`/agencies/prison/1`)
                .reply(200, {response: 'this'});

            return expect(nomisClient.getEstablishment('1')).to.be.rejected();
        });

        it('should not try to refresh twice in a row', () => {
            fakeNomis
                .get(`/agencies/prison/1`)
                .reply(401)
                .get(`/agencies/prison/1`)
                .reply(401, {response: 'this'});

            return expect(nomisClient.getEstablishment('1')).to.be.rejected();
        });
    });
});

