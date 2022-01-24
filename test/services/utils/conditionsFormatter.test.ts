import { ConditionMetadata } from '../../../server/data/licenceClientTypes'
import { formatConditionsInput } from '../../../server/services/utils/conditionsFormatter'

describe('conditionsValidator', () => {
  test('should reformat date fields to dd/mm/yyyy format', () => {
    const inputObject = {
      appointmentDay: '23',
      appointmentMonth: '12',
      appointmentYear: '2017',
    }

    const conditionsSelected = [{ field_position: { appointmentDate: 0 } }] as unknown as ConditionMetadata[]
    const formatted = formatConditionsInput(inputObject, conditionsSelected)
    expect(formatted.appointmentDate).toBe('23/12/2017')
  })
})
