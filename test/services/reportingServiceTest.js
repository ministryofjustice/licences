const createReportingService = require('../../server/services/reportingService')

describe('reportingServiceTest', () => {
    let service
    let audit

    beforeEach(() => {
        audit = {
            getEvents: sinon.stub().resolves({ key: 'value' }),
        }

        service = createReportingService(audit)
    })

    describe('getCurfewAddressSubmission', () => {
        it('should call getEvents from the audit client ', async () => {
            await service.getAddressSubmission()

            expect(audit.getEvents).to.be.calledOnce()
            expect(audit.getEvents).to.be.calledWith('SEND', { transitionType: 'caToRo' })
        })

        it('should pass in dates if they are supplied', async () => {
            await service.getAddressSubmission('start', 'end')

            expect(audit.getEvents).to.be.calledOnce()
            expect(audit.getEvents).to.be.calledWith('SEND', { transitionType: 'caToRo' }, 'start', 'end')
        })
    })

    describe('getAssessmentComplete', () => {
        it('should call getEvents from the audit client', async () => {
            await service.getAssessmentComplete()

            expect(audit.getEvents).to.be.calledOnce()
            expect(audit.getEvents).to.be.calledWith('SEND', { transitionType: 'roToCa' })
        })
    })

    describe('getFinalChecksComplete', () => {
        it('should call getEvents from the audit client', async () => {
            await service.getFinalChecksComplete('123')

            expect(audit.getEvents).to.be.calledOnce()
            expect(audit.getEvents).to.be.calledWith('SEND', { transitionType: 'caToDm' })
        })
    })

    describe('getApprovalComplete', () => {
        it('should call getEvents from the audit client', async () => {
            await service.getApprovalComplete('123')

            expect(audit.getEvents).to.be.calledOnce()
            expect(audit.getEvents).to.be.calledWith('SEND', { transitionType: 'dmToCa' })
        })
    })
})
