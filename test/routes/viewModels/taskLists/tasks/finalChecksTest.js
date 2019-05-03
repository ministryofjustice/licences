const {
  getLabel,
  getCaProcessingAction,
} = require('../../../../../server/routes/viewModels/taskLists/tasks/finalChecks')

describe('final checks task', () => {
  describe('getLabel', () => {
    it('should return Confirmed if task DONE', () => {
      expect(
        getLabel({
          decisions: {},
          tasks: { finalChecks: 'DONE' },
        })
      ).to.equal('Confirmed')
    })

    it('should return not completed if task not DONE', () => {
      expect(
        getLabel({
          decisions: {},
          tasks: { finalChecks: 'UNSTARTED' },
        })
      ).to.equal('Not completed')
    })

    it('should return warning message when any checks failed', () => {
      expect(
        getLabel({
          decisions: { onRemand: true },
          tasks: { finalChecks: 'DONE' },
        })
      ).to.equal('WARNING||The offender is on remand')
    })

    it('should return multiple warning messages when multiple checks failed', () => {
      const labels = getLabel({
        decisions: { seriousOffence: true, onRemand: true, confiscationOrder: true },
        tasks: { finalChecks: 'DONE' },
      }).split('||')

      expect(labels[0]).to.equal('WARNING')
      expect(labels.length).to.equal(4)
      expect(labels).to.contain('The offender is on remand')
    })
  })

  describe('getCaProcessingAction', () => {
    it('should show start button to serious offence question when final checks UNSTARTED', () => {
      expect(
        getCaProcessingAction({
          decisions: {},
          tasks: { finalChecks: 'UNSTARTED' },
        })
      ).to.eql({
        text: 'Start now',
        href: '/hdc/finalChecks/seriousOffence/',
        type: 'btn',
      })
    })
    it('should show change link to serious offence question when final checks DONE', () => {
      expect(
        getCaProcessingAction({
          decisions: {},
          tasks: { finalChecks: 'DONE' },
        })
      ).to.eql({
        text: 'Change',
        href: '/hdc/finalChecks/seriousOffence/',
        type: 'link',
      })
    })
    it('should show continue button to serious offence question when final checks STARTED', () => {
      expect(
        getCaProcessingAction({
          decisions: {},
          tasks: { finalChecks: 'STARTED' },
        })
      ).to.eql({
        text: 'Continue',
        href: '/hdc/finalChecks/seriousOffence/',
        type: 'btn',
      })
    })
  })
})
