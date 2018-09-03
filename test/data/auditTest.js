const proxyquire = require('proxyquire');
proxyquire.noCallThru();

describe('Audit', () => {
    let queryStub;

    const audit = (query = queryStub) => {
        return proxyquire('../../server/data/audit', {
            './dataAccess/db': {
                query
            }
        });
    };

    describe('record', () => {
        beforeEach(() => {
            queryStub = sinon.stub().resolves();
        });

        it('should reject if unspecified key', () => {
            expect(() => audit().record('Key', 'a@y.com', {data: 'data'})).to.throw(Error);
        });

        it('should call auditData.execSql', () => {
            const result = audit().record('LOGIN', 'a@y.com', {data: 'data'});

            return result.then(data => {
                expect(queryStub).to.have.callCount(1);
            });
        });

        it('should pass the sql parameters', () => {
            const result = audit().record('LOGIN', 'a@y.com', {data: 'data'});
            const expectedParameters = ['a@y.com', 'LOGIN', {data: 'data'}];

            return result.then(data => {
                expect(queryStub.getCall(0).args[0].values).to.eql(expectedParameters);
            });
        });
    });


    describe('getEvents', () => {
        beforeEach(() => {
            queryStub = sinon.stub().resolves([]);
        });

        it('should call auditData.execSql', () => {
            const result = audit().getEvents('ACTION', {filter1: 'a', filter2: 'b'});

            return result.then(data => {
                expect(queryStub).to.have.callCount(1);
            });
        });

        it('should pass in the correct query', () => {
            const result = audit().getEvents('ACTION', {filter1: 'a', filter2: 'b'});

            return result.then(data => {
                expect(queryStub.getCall(0).args[0].text).to.eql(
                    'select * from audit where action = $1 and details @> $2');
                expect(queryStub.getCall(0).args[0].values).to.eql(['ACTION', {filter1: 'a', filter2: 'b'}]);
            });
        });
    });
});
