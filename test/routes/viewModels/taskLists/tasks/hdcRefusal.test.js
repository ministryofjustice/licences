const { getLabel, getCaAction } = require('../../../../../server/routes/viewModels/taskLists/tasks/hdcRefusal')

describe('hdc refusal task', () => {
  describe('getLabel', () => {
    test('should return Refuse the case if not refused', () => {
      expect(
        getLabel({
          decisions: { refused: false },
        })
      ).toBe('Refuse the case if there is no available address or not enough time')
    })

    test('should return HDC refused if refused', () => {
      expect(
        getLabel({
          decisions: { refused: true },
        })
      ).toBe('HDC refused')
    })
  })

  describe('getCaAction', () => {
    test('should show update to refuse if refused', () => {
      expect(
        getCaAction({
          decisions: { refused: true },
        })
      ).toEqual({
        text: 'Update refusal',
        href: '/hdc/finalChecks/refuse/',
        type: 'btn',
      })
    })

    test('should show refuse if not refused', () => {
      expect(
        getCaAction({
          decisions: { refused: false },
        })
      ).toEqual({
        text: 'Refuse HDC',
        href: '/hdc/finalChecks/refuse/',
        type: 'btn-secondary',
      })
    })
  })
})
