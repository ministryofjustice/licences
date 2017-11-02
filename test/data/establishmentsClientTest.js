const {
    nock,
    expect,
    sandbox
} = require('../supertestSetup');
const config = require('../../server/config');
const establishmentsClient = require('../../server/data/establishmentsClient');

const fakeApi = nock(`${config.establishments.apiUrl}`);

describe('establishmentsClient', function() {

    afterEach(() => {
        nock.cleanAll();
        sandbox.reset();
    });

    describe('findById', () => {

        it('should return data from api', () => {
            fakeApi
                .get(`/establishments/a`)
                .reply(200, {key: 'value'});

            return expect(establishmentsClient.findById('a')).to.eventually.eql({key: 'value'});
        });

        it('should reject if api fails', () => {
            fakeApi
                .get(`/establishments/a`)
                .reply(500);

            return expect(establishmentsClient.findById('a')).to.be.rejected();
        });
    });
});

