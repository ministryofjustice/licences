const proxyquire = require('proxyquire');
proxyquire.noCallThru();

describe('userClient', () => {
    let queryStub;

    const user1 = {
        nomis_id: 'user1',
        staff_id: 'd1',
        first_name: 'f1',
        last_name: 'l1'
    };

    const user2 = {
        nomis_id: 'user2',
        staff_id: 'd2',
        first_name: 'f2',
        last_name: 'l2'
    };

    const standardResponse = {rows: [{user1, user2}]};
    const userProxy = (query = queryStub) => {
        return proxyquire('../../server/data/userClient', {
            './dataAccess/db': {
                query
            }
        });
    };

    beforeEach(() => {
        queryStub = sinon.stub().resolves(standardResponse);
    });


    describe('getRoUsers', function() {

        it('should call query', () => {
            userProxy().getRoUsers();
            expect(queryStub).to.have.callCount(1);
        });

    });

    describe('getRoUser', function() {

        it('should call query', () => {
            userProxy().getRoUser('id');
            expect(queryStub).to.have.callCount(1);
        });

        it('should pass in the correct sql and params', () => {

            const expectedClause = 'where nomis_id = $1';

            const result = userProxy().getRoUser('id');

            return result.then(data => {
                const call = queryStub.getCalls()[0].args[0];
                expect(call.text).includes(expectedClause);
                expect(call.values).to.eql(['id']);
            });
        });
    });

    describe('getRoUserByDeliusId', function() {

        it('should call query', () => {
            userProxy().getRoUserByDeliusId('id');
            expect(queryStub).to.have.callCount(1);
        });

        it('should pass in the correct sql and params', () => {

            const expectedClause = 'where staff_id = $1';

            const result = userProxy().getRoUserByDeliusId('id');

            return result.then(data => {
                const call = queryStub.getCalls()[0].args[0];
                expect(call.text).includes(expectedClause);
                expect(call.values).to.eql(['id']);
            });
        });
    });

    describe('updateRoUser', function() {

        it('should pass in the correct sql and params', () => {

            const expectedUpdateClause = 'update staff_ids';
            const expectedSetClause = 'set nomis_id = $2, staff_id = $3, first_name = $4, last_name = $5';
            const expectedWhereClause = 'where nomis_id = $1';

            const result = userProxy().updateRoUser(
                'nomisId', 'newNomisId', 'newDeliusId', 'first', 'last', 'org', 'role', 'email', 'phone');

            return result.then(data => {
                const call = queryStub.getCalls()[0].args[0];
                expect(call.text).includes(expectedUpdateClause);
                expect(call.text).includes(expectedSetClause);
                expect(call.text).includes(expectedWhereClause);
                expect(call.values).to.eql([
                    'nomisId', 'newNomisId', 'newDeliusId', 'first', 'last', 'org', 'role', 'email', 'phone']);
            });
        });
    });

    describe('deleteRoUser', function() {

        it('should pass in the correct sql and params', () => {

            const expectedClause = 'delete from staff_ids where nomis_id = $1';

            const result = userProxy().deleteRoUser('nomisId');

            return result.then(data => {
                const call = queryStub.getCalls()[0].args[0];
                expect(call.text).includes(expectedClause);
                expect(call.values).to.eql(['nomisId']);
            });
        });
    });

    describe('addRoUser', function() {

        it('should pass in the correct sql and params', () => {

            const expectedInsertClause = 'insert into staff_ids';
            const expectedColsClause =
                '(nomis_id, staff_id, first_name, last_name, organisation, job_role, email, telephone)';
            const expectedValuesClause = 'values($1, $2, $3, $4, $5, $6, $7, $8)';

            const result = userProxy().addRoUser(
                'nomisId', 'deliusId', 'first', 'last', 'org', 'role', 'email', 'phone');

            return result.then(data => {
                const call = queryStub.getCalls()[0].args[0];
                expect(call.text).includes(expectedInsertClause);
                expect(call.text).includes(expectedColsClause);
                expect(call.text).includes(expectedValuesClause);
                expect(call.values).to.eql([
                    'nomisId', 'deliusId', 'first', 'last', 'org', 'role', 'email', 'phone']);
            });
        });
    });

    describe('findRoUsers', function() {

        it('should pass in the correct sql and params with wildcard searchterm', () => {

            const expectedSelectClause = 'select * from staff_ids';

            const expectedWhereClauses = [
                'upper(nomis_id) like upper($1) or',
                'upper(staff_id) like upper($1) or',
                'upper(first_name) like upper($1) or',
                'upper(last_name) like upper($1) or',
                'upper(organisation) like upper($1) or',
                'upper(job_role) like upper($1) or',
                'upper(email) like upper($1) or',
                'upper(telephone) like upper($1)'
            ];

            const expectedOrderByClause = 'order by nomis_id asc';

            const result = userProxy().findRoUsers('searchTerm');

            return result.then(data => {
                const call = queryStub.getCalls()[0].args[0];
                expect(call.text).includes(expectedSelectClause);
                expectedWhereClauses.forEach(clause => expect(call.text).includes(clause));
                expect(call.text).includes(expectedOrderByClause);
                expect(call.values).to.eql(['%searchTerm%']);
            });
        });
    });
});

