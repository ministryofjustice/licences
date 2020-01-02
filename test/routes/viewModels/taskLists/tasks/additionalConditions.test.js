const {
  getLabel,
  getRoAction,
} = require('../../../../../server/routes/viewModels/taskLists/tasks/additionalConditions')

describe('additional conditions task', () => {
  describe('getLabel', () => {
    test('should return Standard conditions only if task DONE and standardOnly = true', () => {
      expect(
        getLabel({
          decisions: { standardOnly: true },
          tasks: { licenceConditions: 'DONE' },
        })
      ).toBe('Standard conditions only')
    })

    test('should return singular label if a total of 1 condition added', () => {
      expect(
        getLabel({
          decisions: { additional: 1, bespoke: 0 },
          tasks: { licenceConditions: 'DONE' },
        })
      ).toBe('1 condition added')
    })

    test('should return plural label if >1 conditions added', () => {
      expect(
        getLabel({
          decisions: { additional: 0, bespoke: 2 },
          tasks: { licenceConditions: 'DONE' },
        })
      ).toBe('2 conditions added')
    })

    test('should return plural label if >1 bespoke condition added', () => {
      expect(
        getLabel({
          decisions: { bespoke: 1, additional: 1 },
          tasks: { licenceConditions: 'DONE' },
        })
      ).toBe('2 conditions added')
    })

    test('should return rejected action message if bespoke conditions have been rejected', () => {
      expect(
        getLabel({
          decisions: { bespokeRejected: 1 },
          tasks: { licenceConditions: 'DONE' },
        })
      ).toBe(
        'WARNING||Some bespoke conditions have not been approved. Contact Public Protection Casework Section and ask them to review these.'
      )
    })

    test('should return rejected action message if bespoke conditions have been rejected', () => {
      expect(
        getLabel(
          {
            decisions: { bespokeRejected: 1 },
            tasks: { licenceConditions: 'DONE' },
          },
          'CA'
        )
      ).toBe('WARNING||Some bespoke conditions were rejected. Remove these and inform the responsible officer.')
    })

    test('should return pending action message if bespoke conditions have not been approved', () => {
      expect(
        getLabel({
          decisions: { bespokePending: 1 },
          tasks: { licenceConditions: 'DONE' },
        })
      ).toBe('WARNING||You still need approval for some bespoke conditions.')
    })

    test('should return rejected and pending action messages if some bespoke conditions have not been approved and some have been rejected', () => {
      expect(
        getLabel({
          decisions: { bespokeRejected: 1, bespokePending: 1 },
          tasks: { licenceConditions: 'DONE' },
        })
      ).toBe(
        'WARNING||Some bespoke conditions have not been approved. Contact Public Protection Casework Section and ask them to review these.||You still need approval for some bespoke conditions.'
      )
    })

    test('should return Not completed if task not DONE', () => {
      expect(
        getLabel({
          decisions: { bespoke: 1, additional: 1 },
          tasks: { licenceConditions: 'SOMETHING' },
        })
      ).toBe('Not completed')
    })
  })

  describe('getRoAction', () => {
    test('should show btn to standard conditions page if licenceConditions: UNSTARTED', () => {
      expect(
        getRoAction({
          decisions: {},
          tasks: { licenceConditions: 'UNSTARTED' },
        })
      ).toEqual({
        text: 'Start now',
        href: '/hdc/licenceConditions/standard/',
        type: 'btn',
      })
    })

    test('should show change link standard conditions page if licenceConditions: DONE', () => {
      expect(
        getRoAction({
          decisions: {},
          tasks: { licenceConditions: 'DONE' },
        })
      ).toEqual({
        text: 'Change',
        href: '/hdc/licenceConditions/standard/',
        type: 'link',
      })
    })

    test('should show continue btn standard conditions page if licenceConditions: !DONE || UNSTARTED', () => {
      expect(
        getRoAction({
          decisions: {},
          tasks: { licenceConditions: 'SOMETHING' },
        })
      ).toEqual({
        text: 'Continue',
        href: '/hdc/licenceConditions/standard/',
        type: 'btn',
      })
    })
  })
})
