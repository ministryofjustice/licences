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

const nock = require('nock');

describe('detailsController', () => {
    let reqMock;
    let resMock;
    let auditSpy;

    const prisonerDetailsResponse = {
        dateOfBirth: '1989-1022',
        firstName: 'Mark',
        lastName: 'Andrews',
        nomsId: 'A1235HG',
        additionalProperties: {},
        middleNames: '',
        gender: 'Male',
        location: {
            prison: 'HMP Forest Bank',
            cell: 'Cell 3',
            block: 'HB1',
            landing: 'L2'
        },
        dates: {
            sentenceExpiry: '2018-02-08',
            hdcEligibility: null,
            supervisionStart: '2017-07-09',
            supervisionEnd: '2018-07-09'
        },
        image: {
            name: 'mark_andrews.png',
            uploadedDate: '2017-04-09'
        }
    };

    beforeEach(() => {
        reqMock = {
            params: {
                nomisId: 'A1235HG'
            }
        };
        resMock = {render: sandbox.spy(), redirect: sandbox.spy()};

        nock.cleanAll();

        auditSpy = sandbox.spy();
    });

    afterEach(() => {
        sandbox.reset();
    });


    function nockResponse() {
        nock('http://localhost:9091')
            .get('/api/prisoners')
            .query({nomisId: 'A1235HG'})
            .reply(200, prisonerDetailsResponse);
    }

    const getIndex = () => {
        return proxyquire('../../server/controllers/detailsController', {
            '../data/audit': {
                record: auditSpy
            }
        }).getIndex;
    };

    describe('getIndex', () => {

        it('should render the details view', done => {
            nockResponse();
            getIndex()(reqMock, resMock).then(() => {
                expect(resMock.render).to.have.callCount(1);
                const view = resMock.render.getCalls()[0].args[0];
                expect(view).to.eql('details/index');
                done();
            }).catch(err => {
                done(err);
            });
        });

        it('should pass a data object to the details view', done => {
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
