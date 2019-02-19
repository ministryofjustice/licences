const { isAcceptedAddress } = require('../../server/utils/addressHelpers')

describe('addressHelpers', () => {
  describe('isAcceptedAddress', () => {
    it('should return true if all expected answers are Yes', () => {
      expect(isAcceptedAddress({ consent: 'Yes', electricity: 'Yes' }, 'Yes')).to.eql(true)
    })

    it('should return false if any are No', () => {
      expect(isAcceptedAddress({ consent: 'No', electricity: 'Yes' }, 'Yes')).to.eql(false)
      expect(isAcceptedAddress({ consent: 'Yes', electricity: 'No' }, 'Yes')).to.eql(false)
      expect(isAcceptedAddress({ consent: 'Yes', electricity: 'Yes' }, 'No')).to.eql(false)
    })

    it('should return true if consent is missed but occupier is the offender', () => {
      expect(isAcceptedAddress({ electricity: 'Yes' }, 'Yes', true)).to.eql(true)
    })
  })
})
