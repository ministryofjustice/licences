const {getIndex} = require('../../server/controllers/licenceDetailsController');

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
chai.use(sinonChai);
const sandbox = sinon.sandbox.create();

describe('licenceDetailsController', () => {
    let reqMock;
    let resMock;

    beforeEach(() => {
        reqMock = {params: {licenceId: '111'}};
        resMock = {render: sandbox.spy(), redirect: sandbox.spy()};
    });

    afterEach(() => {
        sandbox.reset();
    });

    describe('getIndex', () => {

        it('should render the licence details view', () => {
            getIndex(reqMock, resMock);
            expect(resMock.render).to.have.callCount(1);
            const view = resMock.render.getCalls()[0].args[0];
            expect(view).to.eql('licenceDetails/index');
        });

        it('should pass a data object to the licence details view', () => {
            getIndex(reqMock, resMock);
            const payload = resMock.render.getCalls()[0].args[1];
            expect(payload).to.be.an('object');
        });
    });
});
