const { getLabel, getCaAction } = require('../../../../../server/routes/viewModels/taskLists/tasks/caSubmitApproval')

describe('ca submit for approval task', () => {
    describe('getLabel', () => {
        it('should return Ready to submit if allowedTransition = caToDm', () => {
            expect(
                getLabel({
                    decisions: {},
                    allowedTransition: 'caToDm',
                })
            ).to.equal('Ready to submit')
        })

        it('should return Submission unavailable if postponed', () => {
            expect(
                getLabel({
                    decisions: { postponed: true },
                    allowedTransition: null,
                })
            ).to.equal('Submission unavailable - HDC application postponed')
        })

        it('should return Submission unavailable - HDC refused to submit if finalChecksRefused', () => {
            expect(
                getLabel({
                    decisions: { postponed: false, finalChecksRefused: true },
                })
            ).to.equal('Submission unavailable - HDC refused')
        })

        it('should return Not completed if not postponed or finalChecksRefused', () => {
            expect(
                getLabel({
                    decisions: { postponed: false, finalChecksRefused: false },
                })
            ).to.equal('Not completed')
        })
    })

    describe('getCaAction', () => {
        it('should show nothing if opted out', () => {
            expect(
                getCaAction({
                    allowedTransition: 'caToDm',
                })
            ).to.eql({
                text: 'Continue',
                href: '/hdc/send/approval/',
                type: 'btn',
            })
        })

        it('should show Continue to bassRequest if task DONE', () => {
            expect(
                getCaAction({
                    allowedTransition: 'something',
                })
            ).to.eql(null)
        })
    })
})
