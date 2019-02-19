const { getLabel, getCaAction } = require('../../../../../server/routes/viewModels/taskLists/tasks/caSubmitBassReview')

describe('ca submit for bass review task', () => {
  describe('getLabel', () => {
    it('should Submission unavailable if opted out', () => {
      expect(
        getLabel({
          decisions: { optedOut: true },
          tasks: {},
        })
      ).to.equal('Submission unavailable - Offender has opted out of HDC')
    })

    it('should return Ready to submit if task DONE', () => {
      expect(
        getLabel({
          decisions: { optedOut: false },
          tasks: { bassRequest: 'DONE' },
        })
      ).to.equal('Ready to submit')
    })

    it('should return Ready to submit if task STARTED', () => {
      expect(
        getLabel({
          decisions: { optedOut: false },
          tasks: { bassRequest: 'STARTED' },
        })
      ).to.equal('Ready to submit')
    })

    it('should return Not completed if task not DONE or STARTED', () => {
      expect(
        getLabel({
          decisions: { optedOut: false },
          tasks: { bassRequest: 'SOMETHING' },
        })
      ).to.equal('Not completed')
    })
  })

  describe('getCaAction', () => {
    it('should show nothing if opted out', () => {
      expect(
        getCaAction({
          decisions: { optedOut: true },
          tasks: {},
        })
      ).to.eql(null)
    })

    it('should show Continue to bassRequest if task DONE', () => {
      expect(
        getCaAction({
          decisions: { optedOut: false },
          tasks: { bassRequest: 'DONE' },
        })
      ).to.eql({
        text: 'Continue',
        href: '/hdc/review/bassRequest/',
        type: 'btn',
      })
    })

    it('should show Continue to bassRequest if task STARTED', () => {
      expect(
        getCaAction({
          decisions: { optedOut: false },
          tasks: { bassRequest: 'STARTED' },
        })
      ).to.eql({
        text: 'Continue',
        href: '/hdc/review/bassRequest/',
        type: 'btn',
      })
    })

    it('should show nothing if task not DONE or STARTED', () => {
      expect(
        getCaAction({
          decisions: { optedOut: false },
          tasks: { bassRequest: 'SOMETHING' },
        })
      ).to.eql(null)
    })
  })
})
