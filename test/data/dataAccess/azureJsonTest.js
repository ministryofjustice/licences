const proxyquire = require('proxyquire');
proxyquire.noCallThru();

const {
    expect,
    sandbox
} = require('../../testSetup');

describe('Subject data', function() {

    const standardResponse = [{
        JSON1: {
            value: JSON.stringify([{
                nomisId: 'A6627JH',
                id: 4,
                licence: {
                    name: 'Bryanston, David',
                    nomisId: 'A6627JH',
                    establishment: 'HMP Birmingham',
                    dischargeDate: '2017-07-10'
                }
            }])
        }
    }];

    let getCollectionStub = sandbox.stub().callsArgWith(2, standardResponse);

    const licencesProxy = (getCollection = getCollectionStub) => {
        return proxyquire('../../../server/data/licenceClient', {
            './dataAccess/dbMethods': {
                getCollection: getCollection
            }
        });
    };

    const expectedReturnValue = [{
        nomisId: 'A6627JH',
        id: 4,
        licence: {
            name: 'Bryanston, David',
            nomisId: 'A6627JH',
            establishment: 'HMP Birmingham',
            dischargeDate: '2017-07-10'
        }
    }];

    afterEach(() => {
        sandbox.reset();
    });

    it('should return expected object when response is split', () => {

        const splitJson = standardResponse[0].JSON1.value.split(/(4)/);

        const splitResponse = [
            {
                JSON1: {value: splitJson[0], meta: 'something'}
            },
            {
                JSON2: {value: splitJson[1].concat(splitJson[2]), meta: 'somethingElse'}
            }
        ];

        const getCollectionStub = sandbox.stub().callsArgWith(2, splitResponse);
        const result = licencesProxy(getCollectionStub).getLicences(['ABC123']);

        return result.then(data => {
            expect(data).to.deep.equal(expectedReturnValue);
        });
    });

});
