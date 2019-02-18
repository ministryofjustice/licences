const { getLabel, getRoAction } = require('../../../../../server/routes/viewModels/taskLists/tasks/curfewHours')

describe('curfew hours task', () => {
    describe('getLabel', () => {
        it('should Completed if task is done', () => {
            expect(
                getLabel({
                    decisions: {},
                    tasks: { curfewHours: 'DONE' },
                })
            ).to.equal('Confirmed')
        })

        it('should Not completed if task is not done', () => {
            expect(
                getLabel({
                    decisions: {},
                    tasks: { curfewHours: 'SOMETHING' },
                })
            ).to.equal('Not completed')
        })
    })

    describe('getRoAction', () => {
        it('should show btn to curfewHours if curfewHours: UNSTARTED', () => {
            expect(
                getRoAction({
                    decisions: {},
                    tasks: { curfewHours: 'UNSTARTED' },
                })
            ).to.eql({
                text: 'Start now',
                href: '/hdc/curfew/curfewHours/',
                type: 'btn',
            })
        })

        it('should show change link to curfewHours if curfewHours: DONE', () => {
            expect(
                getRoAction({
                    decisions: {},
                    tasks: { curfewHours: 'DONE' },
                })
            ).to.eql({
                text: 'Change',
                href: '/hdc/curfew/curfewHours/',
                type: 'link',
            })
        })

        it('should show continue btn to curfewHours if curfewHours: !DONE || UNSTARTED', () => {
            expect(
                getRoAction({
                    decisions: {},
                    tasks: { curfewHours: 'SOMETHING' },
                })
            ).to.eql({
                text: 'Continue',
                href: '/hdc/curfew/curfewHours/',
                type: 'btn',
            })
        })
    })
})
