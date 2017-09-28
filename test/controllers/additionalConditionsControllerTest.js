const {getIndex} = require('../../server/controllers/additionalConditionsController');

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
chai.use(sinonChai);
const sandbox = sinon.sandbox.create();

describe('additionalConditionsController', () => {
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

        it('should render the additional conditions view', () => {
            getIndex(reqMock, resMock);
            expect(resMock.render).to.have.callCount(1);
            const view = resMock.render.getCalls()[0].args[0];
            expect(view).to.eql('additionalConditions/index');
        });

        it('should pass the licenceid to the view', () => {
            getIndex(reqMock, resMock);
            expect(resMock.render).to.have.callCount(1);
            const payload = resMock.render.getCalls()[0].args[1];
            expect(payload.licenceId).to.eql('111');
        });

        it('should pass a data object to the additional conditions view', () => {
            getIndex(reqMock, resMock);
            const payload = resMock.render.getCalls()[0].args[1];
            expect(payload).to.be.an('object');
        });
    });
});
