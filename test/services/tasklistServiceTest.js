const createTasklistService = require('../../server/services/tasklistService');
const {
    sandbox,
    expect
} = require('../testSetup');

describe('taskListService', () => {

    function testUser(role) {
        return {
            staffId: '123',
            token: 'token',
            roleCode: role
        };
    }

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

    describe('getDashboardDetail', () => {

        describe('OM user role', () => {

            it('should get the prisoners for the user from delius', () => {
                service.getDashboardDetail(testUser('OM'));

                expect(deliusClient.getPrisonersFor).to.be.calledOnce();
                expect(deliusClient.getPrisonersFor).to.be.calledWith('123');
            });

            it('should request upcoming releases from nomis', async () => {
                await service.getDashboardDetail(testUser('OM'));

                expect(nomisClient.getUpcomingReleasesByOffenders).to.be.calledOnce();
                expect(nomisClient.getUpcomingReleasesByOffenders).to.be.calledWith('1, 2, 3');

                expect(nomisClient.getUpcomingReleasesByUser).to.not.be.calledOnce();
            });

            it('should return an empty if there are no upcoming releases', () => {
                nomisClient.getUpcomingReleasesByOffenders.resolves(([]));

                return expect(service.getDashboardDetail(testUser('OM'))).to.eventually.eql({});
            });
        });

        describe('OMU user role', () => {

            it('should not get the prisoners for the user from delius', () => {
                service.getDashboardDetail(testUser('OMU'));

                expect(deliusClient.getPrisonersFor).to.not.be.calledOnce();
            });

            it('should request upcoming releases from nomis', async () => {
                await service.getDashboardDetail(testUser('OMU'));

                expect(nomisClient.getUpcomingReleasesByUser).to.be.calledOnce();
                expect(nomisClient.getUpcomingReleasesByUser).to.be.calledWith();

                expect(nomisClient.getUpcomingReleasesByOffenders).to.not.be.calledOnce();
            });

            it('should return an empty if there are no upcoming releases', () => {
                nomisClient.getUpcomingReleasesByUser.resolves(([]));

                return expect(service.getDashboardDetail(testUser('OMU'))).to.eventually.eql({});
            });

        });

        describe('PM user role', () => {

            it('should not get the prisoners for the user from delius', () => {
                service.getDashboardDetail(testUser('PM'));

                expect(deliusClient.getPrisonersFor).to.not.be.calledOnce();
            });

            it('should request upcoming releases from nomis', async () => {
                await service.getDashboardDetail(testUser('PM'));

                expect(nomisClient.getUpcomingReleasesByUser).to.be.calledOnce();
                expect(nomisClient.getUpcomingReleasesByUser).to.be.calledWith();

                expect(nomisClient.getUpcomingReleasesByOffenders).to.not.be.calledOnce();
            });

            it('should return an empty if there are no upcoming releases', () => {
                nomisClient.getUpcomingReleasesByUser.resolves(([]));

                return expect(service.getDashboardDetail(testUser('PM'))).to.eventually.eql({});
            });

        });

        it('should call dbClient.getLicences if candidates returned', async () => {
            await service.getDashboardDetail(testUser('OM'));

            expect(dbClient.getLicences).to.be.calledOnce();
            expect(dbClient.getLicences).to.be.calledWith(['1', '2', '3']);

        });

        it('should add licence details if licence is in db for prisoner', () => {
            return expect(service.getDashboardDetail(testUser('OM')))
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

            return expect(service.getDashboardDetail(testUser('OM'))).to.be.rejected();
        });

        it('should throw if nomis client fails', () => {

            nomisClient.getUpcomingReleasesByOffenders.rejects(new Error('dead'));

            return expect(service.getDashboardDetail(testUser('OM'))).to.be.rejected();
        });

        it('should throw if error in db', () => {

            dbClient.getLicences.rejects(new Error('dead'));

            return expect(service.getDashboardDetail(testUser('OM'))).to.be.rejected();
        });
    });

});
