const {
    nock,
    expect,
    sandbox
} = require('../supertestSetup');
const config = require('../../server/config');
const nomisClient = require('../../server/data/nomisClient');

const fakeNomis = nock(`${config.nomis.apiUrl}`);

describe('getUpcomingReleasesFor', () => {
    afterEach(() => {
        nock.cleanAll();
        sandbox.reset();
    });

    it('should return data from api', () => {
        fakeNomis
            .get('/api/v2/releases?nomisId=a')
            .reply(200, {key: 'value'});

        return expect(nomisClient.getUpcomingReleasesFor('a')).to.eventually.eql({key: 'value'});

    });

    it('should reject if api fails', () => {
        fakeNomis
            .get('/api/v2/releases?nomisId=a')
            .reply(500);

        return expect(nomisClient.getUpcomingReleasesFor('a')).to.be.rejected();

    });

});
