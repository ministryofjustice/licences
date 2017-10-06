const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
chai.use(sinonChai);
const sandbox = sinon.sandbox.create();
const proxyquire = require('proxyquire');
proxyquire.noCallThru();
const sinonStubPromise = require('sinon-stub-promise');
sinonStubPromise(sinon);

const config = require('../../server/config.js');

const nock = require('nock');

describe('dashboardController', () => {
    let reqMock;
    let resMock;
    let auditSpy;
    let getLicencesStub;

    const releasesResponse = [
        {
            name: 'Andrews, Mark',
            nomisId: 'A1235HG',
            establishment: 'HMP Manchester',
            dischargeDate: '2017-11-01'
        },
        {
            name: 'Bryanston, David',
            nomisId: 'A6627JH',
            establishment: 'HMP Birmingham',
            dischargeDate: '2017-07-10'
        }
    ];

    beforeEach(() => {
        reqMock = {};
        resMock = {render: sandbox.spy(), redirect: sandbox.spy()};

        nock.cleanAll();

        getLicencesStub = sandbox.stub().returnsPromise().resolves([
            {
                nomisId: 'A6627JH',
                id: 1,
                licence: {
                    name: 'Bryanston, David',
                    nomisId: 'A6627JH',
                    establishment: 'HMP Birmingham',
                    dischargeDate: '2017-07-10'
                }
            }
        ]);
        auditSpy = sandbox.spy();
    });

    afterEach(() => {
        sandbox.reset();
    });

    function nockResponse() {
        nock(config.licences.apiUrl)
            .get('/api/releases')
            .query({staffId: '1'})
            .reply(200, releasesResponse);
    }


    const getIndex = ({
                          getLicences = getLicencesStub
                      } = {}) => {
        return proxyquire('../../server/controllers/dashboardController', {
            '../data/licences': {
                getLicences: getLicences
            },
            '../data/audit': {
                record: auditSpy
            }
        }).getIndex;
    };


    describe('getIndex', () => {

        it('should render the dashboard view', done => {
            nockResponse();
            getIndex()(reqMock, resMock).then(() => {
                expect(resMock.render).to.have.callCount(1);
                const view = resMock.render.getCalls()[0].args[0];
                expect(view).to.eql('dashboard/index');
                done();
            }).catch(err => {
                done(err);
            });

        });

        it('should pass a data object to the dashboard view', done => {
            nockResponse();
            getIndex()(reqMock, resMock).then(() => {
                expect(resMock.render).to.have.callCount(1);
                const payload = resMock.render.getCalls()[0].args[1];
                expect(payload).to.be.an('object');
                done();
            }).catch(err => {
                done(err);
            });
        });
    });
});
