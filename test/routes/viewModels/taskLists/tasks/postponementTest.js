const { getLabel, getAction } = require('../../../../../server/routes/viewModels/taskLists/tasks/postponement')

describe('postponement task', () => {
    describe('getLabel', () => {
        it('should return HDC application postponed if postponed = true', () => {
            expect(getLabel({ decisions: { postponed: true } })).to.equal('HDC application postponed')
        })

        it('should return confiscation order message if confiscationOrder = true', () => {
            expect(getLabel({ decisions: { confiscationOrder: true } })).to.equal(
                'Use this to indicate that the process is postponed if a confiscation order is in place'
            )
        })

        it('should return default message if confiscationOrder && postponed= false', () => {
            expect(getLabel({ decisions: { confiscationOrder: false, postponed: false } })).to.equal(
                "Postpone the case if you're waiting for information on risk management"
            )
        })
    })

    describe('getAction', () => {
        it('should return resume text if postponed = true', () => {
            expect(getAction({ decisions: { postponed: true } })).to.eql({
                text: 'Resume',
                href: '/hdc/finalChecks/postpone/',
                type: 'btn',
            })
        })

        it('should return postpone text if postponed = false', () => {
            expect(getAction({ decisions: { postponed: false } })).to.eql({
                text: 'Postpone',
                href: '/hdc/finalChecks/postpone/',
                type: 'btn',
            })
        })
    })
})
