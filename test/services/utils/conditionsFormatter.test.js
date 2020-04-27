const { formatConditionsInput } = require('../../../server/services/utils/conditionsFormatter')

describe('conditionsValidator', () => {
  test('should reformat date fields to dd/mm/yyyy format', () => {
    const inputObject = {
      appointmentDay: '23',
      appointmentMonth: '12',
      appointmentYear: '2017',
    }

    const conditionsSelected = [{ field_position: { appointmentDate: 0 } }]
    /** @type {any} */
    const formatted = formatConditionsInput(inputObject, conditionsSelected)
    expect(formatted.appointmentDate).toBe('23/12/2017')
  })
})
