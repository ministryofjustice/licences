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

describe('dashboardController', () => {
    let reqMock;
    let resMock;
    let getLicencesStub;
    let auditSpy;

    beforeEach(() => {
        reqMock = {};
        resMock = {render: sandbox.spy(), redirect: sandbox.spy()};

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

    const getIndex = ({getLicences = getLicencesStub} = {}) => {
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

        it('should render the dashboard view', () => {
            getIndex()(reqMock, resMock);
            expect(resMock.render).to.have.callCount(1);
            const view = resMock.render.getCalls()[0].args[0];
            expect(view).to.eql('dashboard/index');
        });

        it('should pass a data object to the view', () => {
            getIndex()(reqMock, resMock);
            const payload = resMock.render.getCalls()[0].args[1];
            expect(payload).to.be.an('object');
        });
    });
});
