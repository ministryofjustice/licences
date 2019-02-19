const { getCaAction } = require('../../../../../server/routes/viewModels/taskLists/tasks/createLicence')

describe('create licence task', () => {
  describe('getCaAction', () => {
    it('should show continue if approved', () => {
      expect(
        getCaAction({
          decisions: { approved: true, bassReferralNeeded: false, addressWithdrawn: false },
          tasks: {},
          stage: 'APPROVED',
        })
      ).to.eql({
        text: 'Continue',
        href: '/hdc/pdf/select/',
        type: 'btn',
      })
    })

    it('should show continue if bass is approved', () => {
      expect(
        getCaAction({
          decisions: { approved: true, bassReferralNeeded: true },
          tasks: { bassAddress: 'DONE' },
          stage: 'APPROVED',
        })
      ).to.eql({
        text: 'Continue',
        href: '/hdc/pdf/select/',
        type: 'btn',
      })
    })

    it('should show nothing if modified pending approval', () => {
      expect(
        getCaAction({
          decisions: { approved: true, bassReferralNeeded: true },
          tasks: { bassAddress: 'DONE' },
          stage: 'MODIFIED_APPROVAL',
        })
      ).to.eql(null)
    })

    it('should show nothing if modified withdrawn', () => {
      expect(
        getCaAction({
          decisions: { approved: true, bassReferralNeeded: false, addressWithdrawn: true },
          tasks: { bassAddress: 'DONE' },
          stage: 'APPROVED',
        })
      ).to.eql(null)
    })

    it('should show nothing if bass not complete', () => {
      expect(
        getCaAction({
          decisions: { approved: true, bassReferralNeeded: true },
          tasks: { bassAddress: 'SOMETHING' },
          stage: 'APPROVED',
        })
      ).to.eql(null)
    })
  })
})
