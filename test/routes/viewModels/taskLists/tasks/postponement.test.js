const { getLabel, getAction } = require('../../../../../server/routes/viewModels/taskLists/tasks/postponement')

describe('postponement task', () => {
  describe('getLabel', () => {
    test('should return HDC application postponed if postponed = true', () => {
      expect(getLabel({ decisions: { postponed: true } })).toBe('HDC application postponed')
    })

    test('should return confiscation order message if confiscationOrder = true', () => {
      expect(getLabel({ decisions: { confiscationOrder: true } })).toBe(
        'Use this to indicate that the process is postponed if a confiscation order is in place'
      )
    })

    test('should return default message if confiscationOrder && postponed= false', () => {
      expect(getLabel({ decisions: { confiscationOrder: false, postponed: false } })).toBe(
        "Postpone the case if you're waiting for information on risk management"
      )
    })
  })

  describe('getAction', () => {
    test('should return resume text if postponed = true', () => {
      expect(getAction({ decisions: { postponed: true } })).toEqual({
        text: 'Resume',
        href: '/hdc/finalChecks/postpone/',
        type: 'btn',
      })
    })

    test('should return postpone text if postponed = false', () => {
      expect(getAction({ decisions: { postponed: false } })).toEqual({
        text: 'Postpone',
        href: '/hdc/finalChecks/postpone/',
        type: 'btn',
      })
    })
  })
})
