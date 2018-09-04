const proxyquire = require('proxyquire');
proxyquire.noCallThru();
const moment = require('moment');

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

        context('Start and end dates are passed in', () => {
            it('should pass in the start date and end date', () => {
                const result = audit().getEvents(
                    'ACTION', {filter1: 'a'}, moment('13-03-1985', 'DD-MM-YYYY'), moment('15-03-1985', 'DD-MM-YYYY'));

                return result.then(data => {
                    expect(queryStub.getCall(0).args[0].text).to.eql(
                        'select * from audit where action = $1 and details ' +
                        '@> $2 and timestamp >= $3 and timestamp <= $4');
                    expect(queryStub.getCall(0).args[0].values).to.eql(
                        [
                            'ACTION',
                            {filter1: 'a'},
                            moment('13-03-1985', 'DD-MM-YYYY').toISOString(),
                            moment('15-03-1985', 'DD-MM-YYYY').toISOString()
                        ]);
                });
            });

            it('should handle just a start date', () => {
                const result = audit().getEvents(
                    'ACTION', {filter1: 'a'}, moment('13-03-1985', 'DD-MM-YYYY'), null);

                return result.then(data => {
                    expect(queryStub.getCall(0).args[0].text).to.eql(
                        'select * from audit where action = $1 and details @> $2 and timestamp >= $3');
                    expect(queryStub.getCall(0).args[0].values).to.eql(
                        [
                            'ACTION',
                            {filter1: 'a'},
                            moment('13-03-1985', 'DD-MM-YYYY').toISOString()
                        ]);
                });
            });

            it('should handle just an end date', () => {
                const result = audit().getEvents(
                    'ACTION', {filter1: 'a'}, null, moment('15-03-1985', 'DD-MM-YYYY'));

                return result.then(data => {
                    expect(queryStub.getCall(0).args[0].text).to.eql(
                        'select * from audit where action = $1 and details @> $2 and timestamp <= $3');
                    expect(queryStub.getCall(0).args[0].values).to.eql(
                        [
                            'ACTION',
                            {filter1: 'a'},
                            moment('15-03-1985', 'DD-MM-YYYY').toISOString()
                        ]);
                });
            });
        });
    });
});
