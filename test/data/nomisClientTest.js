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

    describe('getUpcomingReleasesByOffenders', () => {

        it('should return data from api', () => {
            fakeNomis
                .get(`/offender-releases?offenderNo=a`)
                .reply(200, {key: 'value'});

            return expect(nomisClient.getUpcomingReleasesByOffenders('a', 'token')).to.eventually.eql({key: 'value'});
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

            return expect(nomisClient.getUpcomingReleasesByOffenders(['a', 'b', 'c'], 'token'))
                .to.eventually.eql({key: 'value'});
        });

        it('should reject if api fails', () => {
            fakeNomis
                .get(`/offender-releases?offenderNo=a`)
                .reply(500);

            return expect(nomisClient.getUpcomingReleasesByOffenders('a', 'token')).to.be.rejected();
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
                .reply(200, {key: 'value'});

            return expect(nomisClient.getHdcEligiblePrisoners()).to.eventually.eql({key: 'value'});
        });

        it('should set the headers to sort ascending', () => {
            fakeNomis
                .get(url)
                .reply(function(uri, requestBody) {
                    // The documented way to specify request headers doesn't work so this is a workaround
                    if (this.req.headers['sort-order'] === 'ASC') { // eslint-disable-line
                        return 200, {key: 'value'};
                    }
                    return null;
                });

            return expect(nomisClient.getHdcEligiblePrisoners())
                .to.eventually.eql({key: 'value'});
        });

        it('should set the headers to sort by hdced then crd', () => {
            const sortFields = 'homeDetentionCurfewEligibilityDate,conditionalReleaseDate';
            const nomisIds = ['1'];
            const urlWithIds = '/offender-sentences?query=homeDetentionCurfewEligibilityDate%3Ais%3Anot%20null' +
                '%2Cand%3AconditionalReleaseDate%3Ais%3Anot%20null&offenderNo=1';

            fakeNomis
                .get(urlWithIds)
                .reply(function(uri, requestBody) {
                    // The documented way to specify request headers doesn't work so this is a workaround
                    if (this.req.headers['sort-field'] === sortFields) { // eslint-disable-line
                        return 200, {key: 'value'};
                    }
                    return null;
                });

            return expect(nomisClient.getHdcEligiblePrisoners(nomisIds))
                .to.eventually.eql({key: 'value'});
        });

        it('should set the headers to control result count', () => {
            fakeNomis
                .get(url)
                .reply(function(uri, requestBody) {
                    // The documented way to specify request headers doesn't work so this is a workaround
                    if (this.req.headers['page-limit'] === 100) { // eslint-disable-line
                        return 200, {key: 'value'};
                    }
                    return null;
                });

            return expect(nomisClient.getHdcEligiblePrisoners())
                .to.eventually.eql({key: 'value'});
        });

        it('should reject if api fails', () => {
            fakeNomis
                .get(url)
                .reply(500);

            return expect(nomisClient.getHdcEligiblePrisoners()).to.be.rejected();
        });
    });

    describe('getHdcEligiblePrisoner', () => {

        const url = '/offender-sentences?offenderNo=1';

        it('should return data from api', () => {
            fakeNomis
                .get(url)
                .reply(200, {key: 'value'});

            return expect(nomisClient.getHdcEligiblePrisoner('1', 'token')).to.eventually.eql({key: 'value'});
        });

        it('should reject if api fails', () => {
            fakeNomis
                .get(url)
                .reply(500);

            return expect(nomisClient.getHdcEligiblePrisoner('1', 'token')).to.be.rejected();
        });
    });

    describe('getAliases', () => {

        it('should return data from api', () => {
            fakeNomis
                .get(`/bookings/1/aliases`)
                .reply(200, {key: 'value'});

            return expect(nomisClient.getAliases('1', 'token')).to.eventually.eql({key: 'value'});
        });

        it('should reject if api fails', () => {
            fakeNomis
                .get(`/bookings/1/aliases`)
                .reply(500);

            return expect(nomisClient.getAliases('1', 'token')).to.be.rejected();
        });
    });

    describe('getMainOffence', () => {

        it('should return data from api', () => {
            fakeNomis
                .get(`/bookings/1/mainOffence`)
                .reply(200, {key: 'value'});

            return expect(nomisClient.getMainOffence('1', 'token')).to.eventually.eql({key: 'value'});
        });

        it('should reject if api fails', () => {
            fakeNomis
                .get(`/bookings/1/mainOffence`)
                .reply(500);

            return expect(nomisClient.getMainOffence('1', 'token')).to.be.rejected();
        });
    });

    describe('getComRelation', () => {

        it('should return data from api', () => {
            fakeNomis
                .get(`/bookings/1/relationships?query=relationshipType%3Aeq%3A%27COM%27`)
                .reply(200, {key: 'value'});

            return expect(nomisClient.getComRelation('1', 'token')).to.eventually.eql({key: 'value'});
        });

        it('should reject if api fails', () => {
            fakeNomis
                .get(`/bookings/1/relationships?query=relationshipType%3Aeq%3A%27COM%27`)
                .reply(500);

            return expect(nomisClient.getComRelation('1', 'token')).to.be.rejected();
        });
    });

    describe('getROPrisoners', () => {

        const url = '/offender-relationships/externalRef/1/COM';

        it('should return data from api', () => {
            fakeNomis
                .get(url)
                .reply(200, {key: 'value'});

            return expect(nomisClient.getROPrisoners('1', 'token')).to.eventually.eql({key: 'value'});
        });

        it('should reject if api fails', () => {
            fakeNomis
                .get(url)
                .reply(500);

            return expect(nomisClient.getROPrisoners('1', 'token')).to.be.rejected();
        });
    });

    describe('getEstablishment', () => {

        it('should return data from api', () => {
            fakeNomis
                .get(`/agencies/prison/1`)
                .reply(200, {key: 'value'});

            return expect(nomisClient.getEstablishment('1', 'token')).to.eventually.eql({key: 'value'});
        });

        it('should reject if api fails', () => {
            fakeNomis
                .get(`/agencies/prison/1`)
                .reply(500);

            return expect(nomisClient.getEstablishment('1', 'token')).to.be.rejected();
        });
    });
});

