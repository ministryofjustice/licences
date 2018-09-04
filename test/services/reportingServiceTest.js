const createReportingService = require('../../server/services/reportingService');

describe('reportingServiceTest', () => {
    let service;
    let audit;

    beforeEach(() => {

        audit = {
            getEvents: sinon.stub().resolves({key: 'value'})
        };

        service = createReportingService(audit);
    });

    describe('getCurfewAddressSubmission', () => {
        context('booking id supplied', () => {
            it('should call getEvents from the audit client', async () => {
                await service.getAddressSubmission('123');

                expect(audit.getEvents).to.be.calledOnce();
                expect(audit.getEvents).to.be.calledWith('SEND', {bookingId: '123', transitionType: 'caToRo'});
            });
        });

        context('booking id not supplied', () => {
            it('should call getEvents from the audit client without bookingId filter', async () => {
                await service.getAddressSubmission();

                expect(audit.getEvents).to.be.calledOnce();
                expect(audit.getEvents).to.be.calledWith('SEND', {transitionType: 'caToRo'});
            });
        });
    });

    describe('getAssessmentComplete', () => {
        context('booking id supplied', () => {
            it('should call getEvents from the audit client', async () => {
                await service.getAssessmentComplete('123');

                expect(audit.getEvents).to.be.calledOnce();
                expect(audit.getEvents).to.be.calledWith('SEND', {bookingId: '123', transitionType: 'roToCa'});
            });
        });

        context('booking id not supplied', () => {
            it('should call getEvents from the audit client without bookingId filter', async () => {
                await service.getAssessmentComplete();

                expect(audit.getEvents).to.be.calledOnce();
                expect(audit.getEvents).to.be.calledWith('SEND', {transitionType: 'roToCa'});
            });
        });
    });

    describe('getFinalChecksComplete', () => {
        context('booking id supplied', () => {
            it('should call getEvents from the audit client', async () => {
                await service.getFinalChecksComplete('123');

                expect(audit.getEvents).to.be.calledOnce();
                expect(audit.getEvents).to.be.calledWith('SEND', {bookingId: '123', transitionType: 'caToDm'});
            });
        });

        context('booking id not supplied', () => {
            it('should call getEvents from the audit client without bookingId filter', async () => {
                await service.getFinalChecksComplete();

                expect(audit.getEvents).to.be.calledOnce();
                expect(audit.getEvents).to.be.calledWith('SEND', {transitionType: 'caToDm'});
            });
        });
    });

    describe('getApprovalComplete', () => {
        context('booking id supplied', () => {
            it('should call getEvents from the audit client', async () => {
                await service.getApprovalComplete('123');

                expect(audit.getEvents).to.be.calledOnce();
                expect(audit.getEvents).to.be.calledWith('SEND', {bookingId: '123', transitionType: 'dmToCa'});
            });
        });

        context('booking id not supplied', () => {
            it('should call getEvents from the audit client without bookingId filter', async () => {
                await service.getApprovalComplete();

                expect(audit.getEvents).to.be.calledOnce();
                expect(audit.getEvents).to.be.calledWith('SEND', {transitionType: 'dmToCa'});
            });
        });
    });
});
