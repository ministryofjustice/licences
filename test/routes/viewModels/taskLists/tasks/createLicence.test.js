const createLicence = require('../../../../../server/routes/viewModels/taskLists/tasks/createLicence')

describe('create licence task', () => {
  describe('getCaAction', () => {
    test('should show continue if approved', () => {
      expect(
        createLicence.ca({
          decisions: { approved: true, bassReferralNeeded: false, addressWithdrawn: false },
          tasks: {},
          stage: 'APPROVED',
        }).action
      ).toEqual({
        text: 'Continue',
        href: '/hdc/pdf/selectLicenceType/',
        type: 'btn',
        dataQa: 'continue',
      })
    })

    test('should show continue if bass is approved', () => {
      expect(
        createLicence.ca({
          decisions: { approved: true, bassReferralNeeded: true },
          tasks: { bassAddress: 'DONE' },
          stage: 'APPROVED',
        }).action
      ).toEqual({
        text: 'Continue',
        href: '/hdc/pdf/selectLicenceType/',
        type: 'btn',
        dataQa: 'continue',
      })
    })

    test('should show nothing if modified pending approval', () => {
      expect(
        createLicence.ca({
          decisions: { approved: true, bassReferralNeeded: true },
          tasks: { bassAddress: 'DONE' },
          stage: 'MODIFIED_APPROVAL',
        }).action
      ).toBe(null)
    })

    test('should show nothing if modified withdrawn', () => {
      expect(
        createLicence.ca({
          decisions: { approved: true, bassReferralNeeded: false, addressWithdrawn: true },
          tasks: { bassAddress: 'DONE' },
          stage: 'APPROVED',
        }).action
      ).toBe(null)
    })

    test('should show nothing if bass not complete', () => {
      expect(
        createLicence.ca({
          decisions: { approved: true, bassReferralNeeded: true },
          tasks: { bassAddress: 'SOMETHING' },
          stage: 'APPROVED',
        }).action
      ).toBe(null)
    })
  })
})
