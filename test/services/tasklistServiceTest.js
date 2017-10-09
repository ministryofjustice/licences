const createPrisonerDetailsService = require('../../server/services/tasklistService');
const {
    sandbox,
    expect
} = require('./testSetup');

describe('prisonerDetailsService', () => {

    const apiMock = {
        getUpcomingReleases: sandbox.stub().returnsPromise()
    };

    const dbMock = {
        getLicences: sandbox.stub().returnsPromise()
    };

    const service = createPrisonerDetailsService(apiMock, dbMock);

    afterEach(() => {
        sandbox.reset();
    });

    describe('getDashboardDetail', () => {
        it('should call the api with the user id', () => {
            service.getDashboardDetail('123');

            expect(apiMock.getUpcomingReleases).to.be.calledOnce();
            expect(apiMock.getUpcomingReleases).to.be.calledWith('123');
        });

        it('should return an empty object if there are no upcoming releases', () => {
            apiMock.getUpcomingReleases.resolves(([]));

            return expect(service.getDashboardDetail('123'))
                .to.eventually.eql({});
        });

        it('should call db.getLicences if candidates returned', () => {
            apiMock.getUpcomingReleases.resolves(([{nomisId: '1'}, {nomisId: '2'}]));
            dbMock.getLicences.resolves(([{nomisId: '1'}, {nomisId: '2'}]));

            return service.getDashboardDetail('123').then(() => {
                expect(dbMock.getLicences).to.be.calledOnce();
                expect(dbMock.getLicences).to.be.calledWith(['1', '2']);
            });
        });

        it('should add licence details if licence is in db for prisoner', () => {
            apiMock.getUpcomingReleases.resolves(([{nomisId: '1'}, {nomisId: '2'}]));
            dbMock.getLicences.resolves(([{nomisId: '2', id: 'ab'}]));

            return expect(service.getDashboardDetail('123'))
                .to.eventually.eql([{nomisId: '1'}, {nomisId: '2', inProgress: true, licenceId: 'ab'}]);

        });

        it('should throw if error in api', () => {
            apiMock.getUpcomingReleases.rejects(new Error('dead'));

            return expect(service.getDashboardDetail('123')).to.be.rejected();
        });

        it('should throw if error in db', () => {
            apiMock.getUpcomingReleases.resolves(([{nomisId: '1'}, {nomisId: '2'}]));
            dbMock.getLicences.rejects(new Error('dead'));

            return expect(service.getDashboardDetail('123')).to.be.rejected();
        });
    });
});
