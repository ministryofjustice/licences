const hdcRefusal = require('../../../../../../server/routes/viewModels/taskLists/tasks/ca/refuseHdc')

describe('hdc refusal task - when refused', () => {
  test('When case is not refused', () => {
    expect(
      hdcRefusal({
        decisions: { caRefused: false },
      })
    ).toStrictEqual({
      title: null,
      label: 'Refuse the case if there is no available address or not enough time',
      action: { dataQa: 'refuse', href: '/hdc/finalChecks/refuse/', text: 'Refuse HDC', type: 'btn-secondary' },
    })
  })

  test('When case is refused', () => {
    expect(
      hdcRefusal({
        decisions: { caRefused: true },
      })
    ).toStrictEqual({
      title: null,
      label: 'HDC refused',
      action: { dataQa: 'refuse', href: '/hdc/finalChecks/refuse/', text: 'Update refusal', type: 'btn' },
    })
  })
})
