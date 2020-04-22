const hdcRefusal = require('../../../../../server/routes/viewModels/taskLists/tasks/hdcRefusal')

describe('hdc refusal task - when refused', () => {
  test('When case is not refused', () => {
    expect(
      hdcRefusal({
        decisions: { refused: false, visible: true },
      })
    ).toStrictEqual({
      title: null,
      label: 'Refuse the case if there is no available address or not enough time',
      action: { dataQa: 'refuse', href: '/hdc/finalChecks/refuse/', text: 'Refuse HDC', type: 'btn-secondary' },
      visible: true,
    })
  })

  test('When case is refused', () => {
    expect(
      hdcRefusal({
        decisions: { refused: true, visible: true },
      })
    ).toStrictEqual({
      title: null,
      label: 'HDC refused',
      action: { dataQa: 'refuse', href: '/hdc/finalChecks/refuse/', text: 'Update refusal', type: 'btn' },
      visible: true,
    })
  })
})
