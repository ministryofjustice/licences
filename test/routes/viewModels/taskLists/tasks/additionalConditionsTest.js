const {
  getLabel,
  getRoAction,
} = require('../../../../../server/routes/viewModels/taskLists/tasks/additionalConditions')

describe('additional conditions task', () => {
  describe('getLabel', () => {
    it('should return Standard conditions only if task DONE and standardOnly = true', () => {
      expect(
        getLabel({
          decisions: { standardOnly: true },
          tasks: { licenceConditions: 'DONE' },
        })
      ).to.equal('Standard conditions only')
    })

    it('should return singular label if a total of 1 condition added', () => {
      expect(
        getLabel({
          decisions: { additional: 1, bespoke: 0 },
          tasks: { licenceConditions: 'DONE' },
        })
      ).to.equal('1 condition added')
    })

    it('should return plural label if >1 conditions added', () => {
      expect(
        getLabel({
          decisions: { additional: 0, bespoke: 2 },
          tasks: { licenceConditions: 'DONE' },
        })
      ).to.equal('2 conditions added')
    })

    it('should return plural label if >1 bespoke condition added', () => {
      expect(
        getLabel({
          decisions: { bespoke: 1, additional: 1 },
          tasks: { licenceConditions: 'DONE' },
        })
      ).to.equal('2 conditions added')
    })

    it('should return rejected action message if bespoke conditions have been rejected', () => {
      expect(
        getLabel({
          decisions: { bespokeRejected: 1 },
          tasks: { licenceConditions: 'DONE' },
        })
      ).to.equal(
        'WARNING||Some bespoke conditions have not been approved. Contact Public Protection Casework Section and ask them to review these.'
      )
    })

    it('should return rejected action message if bespoke conditions have been rejected', () => {
      expect(
        getLabel(
          {
            decisions: { bespokeRejected: 1 },
            tasks: { licenceConditions: 'DONE' },
          },
          'CA'
        )
      ).to.equal('WARNING||Some bespoke conditions were rejected. Remove these and inform the responsible officer.')
    })

    it('should return pending action message if bespoke conditions have not been approved', () => {
      expect(
        getLabel({
          decisions: { bespokePending: 1 },
          tasks: { licenceConditions: 'DONE' },
        })
      ).to.equal('WARNING||You still need approval for some bespoke conditions.')
    })

    it('should return rejected and pending action messages if some bespoke conditions have not been approved and some have been rejected', () => {
      expect(
        getLabel({
          decisions: { bespokeRejected: 1, bespokePending: 1 },
          tasks: { licenceConditions: 'DONE' },
        })
      ).to.equal(
        'WARNING||Some bespoke conditions have not been approved. Contact Public Protection Casework Section and ask them to review these.||You still need approval for some bespoke conditions.'
      )
    })

    it('should return Not completed if task not DONE', () => {
      expect(
        getLabel({
          decisions: { bespoke: 1, additional: 1 },
          tasks: { licenceConditions: 'SOMETHING' },
        })
      ).to.equal('Not completed')
    })
  })

  describe('getRoAction', () => {
    it('should show btn to standard conditions page if licenceConditions: UNSTARTED', () => {
      expect(
        getRoAction({
          decisions: {},
          tasks: { licenceConditions: 'UNSTARTED' },
        })
      ).to.eql({
        text: 'Start now',
        href: '/hdc/licenceConditions/standard/',
        type: 'btn',
      })
    })

    it('should show change link standard conditions page if licenceConditions: DONE', () => {
      expect(
        getRoAction({
          decisions: {},
          tasks: { licenceConditions: 'DONE' },
        })
      ).to.eql({
        text: 'Change',
        href: '/hdc/licenceConditions/standard/',
        type: 'link',
      })
    })

    it('should show continue btn standard conditions page if licenceConditions: !DONE || UNSTARTED', () => {
      expect(
        getRoAction({
          decisions: {},
          tasks: { licenceConditions: 'SOMETHING' },
        })
      ).to.eql({
        text: 'Continue',
        href: '/hdc/licenceConditions/standard/',
        type: 'btn',
      })
    })
  })
})
