const proxyquire = require('proxyquire');
proxyquire.noCallThru();

describe('Audit', () => {
    let queryStub;

    const record = (query = queryStub) => {
        return proxyquire('../../server/data/audit', {
            './dataAccess/db': {
                query
            }
        }).record;
    };

    beforeEach(() => {
        queryStub = sinon.stub().resolves();
    });

    it('should reject if unspecified key', () => {
        expect(() => record()('Key', 'a@y.com', {data: 'data'})).to.throw(Error);
    });

    it('should call auditData.execSql', () => {
        const result = record()('LOGIN', 'a@y.com', {data: 'data'});

        return result.then(data => {
            expect(queryStub).to.have.callCount(1);
        });
    });

    it('should pass the sql paramaters', () => {
        const result = record()('LOGIN', 'a@y.com', {data: 'data'});
        const expectedParameters = ['a@y.com', 'LOGIN', {data: 'data'}];

        return result.then(data => {
            expect(queryStub.getCall(0).args[0].values).to.eql(expectedParameters);
        });
    });
});
