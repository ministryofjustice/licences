process.env.NODE_ENV = 'test';

const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;

const audit = require('../../server/data/audit');
const app = require('../../server/app');

const proxyquire = require('proxyquire');
proxyquire.noCallThru();
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const sandbox = sinon.sandbox.create();
const TYPES = require('tedious').TYPES;

describe('Auditing', function() {

    it('should record view dashboard event', function() {
        sandbox.stub(audit, 'record');
        return request(app).get('/dashboard')
            .expect(200)
            .then(function() {
                sinon.assert.calledOnce(audit.record);
                sinon.assert.calledWith(audit.record, 'VIEW_DASHBOARD', '1');
            });
    });
});

describe('Audit', () => {
    let addRowStub = sandbox.stub().callsArgWith(2, 14);

    const record = (addRow = addRowStub) => {
        return proxyquire('../../server/data/audit', {
            './dataAccess/auditData': {
                addRow: addRow
            }
        }).record;
    };

    afterEach(() => {
        sandbox.reset();
    });

    describe('Audit keys', () => {
        it('should reject if unspecified key', () => {
            expect(() => record()('Key', 'a@y.com', {data: 'data'})).to.throw(Error);

        });

        it('should call auditData.addRow', () => {
            const result = record()('VIEW_DASHBOARD', 'a@y.com', {data: 'data'});

            return result.then(data => {
                expect(addRowStub).to.have.callCount(1);
            });
        });

        it('should pass the sql paramaters', () => {
            const result = record()('VIEW_DASHBOARD', 'a@y.com', {data: 'data'});
            const expectedParameters = [
                {column: 'user', type: TYPES.VarChar, value: 'a@y.com'},
                {column: 'action', type: TYPES.VarChar, value: 'VIEW_DASHBOARD'},
                {column: 'details', type: TYPES.VarChar, value: JSON.stringify({data: 'data'})}
            ];

            return result.then(data => {
                expect(addRowStub.getCall(0).args[1]).to.eql(expectedParameters);
            });
        });
    });
});
