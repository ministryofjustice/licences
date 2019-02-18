const { getLabel, getCaAction } = require('../../../../../server/routes/viewModels/taskLists/tasks/hdcRefusal')

describe('hdc refusal task', () => {
    describe('getLabel', () => {
        it('should return Refuse the case if not refused', () => {
            expect(
                getLabel({
                    decisions: { refused: false },
                })
            ).to.equal('Refuse the case if there is no available address or not enough time')
        })

        it('should return HDC refused if refused', () => {
            expect(
                getLabel({
                    decisions: { refused: true },
                })
            ).to.equal('HDC refused')
        })
    })

    describe('getCaAction', () => {
        it('should show update to refuse if refused', () => {
            expect(
                getCaAction({
                    decisions: { refused: true },
                })
            ).to.eql({
                text: 'Update refusal',
                href: '/hdc/finalChecks/refuse/',
                type: 'btn',
            })
        })

        it('should show refuse if not refused', () => {
            expect(
                getCaAction({
                    decisions: { refused: false },
                })
            ).to.eql({
                text: 'Refuse HDC',
                href: '/hdc/finalChecks/refuse/',
                type: 'btn-secondary',
            })
        })
    })
})
