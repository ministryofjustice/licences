const bassArea = require('../../../../../../server/routes/viewModels/taskLists/tasks/ro/bassArea')

describe('bass area task', () => {
  describe('getLabel', () => {
    test('should return Not completed if task not DONE', () => {
      expect(
        bassArea({
          decisions: {},
          tasks: { bassAreaCheck: 'SOMETHING' },
        }).label
      ).toBe('Not completed')
    })

    test('should return No specific BASS area requested if bassAreaSpecified = false', () => {
      expect(
        bassArea({
          decisions: { bassAreaSpecified: false },
          tasks: { bassAreaCheck: 'DONE' },
        }).label
      ).toBe('No specific BASS area requested')
    })

    test('should return BASS area suitable if decision is true', () => {
      expect(
        bassArea({
          decisions: { bassAreaSpecified: true, bassAreaSuitable: true },
          tasks: { bassAreaCheck: 'DONE' },
        }).label
      ).toBe('BASS area suitable')
    })

    test('should return BASS area is not suitable if decision is false', () => {
      expect(
        bassArea({
          decisions: { bassAreaSpecified: true, bassAreaSuitable: false },
          tasks: { bassAreaCheck: 'DONE' },
        }).label
      ).toBe('BASS area is not suitable')
    })
  })

  describe('getRoAction', () => {
    test('should show btn to bassAreaCheck if bassAreaCheck: UNSTARTED', () => {
      expect(
        bassArea({
          decisions: {},
          tasks: { bassAreaCheck: 'UNSTARTED' },
        }).action
      ).toEqual({
        text: 'Start now',
        href: '/hdc/bassReferral/bassAreaCheck/',
        type: 'btn',
      })
    })

    test('should show change link to bassAreaCheck if bassAreaCheck: DONE', () => {
      expect(
        bassArea({
          decisions: {},
          tasks: { bassAreaCheck: 'DONE' },
        }).action
      ).toEqual({
        text: 'Change',
        href: '/hdc/bassReferral/bassAreaCheck/',
        type: 'link',
      })
    })

    test('should show continue btn to bassAreaCheck if bassAreaCheck: !DONE || UNSTARTED', () => {
      expect(
        bassArea({
          decisions: {},
          tasks: { bassAreaCheck: 'SOMETHING' },
        }).action
      ).toEqual({
        text: 'Continue',
        href: '/hdc/bassReferral/bassAreaCheck/',
        type: 'btn',
      })
    })

    test('should show change link to Bass area check if approvedPremisesAddress: DONE, irrespective of value in bassAreaCheck', () => {
      expect(
        bassArea({
          decisions: {},
          tasks: { approvedPremisesAddress: 'DONE', bassAreaCheck: 'SOMETHING' },
        }).action
      ).toEqual({
        text: 'Change',
        href: '/hdc/bassReferral/bassAreaCheck/',
        type: 'link',
      })
    })
  })
})
