const { isAcceptedAddress } = require('../../server/utils/addressHelpers')

describe('addressHelpers', () => {
  describe('isAcceptedAddress', () => {
    test('should return true if all expected answers are Yes', () => {
      expect(isAcceptedAddress({ consent: 'Yes', electricity: 'Yes' }, 'Yes')).toBe(true)
    })

    test('should return false if any are No', () => {
      expect(isAcceptedAddress({ consent: 'No', electricity: 'Yes' }, 'Yes')).toBe(false)
      expect(isAcceptedAddress({ consent: 'Yes', electricity: 'No' }, 'Yes')).toBe(false)
      expect(isAcceptedAddress({ consent: 'Yes', electricity: 'Yes' }, 'No')).toBe(false)
    })

    test('should return true if consent is missed but occupier is the offender', () => {
      expect(isAcceptedAddress({ electricity: 'Yes' }, 'Yes', true)).toBe(true)
    })
  })
})
