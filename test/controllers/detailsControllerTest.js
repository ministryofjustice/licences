const {getIndex} = require('../../server/controllers/detailsController');

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
chai.use(sinonChai);
const sandbox = sinon.sandbox.create();

describe('detailsController', () => {
    let reqMock;
    let resMock;

    beforeEach(() => {
        reqMock = {};
        resMock = {render: sandbox.spy(), redirect: sandbox.spy()};
    });

    afterEach(() => {
        sandbox.reset();
    });

    describe('getIndex', () => {

        it('should render the details view', () => {
            getIndex(reqMock, resMock);
            expect(resMock.render).to.have.callCount(1);
            const view = resMock.render.getCalls()[0].args[0];
            expect(view).to.eql('details/index');
        });

        it('should pass a data object to the details view', () => {
            getIndex(reqMock, resMock);
            const payload = resMock.render.getCalls()[0].args[1];
            expect(payload).to.be.an('object');
        });
    });
});
