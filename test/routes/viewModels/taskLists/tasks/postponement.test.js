const { postpone, postponeOrRefuse } = require('../../../../../server/routes/viewModels/taskLists/tasks/postponement')

describe('postpone', () => {
  test('should return HDC application postponed if postponed = true', () => {
    expect(postpone({ decisions: { postponed: true } })).toStrictEqual({
      action: { dataQa: 'postpone', href: '/hdc/finalChecks/postpone/', text: 'Resume', type: 'btn' },
      label: 'HDC application postponed',
      title: 'Postpone',
    })
  })

  test('should return confiscation order message if confiscationOrder = true', () => {
    expect(postpone({ decisions: { confiscationOrder: true } })).toStrictEqual({
      action: { dataQa: 'postpone', href: '/hdc/finalChecks/postpone/', text: 'Postpone', type: 'btn' },
      label: 'Use this to indicate that the process is postponed if a confiscation order is in place',
      title: 'Postpone',
    })
  })

  test('should return default message if confiscationOrder && postponed= false', () => {
    expect(postpone({ decisions: { confiscationOrder: false, postponed: false } })).toStrictEqual({
      action: { dataQa: 'postpone', href: '/hdc/finalChecks/postpone/', text: 'Postpone', type: 'btn' },
      label: "Postpone the case if you're waiting for information on risk management",
      title: 'Postpone',
    })
  })
})

describe('postpone or refuse', () => {
  test('should return HDC application postponed if postponed = true', () => {
    expect(postponeOrRefuse({ decisions: { postponed: true } })).toStrictEqual({
      action: { dataQa: 'postpone', href: '/hdc/finalChecks/postpone/', text: 'Resume', type: 'btn' },
      label: 'HDC application postponed',
      title: 'Postpone or refuse',
    })
  })

  test('should return confiscation order message if confiscationOrder = true', () => {
    expect(postponeOrRefuse({ decisions: { confiscationOrder: true } })).toStrictEqual({
      action: { dataQa: 'postpone', href: '/hdc/finalChecks/postpone/', text: 'Postpone', type: 'btn' },
      label: 'Use this to indicate that the process is postponed if a confiscation order is in place',
      title: 'Postpone or refuse',
    })
  })

  test('should return default message if confiscationOrder && postponed= false', () => {
    expect(postponeOrRefuse({ decisions: { confiscationOrder: false, postponed: false } })).toStrictEqual({
      action: { dataQa: 'postpone', href: '/hdc/finalChecks/postpone/', text: 'Postpone', type: 'btn' },
      label: "Postpone the case if you're waiting for information on risk management",
      title: 'Postpone or refuse',
    })
  })
})
