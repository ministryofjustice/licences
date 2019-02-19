const {
  getLabel,
  getRoAction,
} = require('../../../../../server/routes/viewModels/taskLists/tasks/reportingInstructions')

describe('reporting instructions task', () => {
  describe('getLabel', () => {
    it('should return Victim liaison required if task DONE', () => {
      expect(
        getLabel({
          decisions: {},
          tasks: { reportingInstructions: 'DONE' },
        })
      ).to.equal('Confirmed')
    })

    it('should return No victim liaison required if task not DONE', () => {
      expect(
        getLabel({
          decisions: {},
          tasks: { reportingInstructions: 'SOMETHING' },
        })
      ).to.equal('Not completed')
    })
  })

  describe('getRoAction', () => {
    it('should show btn to reportingInstructions if reportingInstructions: UNSTARTED', () => {
      expect(
        getRoAction({
          decisions: {},
          tasks: { reportingInstructions: 'UNSTARTED' },
        })
      ).to.eql({
        text: 'Start now',
        href: '/hdc/reporting/reportingInstructions/',
        type: 'btn',
      })
    })

    it('should show change link to reportingInstructions if reportingInstructions: DONE', () => {
      expect(
        getRoAction({
          decisions: {},
          tasks: { reportingInstructions: 'DONE' },
        })
      ).to.eql({
        text: 'Change',
        href: '/hdc/reporting/reportingInstructions/',
        type: 'link',
      })
    })

    it('should show continue btn to reportingInstructions if reportingInstructions: !DONE || UNSTARTED', () => {
      expect(
        getRoAction({
          decisions: {},
          tasks: { reportingInstructions: 'SOMETHING' },
        })
      ).to.eql({
        text: 'Continue',
        href: '/hdc/reporting/reportingInstructions/',
        type: 'btn',
      })
    })
  })
})
