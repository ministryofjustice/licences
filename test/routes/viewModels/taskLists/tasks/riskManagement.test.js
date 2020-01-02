const { getLabel, getRoAction } = require('../../../../../server/routes/viewModels/taskLists/tasks/riskManagement')

describe('risk management task', () => {
  describe('getLabel', () => {
    test('should return Address unsuitable if addressUnsuitable = true', () => {
      expect(
        getLabel({
          decisions: { addressUnsuitable: true },
          tasks: {},
        })
      ).toBe('Address unsuitable')
    })

    test('should return No risks if risk management not needed', () => {
      expect(
        getLabel({
          decisions: { addressReviewFailed: false, riskManagementNeeded: false },
          tasks: { riskManagement: 'DONE' },
        })
      ).toBe('No risks')
    })

    test('should return Risk management required if risk management needed', () => {
      expect(
        getLabel({
          decisions: { addressReviewFailed: false, riskManagementNeeded: true },
          tasks: { riskManagement: 'DONE' },
        })
      ).toBe('Risk management required')
    })

    test('should return Not completed if risk task not done', () => {
      expect(
        getLabel({
          decisions: { addressReviewFailed: false, riskManagementNeeded: true },
          tasks: { riskManagement: 'UNSTARTED' },
        })
      ).toBe('Not completed')
    })

    test('should return warning if still waiting for information', () => {
      expect(
        getLabel({
          decisions: { awaitingRiskInformation: true },
          tasks: {},
        })
      ).toBe('WARNING||Still waiting for information')
    })
  })

  describe('getRoAction', () => {
    test('should show btn to curfewAddressReview if curfewAddressReview: UNSTARTED', () => {
      expect(
        getRoAction({
          decisions: {},
          tasks: { riskManagement: 'UNSTARTED' },
        })
      ).toEqual({
        text: 'Start now',
        href: '/hdc/risk/riskManagement/',
        type: 'btn',
      })
    })

    test('should show change link to curfewAddressReview if curfewAddressReview: DONE', () => {
      expect(
        getRoAction({
          decisions: {},
          tasks: { riskManagement: 'DONE' },
        })
      ).toEqual({
        text: 'Change',
        href: '/hdc/risk/riskManagement/',
        type: 'link',
      })
    })

    test('should show continue btn to curfewAddressReview if curfewAddressReview: !DONE || UNSTARTED', () => {
      expect(
        getRoAction({
          decisions: {},
          tasks: { riskManagement: 'SOMETHING' },
        })
      ).toEqual({
        text: 'Continue',
        href: '/hdc/risk/riskManagement/',
        type: 'btn',
      })
    })
  })
})
