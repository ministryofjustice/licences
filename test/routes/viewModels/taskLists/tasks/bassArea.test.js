const { getLabel, getRoAction } = require('../../../../../server/routes/viewModels/taskLists/tasks/bassArea')

describe('bass area task', () => {
  describe('getLabel', () => {
    test('should return Not completed if task not DONE', () => {
      expect(
        getLabel({
          decisions: {},
          tasks: { bassAreaCheck: 'SOMETHING' },
        })
      ).toBe('Not completed')
    })

    test('should return No specific BASS area requested if bassAreaSpecified = false', () => {
      expect(
        getLabel({
          decisions: { bassAreaSpecified: false },
          tasks: { bassAreaCheck: 'DONE' },
        })
      ).toBe('No specific BASS area requested')
    })

    test('should return BASS area suitable if decision is true', () => {
      expect(
        getLabel({
          decisions: { bassAreaSpecified: true, bassAreaSuitable: true },
          tasks: { bassAreaCheck: 'DONE' },
        })
      ).toBe('BASS area suitable')
    })

    test('should return BASS area is not suitable if decision is false', () => {
      expect(
        getLabel({
          decisions: { bassAreaSpecified: true, bassAreaSuitable: false },
          tasks: { bassAreaCheck: 'DONE' },
        })
      ).toBe('BASS area is not suitable')
    })
  })

  describe('getRoAction', () => {
    test('should show btn to bassAreaCheck if bassAreaCheck: UNSTARTED', () => {
      expect(
        getRoAction({
          decisions: {},
          tasks: { bassAreaCheck: 'UNSTARTED' },
        })
      ).toEqual({
        text: 'Start now',
        href: '/hdc/bassReferral/bassAreaCheck/',
        type: 'btn',
      })
    })

    test('should show change link to bassAreaCheck if bassAreaCheck: DONE', () => {
      expect(
        getRoAction({
          decisions: {},
          tasks: { bassAreaCheck: 'DONE' },
        })
      ).toEqual({
        text: 'Change',
        href: '/hdc/bassReferral/bassAreaCheck/',
        type: 'link',
      })
    })

    test('should show continue btn to bassAreaCheck if bassAreaCheck: !DONE || UNSTARTED', () => {
      expect(
        getRoAction({
          decisions: {},
          tasks: { bassAreaCheck: 'SOMETHING' },
        })
      ).toEqual({
        text: 'Continue',
        href: '/hdc/bassReferral/bassAreaCheck/',
        type: 'btn',
      })
    })

    test('should show change link to Bass area check if approvedPremisesAddress: DONE, irrespective of value in bassAreaCheck', () => {
      expect(
        getRoAction({
          decisions: {},
          tasks: { approvedPremisesAddress: 'DONE', bassAreaCheck: 'SOMETHING' },
        })
      ).toEqual({
        text: 'Change',
        href: '/hdc/bassReferral/bassAreaCheck/',
        type: 'link',
      })
    })
  })
})
