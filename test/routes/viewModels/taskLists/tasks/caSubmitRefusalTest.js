const { getLabel, getCaAction } = require('../../../../../server/routes/viewModels/taskLists/tasks/caSubmitRefusal')

describe('ca submit for address review task', () => {
    describe('getLabel', () => {
        it('should Submission unavailable if opted out', () => {
            expect(
                getLabel({
                    decisions: { optedOut: true },
                    tasks: {},
                })
            ).to.equal('Submission unavailable - Offender has opted out of HDC')
        })

        it('should Ready to submit if not opted out', () => {
            expect(
                getLabel({
                    decisions: { optedOut: false },
                    tasks: {},
                })
            ).to.equal('Ready to submit for refusal')
        })
    })

    describe('getCaAction', () => {
        it('should show btn to refusal if not opted out', () => {
            expect(
                getCaAction({
                    decisions: { optedOut: false },
                    tasks: {},
                })
            ).to.eql({
                text: 'Continue',
                href: '/hdc/send/refusal/',
                type: 'btn',
            })
        })

        it('should show nothing if opted out', () => {
            expect(
                getCaAction({
                    decisions: { optedOut: true },
                    tasks: {},
                })
            ).to.eql(null)
        })
    })
})
