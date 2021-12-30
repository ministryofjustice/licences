const { LicenceStage } = require('../../../server/data/licenceTypes')
const { getStatusLabel } = require('../../../server/services/licence/licenceStatusLabels')

describe('licenceStatusLabels', () => {
  describe('getStatusLabel', () => {
    describe('default label for unstarted licences', () => {
      const defaultLabel = 'Not started'

      const examples = [
        { status: undefined, reason: 'missing' },
        { status: {}, reason: 'empty' },
        { status: { stage: LicenceStage.ELIGIBILITY, tasks: {} }, reason: 'missing decisions' },
        { status: { stage: LicenceStage.ELIGIBILITY, decisions: {} }, reason: 'missing tasks' },
      ]

      examples.forEach((example) => {
        test(`should give default label when licence is ${example.reason}`, () => {
          expect(getStatusLabel(example.status, 'CA').statusLabel).toEqual(defaultLabel)
        })
      })
    })

    describe('CA user labels', () => {
      describe('ELIGIBILITY stage', () => {
        const examples = [
          {
            status: { stage: LicenceStage.ELIGIBILITY, decisions: {}, tasks: {} },
            label: 'Not started',
          },
          {
            status: { stage: LicenceStage.ELIGIBILITY, decisions: { excluded: true }, tasks: {} },
            label: 'Not eligible',
          },
          {
            status: { stage: LicenceStage.ELIGIBILITY, decisions: { insufficientTime: true }, tasks: {} },
            label: 'Not enough time',
          },
          {
            status: {
              stage: LicenceStage.ELIGIBILITY,
              decisions: { insufficientTimeContinue: true },
              tasks: {},
            },
            label: 'Not enough time',
          },
          {
            status: { stage: LicenceStage.ELIGIBILITY, decisions: { unsuitableResult: true }, tasks: {} },
            label: 'Presumed unsuitable',
          },
          {
            status: { stage: LicenceStage.ELIGIBILITY, decisions: { optedOut: true }, tasks: {} },
            label: 'Opted out',
          },
          {
            status: { stage: LicenceStage.ELIGIBILITY, decisions: { bassReferralNeeded: true }, tasks: {} },
            label: 'Eligible',
          },
          {
            status: {
              stage: LicenceStage.ELIGIBILITY,
              decisions: { curfewAddressRejected: true },
              tasks: {},
            },
            label: 'Address not suitable',
          },
          {
            status: {
              stage: LicenceStage.ELIGIBILITY,
              decisions: { curfewAddressRejected: true, unsuitableResult: false },
              tasks: {},
            },
            label: 'Address not suitable',
          },
          {
            status: {
              stage: LicenceStage.ELIGIBILITY,
              decisions: { curfewAddressRejected: true, unsuitableResult: true },
              tasks: {},
            },
            label: 'Presumed unsuitable',
          },
        ]

        assertLabels(examples, 'CA')
      })

      describe('ELIGIBILITY stage - message priority when multiple reasons', () => {
        const examples = [
          {
            status: {
              stage: LicenceStage.ELIGIBILITY,
              decisions: { excluded: true, insufficientTime: true, unsuitableResult: true },
              tasks: {},
            },
            label: 'Not eligible',
          },
          {
            status: {
              stage: LicenceStage.ELIGIBILITY,
              decisions: { insufficientTime: true, unsuitableResult: true },
              tasks: {},
            },
            label: 'Presumed unsuitable',
          },
        ]

        assertLabels(examples, 'CA')
      })

      describe('PROCESSING_CA stage', () => {
        const examples = [
          {
            status: { stage: LicenceStage.PROCESSING_CA, decisions: {}, tasks: {} },
            label: 'Address suitable',
          },
          {
            status: { stage: LicenceStage.PROCESSING_CA, decisions: { excluded: true }, tasks: {} },
            label: 'Not eligible',
          },
          {
            status: {
              stage: LicenceStage.PROCESSING_CA,
              decisions: { curfewAddressRejected: true },
              tasks: {},
            },
            label: 'Address not suitable',
          },
          {
            status: { stage: LicenceStage.PROCESSING_CA, decisions: { postponed: true }, tasks: {} },
            label: 'Postponed',
          },
          {
            status: { stage: LicenceStage.PROCESSING_CA, decisions: { finalChecksRefused: true }, tasks: {} },
            label: 'Refused',
          },
          {
            status: {
              stage: LicenceStage.PROCESSING_CA,
              decisions: { bassReferralNeeded: true, bassWithdrawalReason: 'offer' },
              tasks: {},
            },
            label: 'BASS offer withdrawn',
          },
          {
            status: {
              stage: LicenceStage.PROCESSING_CA,
              decisions: { bassReferralNeeded: true, bassWithdrawalReason: 'request' },
              tasks: {},
            },
            label: 'BASS request withdrawn',
          },
          {
            status: {
              stage: LicenceStage.PROCESSING_CA,
              decisions: { approvedPremisesRequired: true },
              tasks: {},
            },
            label: 'Approved premises',
          },
        ]

        assertLabels(examples, 'CA')
      })

      describe('PROCESSING_CA stage - message priority when multiple reasons', () => {
        const examples = [
          {
            status: {
              stage: LicenceStage.PROCESSING_CA,
              decisions: { excluded: true, curfewAddressApproved: 'approved', postponed: true },
              tasks: {},
            },
            label: 'Postponed',
          },
          {
            status: {
              stage: LicenceStage.PROCESSING_CA,
              decisions: { excluded: true, curfewAddressApproved: 'rejected' },
              tasks: {},
            },
            label: 'Not eligible',
          },
          {
            status: {
              stage: LicenceStage.PROCESSING_CA,
              decisions: { excluded: true, curfewAddressApproved: 'rejected', finalChecksRefused: true },
              tasks: {},
            },
            label: 'Refused',
          },
        ]

        assertLabels(examples, 'CA')
      })

      describe('Other stages', () => {
        const examples = [
          {
            status: { stage: LicenceStage.PROCESSING_RO, decisions: {}, tasks: {} },
            label: 'With community offender manager',
          },
          {
            status: { stage: LicenceStage.APPROVAL, decisions: {}, tasks: {} },
            label: 'With decision maker',
          },

          {
            status: { stage: LicenceStage.DECIDED, decisions: { approved: true, postponed: true }, tasks: {} },
            label: 'Postponed',
          },
          {
            status: { stage: LicenceStage.MODIFIED, decisions: { approved: true, postponed: true }, tasks: {} },
            label: 'Postponed',
          },
          {
            status: {
              stage: LicenceStage.MODIFIED_APPROVAL,
              decisions: { approved: true, postponed: true },
              tasks: {},
            },
            label: 'Postponed',
          },

          {
            status: { stage: LicenceStage.DECIDED, decisions: { approved: true }, tasks: {} },
            label: 'Approved',
          },
          {
            status: { stage: LicenceStage.MODIFIED, decisions: { approved: true }, tasks: {} },
            label: 'Approved',
          },
          {
            status: { stage: LicenceStage.MODIFIED_APPROVAL, decisions: { approved: true }, tasks: {} },
            label: 'Approved',
          },

          {
            status: { stage: LicenceStage.DECIDED, decisions: { approved: true }, tasks: { createLicence: 'DONE' } },
            label: 'Licence created',
          },
          {
            status: { stage: LicenceStage.MODIFIED, decisions: { approved: true }, tasks: { createLicence: 'DONE' } },
            label: 'Licence created',
          },
          {
            status: {
              stage: LicenceStage.MODIFIED_APPROVAL,
              decisions: { approved: true },
              tasks: { createLicence: 'DONE' },
            },
            label: 'Licence created',
          },

          {
            status: { stage: LicenceStage.DECIDED, decisions: { refused: true }, tasks: {} },
            label: 'Refused',
          },

          {
            status: { stage: LicenceStage.MODIFIED, decisions: { refused: true }, tasks: {} },
            label: 'Refused',
          },
          {
            status: { stage: LicenceStage.MODIFIED_APPROVAL, decisions: { refused: true }, tasks: {} },
            label: 'Refused',
          },
        ]

        assertLabels(examples, 'CA')
      })
    })

    describe('RO user labels', () => {
      describe('PROCESSING_RO stage', () => {
        const examples = [
          {
            status: { stage: LicenceStage.PROCESSING_RO, decisions: {}, tasks: {} },
            label: 'Not started',
          },
          {
            status: {
              stage: LicenceStage.PROCESSING_RO,
              decisions: {},
              tasks: { curfewAddressReview: 'UNSTARTED', reportingInstructions: 'DONE' },
            },
            label: 'In progress',
          },
          {
            status: {
              stage: LicenceStage.PROCESSING_RO,
              decisions: {},
              tasks: { curfewAddressReview: 'DONE' },
            },
            label: 'In progress',
          },
          {
            status: { stage: LicenceStage.PROCESSING_RO, decisions: {}, tasks: { curfewHours: 'STARTED' } },
            label: 'In progress',
          },
          {
            status: { stage: LicenceStage.PROCESSING_RO, decisions: {}, tasks: { licenceConditions: 'DONE' } },
            label: 'In progress',
          },
          {
            status: { stage: LicenceStage.PROCESSING_RO, decisions: {}, tasks: { riskManagement: 'STARTED' } },
            label: 'In progress',
          },
          {
            status: {
              stage: LicenceStage.PROCESSING_RO,
              decisions: {},
              tasks: { reportingInstructions: 'DONE' },
            },
            label: 'In progress',
          },
          {
            status: {
              stage: LicenceStage.PROCESSING_RO,
              decisions: { bassReferralNeeded: true },
              tasks: { bassAreaCheck: 'UNSTARTED' },
            },
            label: 'Not started',
          },
          {
            status: {
              stage: LicenceStage.PROCESSING_RO,
              decisions: { bassReferralNeeded: true },
              tasks: { bassAreaCheck: 'DONE' },
            },
            label: 'In progress',
          },
          {
            status: {
              stage: LicenceStage.PROCESSING_RO,
              decisions: { bassReferralNeeded: true },
              tasks: { bassAreaCheck: 'STARTED' },
            },
            label: 'In progress',
          },
          {
            status: {
              stage: LicenceStage.PROCESSING_RO,
              decisions: { bassReferralNeeded: true, bassAreaNotSuitable: true },
              tasks: {},
            },
            label: 'BASS area rejected',
          },
          {
            status: {
              stage: LicenceStage.PROCESSING_RO,
              decisions: { approvedPremisesRequired: true },
              tasks: { approvedPremisesAddress: 'STARTED' },
            },
            label: 'In progress',
          },
        ]

        assertLabels(examples, 'RO')
      })

      describe('PROCESSING_CA stage', () => {
        const examples = [
          {
            status: { stage: LicenceStage.PROCESSING_CA, decisions: { eligible: true }, tasks: {} },
            label: 'With prison',
          },
          {
            status: { stage: LicenceStage.PROCESSING_CA, decisions: { eligible: true, excluded: true }, tasks: {} },
            label: 'With prison',
          },
          {
            status: {
              stage: LicenceStage.PROCESSING_CA,
              decisions: { curfewAddressApproved: 'rejected', eligible: true },
              tasks: {},
            },
            label: 'With prison',
          },
          {
            status: { stage: LicenceStage.PROCESSING_CA, decisions: { postponed: true, eligible: true }, tasks: {} },
            label: 'Postponed',
          },
          {
            status: { stage: LicenceStage.PROCESSING_CA, decisions: { eligible: false }, tasks: {} },
            label: 'Not eligible',
          },
        ]

        assertLabels(examples, 'RO')
      })

      describe('Other stages', () => {
        const examples = [
          {
            status: { stage: LicenceStage.ELIGIBILITY, decisions: {}, tasks: {} },
            label: 'With prison',
          },
          {
            status: { stage: LicenceStage.APPROVAL, decisions: { approved: true }, tasks: {} },
            label: 'With decision maker',
          },
          {
            status: { stage: LicenceStage.DECIDED, decisions: { approved: true }, tasks: {} },
            label: 'Approved',
          },
          {
            status: { stage: LicenceStage.DECIDED, decisions: { refused: true }, tasks: {} },
            label: 'Refused',
          },
        ]

        assertLabels(examples, 'RO')
      })
    })

    describe('DM user labels', () => {
      describe('Approval stage', () => {
        const examples = [
          {
            status: { stage: LicenceStage.APPROVAL, decisions: {}, tasks: {} },
            label: 'Not started',
          },
          {
            status: { stage: LicenceStage.APPROVAL, decisions: { insufficientTimeStop: true }, tasks: {} },
            label: 'Awaiting refusal',
          },
        ]

        assertLabels(examples, 'DM')
      })

      describe('Other stages', () => {
        const examples = [
          {
            status: { stage: LicenceStage.ELIGIBILITY, decisions: {}, tasks: {} },
            label: 'With prison',
          },
          {
            status: { stage: LicenceStage.PROCESSING_RO, decisions: {}, tasks: {} },
            label: 'With community offender manager',
          },
          {
            status: { stage: LicenceStage.PROCESSING_CA, decisions: {}, tasks: {} },
            label: 'With prison',
          },
          {
            status: { stage: LicenceStage.DECIDED, decisions: { approved: true }, tasks: {} },
            label: 'Approved',
          },
          {
            status: { stage: LicenceStage.DECIDED, decisions: { refused: true }, tasks: {} },
            label: 'Refused',
          },
        ]

        assertLabels(examples, 'DM')
      })
    })

    function assertLabels(examples, role) {
      examples.forEach((example) => {
        test(`should give ${example.label}`, () => {
          expect(getStatusLabel(example.status, role).statusLabel).toEqual(example.label)
        })
      })
    }
  })
})
