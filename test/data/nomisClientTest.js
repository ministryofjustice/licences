const {
    nock,
    expect,
    sandbox
} = require('../supertestSetup');
const config = require('../../server/config');
const nomisClientBuilder = require('../../server/data/nomisClientBuilder');

const fakeNomis = nock(`${config.nomis.apiUrl}`);

const nomisClient = nomisClientBuilder('token');

describe('nomisClient', function() {

    describe('getUpcomingReleasesFor', () => {

        afterEach(() => {
            nock.cleanAll();
            sandbox.reset();
        });

        it('should return data from api', () => {
            fakeNomis
                .get('/api/v2/releases?nomisId=a')
                .reply(200, {key: 'value'});

            return expect(nomisClient.getUpcomingReleasesFor('a', 'token')).to.eventually.eql({key: 'value'});
        });

        it('should reject if api fails', () => {
            fakeNomis
                .get('/api/v2/releases?nomisId=a')
                .reply(500);

            return expect(nomisClient.getUpcomingReleasesFor('a', 'token')).to.be.rejected();
        });
    });

    describe('getBookings', () => {
        afterEach(() => {
            nock.cleanAll();
            sandbox.reset();
        });

        it('should return data from api', () => {
            fakeNomis
                .get('/api/v2/bookings?query=offenderNo%3Aeq%3AA1235HG')
                .reply(200, {key: 'value'});

            return expect(nomisClient.getBookings('A1235HG', 'token')).to.eventually.eql({key: 'value'});
        });

        it('should reject if api fails', () => {
            fakeNomis
                .get('/api/v2/bookings?query=offenderNo%3Aeq%3AA1235HG')
                .reply(500);

            return expect(nomisClient.getBookings('A1235HG', 'token')).to.be.rejected();
        });
    });

    describe('getBooking', () => {
        afterEach(() => {
            nock.cleanAll();
            sandbox.reset();
        });

        it('should return data from api', () => {
            fakeNomis
                .get('/api/v2/bookings/1')
                .reply(200, {key: 'value'});

            return expect(nomisClient.getBooking('1', 'token')).to.eventually.eql({key: 'value'});
        });

        it('should reject if api fails', () => {
            fakeNomis
                .get('/api/v2/bookings/1')
                .reply(500);

            return expect(nomisClient.getBooking('1', 'token')).to.be.rejected();
        });
    });

    describe('getSentenceDetail', () => {
        afterEach(() => {
            nock.cleanAll();
            sandbox.reset();
        });

        it('should return data from api', () => {
            fakeNomis
                .get('/api/v2/bookings/1/sentenceDetail')
                .reply(200, {key: 'value'});

            return expect(nomisClient.getSentenceDetail('1', 'token')).to.eventually.eql({key: 'value'});
        });

        it('should reject if api fails', () => {
            fakeNomis
                .get('/api/v2/bookings/1/sentenceDetail')
                .reply(500);

            return expect(nomisClient.getSentenceDetail('1', 'token')).to.be.rejected();
        });
    });

    describe('getImageInfo', () => {
        afterEach(() => {
            nock.cleanAll();
            sandbox.reset();
        });

        it('should return data from api', () => {
            fakeNomis
                .get('/api/v2/images/1')
                .reply(200, {key: 'value'});

            return expect(nomisClient.getImageInfo('1', 'token')).to.eventually.eql({key: 'value'});
        });

        it('should reject if api fails', () => {
            fakeNomis
                .get('/api/v2/images/1')
                .reply(500);

            return expect(nomisClient.getImageInfo('1', 'token')).to.be.rejected();
        });
    });

});

