const proxyquire = require('proxyquire');
proxyquire.noCallThru();
const TYPES = require('tedious').TYPES;

const {
    expect,
    sandbox
} = require('../testSetup');


describe('Audit', () => {

    let addRowStub = sandbox.stub().callsArgWith(2, 14);

    const record = (addRow = addRowStub) => {
        return proxyquire('../../server/data/audit', {
            './dataAccess/dbMethods': {
                addRow: addRow
            }
        }).record;
    };

    afterEach(() => {
        sandbox.reset();
    });

    it('should reject if unspecified key', () => {
        expect(() => record()('Key', 'a@y.com', {data: 'data'})).to.throw(Error);

    });

    it('should call auditData.addRow', () => {
        const result = record()('VIEW_TASKLIST', 'a@y.com', {data: 'data'});

        return result.then(data => {
            expect(addRowStub).to.have.callCount(1);
        });
    });

    it('should pass the sql paramaters', () => {
        const result = record()('VIEW_TASKLIST', 'a@y.com', {data: 'data'});
        const expectedParameters = [
            {column: 'user', type: TYPES.VarChar, value: 'a@y.com'},
            {column: 'action', type: TYPES.VarChar, value: 'VIEW_TASKLIST'},
            {column: 'details', type: TYPES.VarChar, value: JSON.stringify({data: 'data'})}
        ];

        return result.then(data => {
            expect(addRowStub.getCall(0).args[1]).to.eql(expectedParameters);
        });
    });
});
