const { getCaAction } = require('../../../../../server/routes/viewModels/taskLists/tasks/createLicence')

describe('create licence task', () => {
  describe('getCaAction', () => {
    test('should show continue if approved', () => {
      expect(
        getCaAction({
          decisions: { approved: true, bassReferralNeeded: false, addressWithdrawn: false },
          tasks: {},
          stage: 'APPROVED',
        })
      ).toEqual({
        text: 'Continue',
        href: '/hdc/pdf/selectLicenceType/',
        type: 'btn',
      })
    })

    test('should show continue if bass is approved', () => {
      expect(
        getCaAction({
          decisions: { approved: true, bassReferralNeeded: true },
          tasks: { bassAddress: 'DONE' },
          stage: 'APPROVED',
        })
      ).toEqual({
        text: 'Continue',
        href: '/hdc/pdf/selectLicenceType/',
        type: 'btn',
      })
    })

    test('should show nothing if modified pending approval', () => {
      expect(
        getCaAction({
          decisions: { approved: true, bassReferralNeeded: true },
          tasks: { bassAddress: 'DONE' },
          stage: 'MODIFIED_APPROVAL',
        })
      ).toBe(null)
    })

    test('should show nothing if modified withdrawn', () => {
      expect(
        getCaAction({
          decisions: { approved: true, bassReferralNeeded: false, addressWithdrawn: true },
          tasks: { bassAddress: 'DONE' },
          stage: 'APPROVED',
        })
      ).toBe(null)
    })

    test('should show nothing if bass not complete', () => {
      expect(
        getCaAction({
          decisions: { approved: true, bassReferralNeeded: true },
          tasks: { bassAddress: 'SOMETHING' },
          stage: 'APPROVED',
        })
      ).toBe(null)
    })
  })
})
