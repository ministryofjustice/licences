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
        getUpcomingReleasesByOffenders: sandbox.stub().returnsPromise(),
        getUpcomingReleasesByUser: sandbox.stub().returnsPromise()
    };

    const nomisClientBuilder = sandbox.stub().returns(nomisClient);

    const dbClient = {
        getLicences: sandbox.stub().returnsPromise().returnsPromise().resolves()
    };

    const service = createTasklistService(deliusClient, nomisClientBuilder, dbClient);

    const upcomingReleases = [
        {offenderNo: '1', releaseDate: '1'},
        {offenderNo: '2', releaseDate: '1'},
        {offenderNo: '3', releaseDate: '1'}
    ];

    beforeEach(() => {
        deliusClient.getPrisonersFor.resolves('1, 2, 3');

        nomisClient.getUpcomingReleasesByOffenders.resolves(upcomingReleases);

        nomisClient.getUpcomingReleasesByUser.resolves(upcomingReleases);

        dbClient.getLicences.resolves([
            {nomisId: '2', id: 'ab', status: 'STARTED'},
            {nomisId: '3', id: 'cd', status: 'SENT'}
        ]);
    });

    afterEach(() => {
        sandbox.reset();
    });

    describe('getUpcomingReleasesByDeliusOffenderList', () => {
        it('should get the prisoners for the user from delius', () => {
            service.getUpcomingReleasesByDeliusOffenderList('123');

            expect(deliusClient.getPrisonersFor).to.be.calledOnce();
            expect(deliusClient.getPrisonersFor).to.be.calledWith('123');
        });

        it('should request upcoming releases from nomis', async () => {
            await service.getUpcomingReleasesByDeliusOffenderList('123');

            expect(nomisClient.getUpcomingReleasesByOffenders).to.be.calledOnce();
            expect(nomisClient.getUpcomingReleasesByOffenders).to.be.calledWith('1, 2, 3');
        });

        it('should return an empty list if there are no upcoming releases', () => {
            nomisClient.getUpcomingReleasesByOffenders.resolves(([]));

            return expect(service.getUpcomingReleasesByDeliusOffenderList('123'))
                .to.eventually.eql([]);
        });

        it('should call dbClient.getLicences if candidates returned', async () => {
            await service.getDashboardDetail(upcomingReleases);

            expect(dbClient.getLicences).to.be.calledOnce();
            expect(dbClient.getLicences).to.be.calledWith(['1', '2', '3']);

        });

        it('should add licence details if licence is in db for prisoner', () => {
            return expect(service.getDashboardDetail(upcomingReleases))
                .to.eventually.eql(
                    {
                        required: [
                            {
                                offenderNo: '1',
                                releaseDate: '1',
                                status: 'UNSTARTED'
                            },
                            {
                                licenceId: 'ab',
                                offenderNo: '2',
                                releaseDate: '1',
                                status: 'STARTED'
                            }
                        ],
                        sent: [
                            {
                                licenceId: 'cd',
                                offenderNo: '3',
                                releaseDate: '1',
                                status: 'SENT'
                            }
                        ],
                        checking: [
                            {
                                licenceId: 'cd',
                                offenderNo: '3',
                                releaseDate: '1',
                                status: 'SENT'
                            }
                        ],
                        checkSent: [],
                        approved: []
                    }
                );
        });

        it('should throw if delius client fails', () => {

            deliusClient.getPrisonersFor.rejects(new Error('dead'));

            return expect(service.getDashboardDetail('123')).to.be.rejected();
        });

        it('should throw if nomis client fails', () => {

            nomisClient.getUpcomingReleasesByOffenders.rejects(new Error('dead'));

            return expect(service.getUpcomingReleasesByDeliusOffenderList('123')).to.be.rejected();
        });

        it('should throw if error in db', () => {

            dbClient.getLicences.rejects(new Error('dead'));

            return expect(service.getDashboardDetail('123')).to.be.rejected();
        });
    });
});
