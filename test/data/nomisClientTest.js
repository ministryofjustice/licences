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

    afterEach(() => {
        nock.cleanAll();
        sandbox.reset();
    });

    describe('getUpcomingReleasesFor', () => {

        it('should return data from api', () => {
            fakeNomis
                .get(`/offender-releases?offenderNo=a`)
                .reply(200, {key: 'value'});

            return expect(nomisClient.getUpcomingReleasesFor('a', 'token')).to.eventually.eql({key: 'value'});
        });

        it('should set the page-count header to match the number of offenders', () => {
            fakeNomis
                .get(`/offender-releases?offenderNo=a&offenderNo=b&offenderNo=c`)
                .reply(function(uri, requestBody) {
                    // The documented way to specify request headers doesn't work so this is a workaround
                    if (this.req.headers['page-count'] === 3) { // eslint-disable-line
                        return 200, {key: 'value'};
                    }
                    return null;
                });

            return expect(nomisClient.getUpcomingReleasesFor(['a', 'b', 'c'], 'token'))
                .to.eventually.eql({key: 'value'});
        });

        it('should reject if api fails', () => {
            fakeNomis
                .get(`/offender-releases?offenderNo=a`)
                .reply(500);

            return expect(nomisClient.getUpcomingReleasesFor('a', 'token')).to.be.rejected();
        });
    });

    describe('getBookings', () => {

        it('should return data from api', () => {
            fakeNomis
                .get(`/bookings?query=offenderNo%3Aeq%3A%27A1235HG%27`)
                .reply(200, {key: 'value'});

            return expect(nomisClient.getBookings('A1235HG', 'token')).to.eventually.eql({key: 'value'});
        });

        it('should reject if api fails', () => {
            fakeNomis
                .get(`/bookings?query=offenderNo%3Aeq%3AA1235HG`)
                .reply(500);

            return expect(nomisClient.getBookings('A1235HG', 'token')).to.be.rejected();
        });
    });

    describe('getBooking', () => {

        it('should return data from api', () => {
            fakeNomis
                .get(`/bookings/1`)
                .reply(200, {key: 'value'});

            return expect(nomisClient.getBooking('1', 'token')).to.eventually.eql({key: 'value'});
        });

        it('should reject if api fails', () => {
            fakeNomis
                .get(`/bookings/1`)
                .reply(500);

            return expect(nomisClient.getBooking('1', 'token')).to.be.rejected();
        });
    });

    describe('getSentenceDetail', () => {

        it('should return data from api', () => {
            fakeNomis
                .get(`/bookings/1/sentenceDetail`)
                .reply(200, {key: 'value'});

            return expect(nomisClient.getSentenceDetail('1', 'token')).to.eventually.eql({key: 'value'});
        });

        it('should reject if api fails', () => {
            fakeNomis
                .get(`/bookings/1/sentenceDetail`)
                .reply(500);

            return expect(nomisClient.getSentenceDetail('1', 'token')).to.be.rejected();
        });
    });

    describe('getImageInfo', () => {

        it('should return data from api', () => {
            fakeNomis
                .get(`/images/1`)
                .reply(200, {key: 'value'});

            return expect(nomisClient.getImageInfo('1', 'token')).to.eventually.eql({key: 'value'});
        });

        it('should reject if api fails', () => {
            fakeNomis
                .get(`/images/1`)
                .reply(500);

            return expect(nomisClient.getImageInfo('1', 'token')).to.be.rejected();
        });
    });

    describe('getDischargeAddress', () => {

        it('should return data from api', () => {
            fakeNomis
                .get(`/dischargeAddress?nomisId=a`)
                .reply(200, {key: 'value'});

            return expect(nomisClient.getDischargeAddress('a', 'token')).to.eventually.eql({key: 'value'});
        });

        it('should reject if api fails', () => {
            fakeNomis
                .get(`/dischargeAddress?nomisId=a`)
                .reply(500);

            return expect(nomisClient.getDischargeAddress('a', 'token')).to.be.rejected();
        });
    });

});

