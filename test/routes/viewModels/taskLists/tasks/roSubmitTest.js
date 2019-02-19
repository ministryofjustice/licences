const { getLabel, getRoAction } = require('../../../../../server/routes/viewModels/taskLists/tasks/roSubmit')

describe('victim liaison task', () => {
  describe('getLabel', () => {
    it('should return Ready to submit if transition is allowed', () => {
      expect(getLabel({ allowedTransition: 'roToCa' })).to.eql('Ready to submit')
    })

    it('should return Tasks not yet complete if transition is not allowed', () => {
      expect(getLabel({ allowedTransition: 'something' })).to.eql('Tasks not yet complete')
    })
  })

  describe('getRoAction', () => {
    it('should show btn to curfewAddressReview if curfewAddressReview: UNSTARTED', () => {
      expect(
        getRoAction({
          decisions: { optedOut: true },
          tasks: {},
        })
      ).to.eql({
        text: 'Continue',
        href: '/hdc/send/optedOut/',
        type: 'btn',
      })
    })

    it('should show change link to curfewAddressReview if curfewAddressReview: DONE', () => {
      expect(
        getRoAction({
          decisions: { optedOut: false },
          tasks: {},
        })
      ).to.eql({
        text: 'Continue',
        href: '/hdc/review/licenceDetails/',
        type: 'btn',
      })
    })
  })
})
