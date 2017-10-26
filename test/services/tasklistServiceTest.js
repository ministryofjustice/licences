const createTasklistService = require('../../server/services/tasklistService');
const {
    sandbox,
    expect
} = require('../testSetup');

describe('taskListService', () => {

    const deliusClient = {
        getPrisonersFor: sandbox.stub().returnsPromise()
    };

    const nomisClient = {
        getUpcomingReleasesFor: sandbox.stub().returnsPromise()
    };

    const nomisClientBuilder = sandbox.stub().returns(nomisClient);

    const dbClient = {
        getLicences: sandbox.stub().returnsPromise().returnsPromise().resolves()
    };

    const service = createTasklistService(deliusClient, nomisClientBuilder, dbClient);

    beforeEach(() => {
        deliusClient.getPrisonersFor.resolves('1, 2, 3');

        nomisClient.getUpcomingReleasesFor.resolves([
            {offenderNo: '1'},
            {offenderNo: '2'},
            {offenderNo: '3'}
        ]);

        dbClient.getLicences.resolves([
            {nomisId: '2', id: 'ab', status: 'STARTED'},
            {nomisId: '3', id: 'cd', status: 'SENT'}
        ]);
    });

    afterEach(() => {
        sandbox.reset();
    });

    describe('getDashboardDetail', () => {
        it('should get the prisoners for the user from delius', () => {
            service.getDashboardDetail('123');

            expect(deliusClient.getPrisonersFor).to.be.calledOnce();
            expect(deliusClient.getPrisonersFor).to.be.calledWith('123');
        });

        it('should request upcoming releases from nomis', async () => {
            await service.getDashboardDetail('123');

            expect(nomisClient.getUpcomingReleasesFor).to.be.calledOnce();
            expect(nomisClient.getUpcomingReleasesFor).to.be.calledWith('1, 2, 3');
        });

        it('should return an empty object if there are no upcoming releases', () => {
            nomisClient.getUpcomingReleasesFor.resolves(([]));

            return expect(service.getDashboardDetail('123'))
                .to.eventually.eql({});
        });

        it('should call dbClient.getLicences if candidates returned', async () => {
            await service.getDashboardDetail('123');

            expect(dbClient.getLicences).to.be.calledOnce();
            expect(dbClient.getLicences).to.be.calledWith(['1', '2', '3']);

        });

        it('should add licence details if licence is in db for prisoner', () => {
            return expect(service.getDashboardDetail('123'))
                .to.eventually.eql(
                    {
                        required: [
                            {
                                offenderNo: '1',
                                status: 'UNSTARTED'
                            },
                            {
                                licenceId: 'ab',
                                offenderNo: '2',
                                status: 'STARTED'
                            }
                        ],
                        sent: [
                            {
                                licenceId: 'cd',
                                offenderNo: '3',
                                status: 'SENT'
                            }
                        ]
                    }
                );
        });

        it('should throw if delius client fails', () => {

            deliusClient.getPrisonersFor.rejects(new Error('dead'));

            return expect(service.getDashboardDetail('123')).to.be.rejected();
        });

        it('should throw if nomis client fails', () => {

            nomisClient.getUpcomingReleasesFor.rejects(new Error('dead'));

            return expect(service.getDashboardDetail('123')).to.be.rejected();
        });

        it('should throw if error in db', () => {

            dbClient.getLicences.rejects(new Error('dead'));

            return expect(service.getDashboardDetail('123')).to.be.rejected();
        });
    });
});
