import getLicenceStatus from '../../../server/services/licence/licenceStatus'
import { TaskState } from '../../../server/services/config/taskState'

describe('getLicenceStatus', () => {
  describe('overall status', () => {
    const examples = [
      {
        licence: {
          stage: 'ELIGIBILITY',
          licence: 'anything',
        },
        postApproval: false,
      },
      {
        licence: {
          stage: 'APPROVAL',
          licence: 'anything',
        },
        postApproval: false,
      },
      {
        licence: {
          stage: 'DECIDED',
          licence: 'anything',
        },
        postApproval: true,
      },
      {
        licence: {
          stage: 'MODIFIED',
          licence: 'anything',
        },
        postApproval: true,
      },
      {
        licence: {
          stage: 'MODIFIED_APPROVAL',
          licence: 'anything',
        },
        postApproval: true,
      },
    ]

    examples.forEach((example) => {
      test('should show licence stage', () => {
        expect(getLicenceStatus(example.licence).stage).toEqual(example.licence.stage)
      })

      test('should show post approval', () => {
        expect(getLicenceStatus(example.licence).postApproval).toEqual(example.postApproval)
      })
    })
  })

  describe('decisions', () => {
    test('should show no decisions when empty licence', () => {
      const licence = {}

      const status = getLicenceStatus(licence)

      expect(status.decisions).toEqual({})
    })

    test('should show no decisions when empty licence.licence', () => {
      const licence = { licence: {} }

      const status = getLicenceStatus(licence)

      expect(status.decisions).toEqual({})
    })

    test('should show true decisions when decision data is present for truth', () => {
      const licence = {
        stage: 'APPROVAL',
        licence: {
          eligibility: {
            excluded: {
              decision: 'Yes',
            },
            suitability: {
              decision: 'Yes',
            },
            exceptionalCircumstances: {
              decision: 'No',
            },
            crdTime: {
              decision: 'Yes',
            },
          },
          proposedAddress: {
            optOut: {
              decision: 'Yes',
            },
            addressProposed: {
              decision: 'No',
            },
            curfewAddress: {
              occupier: {
                isOffender: 'Yes',
              },
            },
          },
          curfew: {
            curfewAddressReview: {
              consent: 'Yes',
              electricity: 'Yes',
              homeVisitConducted: 'Yes',
            },
          },
          bassReferral: {
            bassRequest: {
              bassRequested: 'Yes',
              specificArea: 'Yes',
              town: 'blah',
              county: 'blah',
            },
            bassAreaCheck: {
              bassAreaSuitable: 'Yes',
            },
            bassOffer: {
              bassAccepted: 'Yes',
            },
          },
          risk: {
            riskManagement: {
              planningActions: 'Yes',
              awaitingInformation: 'Yes',
              proposedAddressSuitable: 'Yes',
            },
          },
          victim: {
            victimLiaison: {
              decision: 'Yes',
            },
          },
          finalChecks: {
            seriousOffence: {
              decision: 'Yes',
            },
            onRemand: {
              decision: 'Yes',
            },
            confiscationOrder: {
              decision: 'Yes',
            },
            undulyLenientSentence: {
              decision: 'Yes',
            },
            segregation: {
              decision: 'Yes',
            },
            postpone: {
              decision: 'Yes',
            },
          },
          approval: {
            release: {
              decision: 'Yes',
            },
            consideration: {
              decision: 'No',
            },
          },
        },
      }

      const status = getLicenceStatus(licence)

      expect(status.decisions.excluded).toBe(true)
      expect(status.decisions.insufficientTime).toBe(true)
      expect(status.decisions.unsuitableResult).toBe(true)
      expect(status.decisions.optedOut).toBe(true)
      expect(status.decisions.bassReferralNeeded).toBe(true)
      expect(status.decisions.bassAreaSpecified).toBe(true)
      expect(status.decisions.bassAreaSuitable).toBe(true)
      expect(status.decisions.bassAreaNotSuitable).toBe(false)
      expect(status.decisions.bassAccepted).toBe('Yes')
      expect(status.decisions.curfewAddressApproved).toBe(true)
      expect(status.decisions.curfewAddressRejected).toBe(false)
      expect(status.decisions.addressReviewFailed).toBe(false)
      expect(status.decisions.addressWithdrawn).toBe(false)
      expect(status.decisions.addressUnsuitable).toBe(false)
      expect(status.decisions.riskManagementNeeded).toBe(true)
      expect(status.decisions.awaitingRiskInformation).toBe(true)
      expect(status.decisions.victimLiaisonNeeded).toBe(true)
      expect(status.decisions.seriousOffence).toBe(true)
      expect(status.decisions.onRemand).toBe(true)
      expect(status.decisions.confiscationOrder).toBe(true)
      expect(status.decisions.undulyLenientSentence).toBe(true)
      expect(status.decisions.segregation).toBe(true)
      expect(status.decisions.finalChecksPass).toBe(false)
      expect(status.decisions.postponed).toBe(true)
      expect(status.decisions.approved).toBe(true)
      expect(status.decisions.refused).toBe(false)
      expect(status.decisions.dmRefused).toBe(false)
      expect(status.decisions.offenderIsMainOccupier).toBe(true)
      expect(status.decisions.dmNotConsidered).toBe(true)
    })

    test('should show false decisions when decision data is present for false', () => {
      const licence = {
        stage: 'APPROVAL',
        licence: {
          eligibility: {
            excluded: {
              decision: 'No',
            },
            suitability: {
              decision: 'No',
            },
            crdTime: {
              decision: 'No',
            },
          },
          proposedAddress: {
            optOut: {
              decision: 'No',
            },
            curfewAddress: {
              addresses: {
                addressLine1: 'something',
              },
            },
          },
          curfew: {
            curfewAddressReview: {
              consent: 'No',
              electricity: 'Yes',
              homeVisitConducted: 'Yes',
            },
            approvedPremises: {
              approvedPremisesRequireed: 'No',
            },
          },
          risk: {
            riskManagement: {
              planningActions: 'No',
              awaitingInformation: 'No',
              proposedAddressSuitable: 'No',
            },
          },
          bassReferral: {
            bassRequest: {
              bassRequested: 'No',
            },
            bassAreaCheck: {
              bassAreaSuitable: 'No',
            },
            bassOffer: {
              bassAccepted: 'No',
            },
          },
          finalChecks: {
            seriousOffence: {
              decision: 'No',
            },
            onRemand: {
              decision: 'No',
            },
            confiscationOrder: {
              decision: 'No',
            },
            undulyLenientSentence: {
              decision: 'No',
            },
            segregation: {
              decision: 'No',
            },
            postpone: {
              decision: 'No',
            },
          },
          approval: {
            release: {
              decision: 'No',
              reason: ['noAvailableAddress', 'addressUnsuitable', 'outOfTime', 'insufficientTime'],
            },
            consideration: {
              decision: 'Yes',
            },
          },
          victim: {
            victimLiaison: {
              decision: 'No',
            },
          },
        },
      }

      const status = getLicenceStatus(licence)

      expect(status.decisions.excluded).toBe(false)
      expect(status.decisions.insufficientTime).toBe(false)
      expect(status.decisions.unsuitableResult).toBe(false)
      expect(status.decisions.optedOut).toBe(false)
      expect(status.decisions.bassReferralNeeded).toBe(false)
      expect(status.decisions.bassAreaSpecified).toBe(true)
      expect(status.decisions.bassAreaSuitable).toBe(false)
      expect(status.decisions.bassAreaNotSuitable).toBe(true)
      expect(status.decisions.bassAccepted).toBe('No')
      expect(status.decisions.curfewAddressApproved).toBe(false)
      expect(status.decisions.curfewAddressRejected).toBe(true)
      expect(status.decisions.addressReviewFailed).toBe(true)
      expect(status.decisions.addressWithdrawn).toBe(false)
      expect(status.decisions.addressUnsuitable).toBe(true)
      expect(status.decisions.riskManagementNeeded).toBe(false)
      expect(status.decisions.awaitingRiskInformation).toBe(false)
      expect(status.decisions.victimLiaisonNeeded).toBe(false)
      expect(status.decisions.seriousOffence).toBe(false)
      expect(status.decisions.onRemand).toBe(false)
      expect(status.decisions.confiscationOrder).toBe(false)
      expect(status.decisions.undulyLenientSentence).toBe(false)
      expect(status.decisions.segregation).toBe(false)
      expect(status.decisions.finalChecksPass).toBe(true)
      expect(status.decisions.postponed).toBe(false)
      expect(status.decisions.approved).toBe(false)
      expect(status.decisions.refused).toBe(true)
      expect(status.decisions.dmRefused).toBe(true)
      expect(status.decisions.finalChecksRefused).toBe(false)
      expect(status.decisions.offenderIsMainOccupier).toBe(false)
      expect(status.decisions.refusalReason).toBe(
        'No available address, address unsuitable, out of time, insufficient time'
      )
      expect(status.decisions.approvedPremisesRequired).toBe(false)
      expect(status.decisions.dmNotConsidered).toBe(false)
    })

    test('should be undefined when decision is not provided', () => {
      const licence = {
        stage: 'APPROVAL',
        licence: {
          finalChecks: {
            seriousOffence: {
              decision: 'Yes',
            },
            onRemand: {
              decision: 'No',
            },
            undulyLenientSentence: {},
          },
        },
      }

      const status = getLicenceStatus(licence)

      expect(status.decisions.seriousOffence).toBe(true)
      expect(status.decisions.onRemand).toBe(false)
      expect(status.decisions.undulyLenientSentence).toBe(undefined)
      expect(status.decisions.segregation).toBe(undefined)
    })

    test('should show DM refusal reason if not in array', () => {
      const licence = {
        stage: 'APPROVAL',
        licence: {
          eligibility: {
            excluded: {
              decision: 'No',
            },
            suitability: {
              decision: 'No',
            },
            crdTime: {
              decision: 'No',
            },
          },
          proposedAddress: {
            optOut: {
              decision: 'No',
            },
            curfewAddress: {
              addresses: {
                addressLine1: 'something',
              },
            },
          },
          curfew: {
            curfewAddressReview: {
              consent: 'No',
              electricity: 'Yes',
              homeVisitConducted: 'Yes',
            },
          },
          risk: {
            riskManagement: {
              planningActions: 'Yes',
              awaitingInformation: 'Yes',
              proposedAddressSuitable: 'Yes',
            },
          },
          bassReferral: {
            bassRequest: {
              bassRequested: 'No',
            },
            bassAreaCheck: {
              bassAreaSuitable: 'No',
            },
            bassOffer: {
              bassAccepted: 'No',
            },
          },
          finalChecks: {
            seriousOffence: {
              decision: 'No',
            },
            onRemand: {
              decision: 'No',
            },
            confiscationOrder: {
              decision: 'No',
            },
            undulyLenientSentence: {
              decision: 'No',
            },
            segregation: {
              decision: 'No',
            },
            postpone: {
              decision: 'No',
            },
          },
          approval: {
            release: {
              decision: 'No',
              reason: 'noAvailableAddress',
            },
          },
        },
      }

      const status = getLicenceStatus(licence)
      expect(status.decisions.refusalReason).toBe('No available address')
    })
  })

  describe('tasks', () => {
    test('should show all tasks UNSTARTED when empty licence', () => {
      const licence = {}

      const status = getLicenceStatus(licence)

      expect(status.tasks.exclusion).toEqual(TaskState.UNSTARTED)
      expect(status.tasks.crdTime).toEqual(TaskState.UNSTARTED)
      expect(status.tasks.suitability).toEqual(TaskState.UNSTARTED)
      expect(status.tasks.eligibility).toEqual(TaskState.UNSTARTED)
      expect(status.tasks.optOut).toEqual(TaskState.UNSTARTED)
      expect(status.tasks.bassRequest).toEqual(TaskState.UNSTARTED)
      expect(status.tasks.bassAreaCheck).toEqual(TaskState.UNSTARTED)
      expect(status.tasks.bassOffer).toEqual(TaskState.UNSTARTED)
      expect(status.tasks.bassAddress).toEqual(TaskState.UNSTARTED)
      expect(status.tasks.curfewAddress).toEqual(TaskState.UNSTARTED)
      expect(status.tasks.curfewAddressReview).toEqual(TaskState.UNSTARTED)
      expect(status.tasks.curfewHours).toEqual(TaskState.UNSTARTED)
      expect(status.tasks.licenceConditions).toEqual(TaskState.UNSTARTED)
      expect(status.tasks.riskManagement).toEqual(TaskState.UNSTARTED)
      expect(status.tasks.reportingInstructions).toEqual(TaskState.UNSTARTED)
      expect(status.tasks.seriousOffenceCheck).toEqual(TaskState.UNSTARTED)
      expect(status.tasks.onRemandCheck).toEqual(TaskState.UNSTARTED)
      expect(status.tasks.confiscationOrderCheck).toEqual(TaskState.UNSTARTED)
      expect(status.tasks.undulyLenientSentenceCheck).toEqual(TaskState.UNSTARTED)
      expect(status.tasks.segregationCheck).toEqual(TaskState.UNSTARTED)
      expect(status.tasks.finalChecks).toEqual(TaskState.UNSTARTED)
      expect(status.tasks.approval).toEqual(TaskState.UNSTARTED)
      expect(status.tasks.createLicence).toEqual(TaskState.UNSTARTED)
      expect(status.tasks.approvedPremisesAddress).toEqual(TaskState.UNSTARTED)
    })

    test('should show tasks UNSTARTED when task data missing', () => {
      const licence = {
        stage: 'APPROVAL',
        licence: {},
      }

      const status = getLicenceStatus(licence)

      expect(status.tasks.exclusion).toEqual(TaskState.UNSTARTED)
      expect(status.tasks.crdTime).toEqual(TaskState.UNSTARTED)
      expect(status.tasks.suitability).toEqual(TaskState.UNSTARTED)
      expect(status.tasks.eligibility).toEqual(TaskState.UNSTARTED)
      expect(status.tasks.optOut).toEqual(TaskState.UNSTARTED)
      expect(status.tasks.bassRequest).toEqual(TaskState.UNSTARTED)
      expect(status.tasks.bassAreaCheck).toEqual(TaskState.UNSTARTED)
      expect(status.tasks.bassOffer).toEqual(TaskState.UNSTARTED)
      expect(status.tasks.bassAddress).toEqual(TaskState.UNSTARTED)
      expect(status.tasks.curfewAddress).toEqual(TaskState.UNSTARTED)
      expect(status.tasks.curfewAddressReview).toEqual(TaskState.UNSTARTED)
      expect(status.tasks.curfewHours).toEqual(TaskState.UNSTARTED)
      expect(status.tasks.licenceConditions).toEqual(TaskState.UNSTARTED)
      expect(status.tasks.riskManagement).toEqual(TaskState.UNSTARTED)
      expect(status.tasks.reportingInstructions).toEqual(TaskState.UNSTARTED)
      expect(status.tasks.seriousOffenceCheck).toEqual(TaskState.UNSTARTED)
      expect(status.tasks.onRemandCheck).toEqual(TaskState.UNSTARTED)
      expect(status.tasks.confiscationOrderCheck).toEqual(TaskState.UNSTARTED)
      expect(status.tasks.undulyLenientSentenceCheck).toEqual(TaskState.UNSTARTED)
      expect(status.tasks.segregationCheck).toEqual(TaskState.UNSTARTED)
      expect(status.tasks.finalChecks).toEqual(TaskState.UNSTARTED)
      expect(status.tasks.approval).toEqual(TaskState.UNSTARTED)
      expect(status.tasks.createLicence).toEqual(TaskState.UNSTARTED)
      expect(status.tasks.approvedPremisesAddress).toEqual(TaskState.UNSTARTED)
    })

    test('should show tasks STARTED when task data incomplete for tasks that can be STARTED', () => {
      const licence = {
        stage: 'APPROVAL',
        licence: {
          proposedAddress: {
            curfewAddress: {
              addressLine1: 'line',
            },
          },
          curfew: {
            curfewAddressReview: {
              consent: 'Yes',
              homeVisitConducted: 'Yes',
            },
            approvedPremises: {
              required: 'Yes',
            },
            approvedPremisesAddress: {
              postCode: '1',
            },
          },
          bassReferral: {
            bassRequest: {
              bassRequested: 'Yes',
              town: 'blah',
              county: 'blah',
            },
            bassAreaCheck: {
              bassAreaSuitable: 'Yes',
            },
            bassOffer: {
              bassAccepted: 'Yes',
              addressLine1: '1',
            },
          },
          licenceConditions: {
            standard: {
              additionalConditionsRequired: 'Yes',
            },
          },
          risk: {
            riskManagement: {
              planningActions: {},
            },
          },
          reporting: {
            reportingInstructions: {},
          },
          finalChecks: {
            seriousOffence: {
              decision: 'No',
            },
          },
        },
      }

      const status = getLicenceStatus(licence)

      expect(status.tasks.curfewAddress).toEqual(TaskState.STARTED)
      expect(status.tasks.bassAddress).toEqual(TaskState.STARTED)
      expect(status.tasks.curfewAddressReview).toEqual(TaskState.STARTED)
      expect(status.tasks.licenceConditions).toEqual(TaskState.STARTED)
      expect(status.tasks.riskManagement).toEqual(TaskState.STARTED)
      expect(status.tasks.finalChecks).toEqual(TaskState.STARTED)
      expect(status.tasks.approvedPremisesAddress).toEqual(TaskState.STARTED)
    })

    test('should show tasks DONE when task data complete', () => {
      const licence = {
        stage: 'DECIDED',
        approved_version: 1,
        version: 1,
        licence: {
          eligibility: {
            excluded: {
              decision: 'Yes',
              reason: 'Test',
            },
            suitability: {
              decision: 'Yes',
              reason: 'Test',
            },
            exceptionalCircumstances: {
              decision: 'Yes',
            },
            crdTime: {
              decision: 'No',
            },
          },
          proposedAddress: {
            optOut: {
              decision: 'Yes',
              reason: 'Test',
            },
            curfewAddress: {
              addressLine1: 'line',
              occupier: 'occupier',
            },
          },
          bassReferral: {
            bassRequest: {
              bassRequested: 'Yes',
              town: 'Test',
              county: 'Test',
            },
            bassAreaCheck: {
              bassAreaSuitable: 'Yes',
            },
            bassOffer: {
              bassAccepted: 'Yes',
              addressLine1: '1',
              addressTown: '1',
              postCode: '1',
              telephone: '1',
            },
          },
          curfew: {
            curfewHours: 'anything',
            curfewAddressReview: {
              cautionedAgainstResident: 'Yes',
              consent: 'Yes',
              electricity: 'Yes',
              homeVisitConducted: 'Yes',
            },
            approvedPremises: {
              required: 'Yes',
            },
            approvedPremisesAddress: {
              addressLine1: '1',
              addressTown: '1',
              postCode: '1',
            },
          },
          licenceConditions: {
            standard: {
              additionalConditionsRequired: 'No',
            },
          },
          risk: {
            riskManagement: {
              planningActions: 'anything',
              awaitingInformation: 'No',
              proposedAddressSuitable: 'Yes',
            },
          },
          victim: {
            victimLiaison: {
              decision: 'No',
            },
          },
          reporting: {
            reportingInstructions: {
              name: 'name',
              organisation: 'organisation',
              buildingAndStreet1: 1,
              townOrCity: 2,
              postcode: 3,
              telephone: 4,
              reportingDate: '01/02/2019',
              reportingTime: '12:34',
            },
          },
          finalChecks: {
            seriousOffence: {
              decision: 'Yes',
            },
            onRemand: {
              decision: 'Yes',
            },
            confiscationOrder: {
              decision: 'Yes',
            },
            undulyLenientSentence: {
              decision: 'Yes',
            },
            segregation: {
              decision: 'Yes',
            },
            postpone: {
              decision: 'Yes',
            },
          },
          approval: {
            release: {
              decision: 'Yes',
            },
          },
        },
      }

      const status = getLicenceStatus(licence)

      expect(status.tasks.exclusion).toEqual(TaskState.DONE)
      expect(status.tasks.crdTime).toEqual(TaskState.DONE)
      expect(status.tasks.suitability).toEqual(TaskState.DONE)
      expect(status.tasks.eligibility).toEqual(TaskState.DONE)
      expect(status.tasks.optOut).toEqual(TaskState.DONE)
      expect(status.tasks.bassRequest).toEqual(TaskState.DONE)
      expect(status.tasks.bassAreaCheck).toEqual(TaskState.DONE)
      expect(status.tasks.bassOffer).toEqual(TaskState.DONE)
      expect(status.tasks.bassAddress).toEqual(TaskState.DONE)
      expect(status.tasks.curfewAddress).toEqual(TaskState.DONE)
      expect(status.tasks.curfewAddressReview).toEqual(TaskState.DONE)
      expect(status.tasks.curfewHours).toEqual(TaskState.DONE)
      expect(status.tasks.licenceConditions).toEqual(TaskState.DONE)
      expect(status.tasks.riskManagement).toEqual(TaskState.DONE)
      expect(status.tasks.reportingInstructions).toEqual(TaskState.DONE)
      expect(status.tasks.seriousOffenceCheck).toEqual(TaskState.DONE)
      expect(status.tasks.onRemandCheck).toEqual(TaskState.DONE)
      expect(status.tasks.confiscationOrderCheck).toEqual(TaskState.DONE)
      expect(status.tasks.undulyLenientSentenceCheck).toEqual(TaskState.DONE)
      expect(status.tasks.segregationCheck).toEqual(TaskState.DONE)
      expect(status.tasks.finalChecks).toEqual(TaskState.DONE)
      expect(status.tasks.approval).toEqual(TaskState.DONE)
      expect(status.tasks.createLicence).toEqual(TaskState.DONE)
      expect(status.tasks.approvedPremisesAddress).toEqual(TaskState.DONE)
    })
  })

  describe('APPROVAL', () => {
    test('should account for refusal from ca as well as dm', () => {
      const licence = {
        stage: 'APPROVAL',
        licence: {
          finalChecks: {
            seriousOffence: {
              decision: 'Yes',
            },
            onRemand: {
              decision: 'Yes',
            },
            confiscationOrder: {
              decision: 'Yes',
            },
            undulyLenientSentence: {
              decision: 'Yes',
            },
            segregation: {
              decision: 'Yes',
            },
            postpone: {
              decision: 'Yes',
            },
            refusal: {
              decision: 'Yes',
              reason: 'addressUnsuitable',
            },
          },
          approval: {
            release: {
              decision: 'Yes',
              reason: 'outOfTime',
            },
          },
        },
      }

      const status = getLicenceStatus(licence)

      expect(status.decisions.refused).toBe(true)
      expect(status.decisions.finalChecksRefused).toBe(true)
      expect(status.decisions.dmRefused).toBe(false)
      expect(status.decisions.refusalReason).toBe('Out of time')
    })
  })

  describe('PROCESSING_RO', () => {
    test('should show licence conditions data', () => {
      const licence = {
        stage: 'PROCESSING_RO',
        licence: {
          licenceConditions: {
            standard: {
              additionalConditionsRequired: 'Yes',
            },
            additional: {
              1: {},
              2: {},
            },
            bespoke: [
              {
                text: '1',
                approved: 'No',
              },
              {
                text: '2',
              },
            ],
          },
        },
      }

      const status = getLicenceStatus(licence)

      expect(status.decisions.standardOnly).toBe(false)
      expect(status.decisions.additional).toBe(2)
      expect(status.decisions.bespoke).toBe(2)
      expect(status.decisions.bespokePending).toBe(1)
      expect(status.decisions.bespokeRejected).toBe(1)
    })

    describe('riskManagement task', () => {
      test('should show riskManagement UNSTARTED when empty', () => {
        const licence = {
          stage: 'PROCESSING_RO',
          licence: {
            risk: {},
          },
        }

        const status = getLicenceStatus(licence)

        expect(status.tasks.riskManagement).toEqual(TaskState.UNSTARTED)
      })

      test('should show risk management version 1 STARTED when planning actions confirmed but proposedAddressSuitable and awaitingRiskInformation remain unanswered', () => {
        const licence = {
          stage: 'PROCESSING_RO',
          licence: {
            risk: {
              riskManagement: {
                version: '1',
                planningActions: 'Yes',
              },
            },
          },
        }

        const status = getLicenceStatus(licence)

        expect(status.tasks.riskManagement).toEqual(TaskState.STARTED)
        expect(status.decisions.riskManagementNeeded).toBe(true)
        expect(status.decisions.showMandatoryAddressChecksNotCompletedWarning).toBe(false)
        expect(status.decisions.awaitingRiskInformation).toBe(false)
      })

      test('should show risk management version 2 STARTED when mandatory address checks question has been answered but proposedAddressSuitable and awaitingRiskInformation remain unanswered', () => {
        const licence = {
          stage: 'PROCESSING_RO',
          licence: {
            risk: {
              riskManagement: {
                version: '2',
                hasConsideredChecks: 'No',
              },
            },
          },
        }

        const status = getLicenceStatus(licence)

        expect(status.tasks.riskManagement).toEqual(TaskState.STARTED)
        expect(status.decisions.showMandatoryAddressChecksNotCompletedWarning).toBe(true)
        expect(status.decisions.riskManagementNeeded).toBe(false)
        expect(status.decisions.awaitingRiskInformation).toBe(false)
      })

      test('should show risk management version 1 DONE when planning actions check has been completed and proposedAddressSuitable and awaitingRiskInformation answered', () => {
        const licence = {
          stage: 'PROCESSING_RO',
          licence: {
            risk: {
              riskManagement: {
                version: '1',
                planningActions: 'Yes',
                awaitingInformation: 'Yes',
                proposedAddressSuitable: 'Yes',
              },
            },
          },
        }

        const status = getLicenceStatus(licence)

        expect(status.tasks.riskManagement).toEqual(TaskState.DONE)
        expect(status.decisions.riskManagementNeeded).toBe(true)
        expect(status.decisions.awaitingRiskInformation).toBe(true)
      })

      test('should show risk management version 2 DONE when mandatory address checks have been considered and proposedAddressSuitable and awaitingRiskInformation answered', () => {
        const licence = {
          stage: 'PROCESSING_RO',
          licence: {
            risk: {
              riskManagement: {
                version: '2',
                hasConsideredChecks: 'Yes',
                awaitingOtherInformation: 'No',
                proposedAddressSuitable: 'Yes',
              },
            },
          },
        }

        const status = getLicenceStatus(licence)

        expect(status.tasks.riskManagement).toEqual(TaskState.DONE)
        expect(status.decisions.showMandatoryAddressChecksNotCompletedWarning).toBe(false)
        expect(status.decisions.awaitingRiskInformation).toBe(false)
      })

      test('should show risk management version 3 DONE when mandatory address checks have been considered and proposedAddressSuitable, awaitingRiskInformation, manageInTheCommunity, mentalHealthPlan and pomConsultation answered', () => {
        const licence = {
          stage: 'PROCESSING_RO',
          licence: {
            risk: {
              riskManagement: {
                version: '3',
                hasConsideredChecks: 'Yes',
                awaitingOtherInformation: 'No',
                proposedAddressSuitable: 'Yes',
                manageInTheCommunity: 'Yes',
                mentalHealthPlan: 'No',
                pomConsultation: 'Yes',
              },
            },
          },
        }

        const status = getLicenceStatus(licence)

        expect(status.tasks.riskManagement).toEqual(TaskState.DONE)
        expect(status.decisions.showMandatoryAddressChecksNotCompletedWarning).toBe(false)
        expect(status.decisions.awaitingRiskInformation).toBe(false)
      })

      test('should show risk management version 2 STARTED if all questions answered but mandatory address checks answer is No', () => {
        const licence = {
          stage: 'PROCESSING_RO',
          licence: {
            risk: {
              riskManagement: {
                version: '2',
                hasConsideredChecks: 'No',
                awaitingOtherInformation: 'No',
                emsInformation: 'Yes',
                emsInformationDetails: 'some details',
                nonDisclosableInformation: 'No',
                nonDisclosableInformationDetails: '',
                proposedAddressSuitable: 'Yes',
                riskManagementDetails: 'some details',
                unsuitableReason: '',
              },
            },
          },
        }

        const status = getLicenceStatus(licence)

        expect(status.tasks.riskManagement).toEqual(TaskState.STARTED)
        expect(status.decisions.showMandatoryAddressChecksNotCompletedWarning).toBe(true)
        expect(status.decisions.riskManagementNeeded).toBe(false)
        expect(status.decisions.awaitingRiskInformation).toBe(false)
      })

      test('should show risk management version 3 STARTED if questions answered apart from manageInTheCommunity, mentalHealthPlan and pomConsultation', () => {
        const licence = {
          stage: 'PROCESSING_RO',
          licence: {
            risk: {
              riskManagement: {
                version: '3',
                hasConsideredChecks: 'Yes',
                awaitingOtherInformation: 'No',
                emsInformation: 'Yes',
                emsInformationDetails: 'some details',
                nonDisclosableInformation: 'No',
                nonDisclosableInformationDetails: '',
                proposedAddressSuitable: 'Yes',
                riskManagementDetails: 'some details',
                unsuitableReason: '',
              },
            },
          },
        }

        const status = getLicenceStatus(licence)

        expect(status.tasks.riskManagement).toEqual(TaskState.STARTED)
        expect(status.decisions.showMandatoryAddressChecksNotCompletedWarning).toBe(false)
        expect(status.decisions.riskManagementNeeded).toBe(false)
        expect(status.decisions.awaitingRiskInformation).toBe(false)
      })

      test('should show risk management version 3 STARTED if all questions answered including mentalHealthPlan as Yes but prisonHealthcareConsultation not answered', () => {
        const licence = {
          stage: 'PROCESSING_RO',
          licence: {
            risk: {
              riskManagement: {
                version: '3',
                hasConsideredChecks: 'Yes',
                awaitingOtherInformation: 'No',
                emsInformation: 'Yes',
                emsInformationDetails: 'some details',
                nonDisclosableInformation: 'No',
                nonDisclosableInformationDetails: '',
                proposedAddressSuitable: 'Yes',
                riskManagementDetails: 'some details',
                unsuitableReason: '',
                manageInTheCommunity: 'Yes',
                mentalHealthPlan: 'Yes',
                prisonHealthcareConsultation: '',
                pomConsultation: 'Yes',
              },
            },
          },
        }

        const status = getLicenceStatus(licence)

        expect(status.tasks.riskManagement).toEqual(TaskState.STARTED)
        expect(status.decisions.showMandatoryAddressChecksNotCompletedWarning).toBe(false)
        expect(status.decisions.riskManagementNeeded).toBe(false)
        expect(status.decisions.awaitingRiskInformation).toBe(false)
      })

      test('should show risk management prisonHealthcareNotConsulted warning when version 3, mentalHealthPlan answered as Yes and prisonHealthcareConsultation answered as No', () => {
        const licence = {
          stage: 'PROCESSING_RO',
          licence: {
            risk: {
              riskManagement: {
                version: '3',
                hasConsideredChecks: 'Yes',
                awaitingOtherInformation: 'No',
                emsInformation: 'Yes',
                emsInformationDetails: 'some details',
                nonDisclosableInformation: 'No',
                nonDisclosableInformationDetails: '',
                proposedAddressSuitable: 'Yes',
                riskManagementDetails: 'some details',
                unsuitableReason: '',
                manageInTheCommunity: 'Yes',
                mentalHealthPlan: 'Yes',
                prisonHealthcareConsultation: 'No',
                pomConsultation: 'Yes',
              },
            },
          },
        }

        const status = getLicenceStatus(licence)

        expect(status.decisions.prisonHealthcareNotConsulted).toBe(true)
      })

      test('should show risk management version 2 DONE if all questions answered when mandatory address checks answer is No but bass property has been requested', () => {
        const licence = {
          stage: 'PROCESSING_RO',
          licence: {
            bassReferral: {
              bassRequest: {
                bassRequested: 'Yes',
              },
            },
            risk: {
              riskManagement: {
                version: '2',
                hasConsideredChecks: 'No',
                awaitingOtherInformation: 'No',
                emsInformation: 'Yes',
                emsInformationDetails: 'some details',
                nonDisclosableInformation: 'No',
                nonDisclosableInformationDetails: '',
                proposedAddressSuitable: 'Yes',
                riskManagementDetails: 'some details',
                unsuitableReason: '',
              },
            },
          },
        }

        const status = getLicenceStatus(licence)

        expect(status.tasks.riskManagement).toEqual(TaskState.DONE)
        expect(status.decisions.showMandatoryAddressChecksNotCompletedWarning).toBe(false)
        expect(status.decisions.riskManagementNeeded).toBe(false)
        expect(status.decisions.awaitingRiskInformation).toBe(false)
      })
    })

    describe('curfewAddressReview task', () => {
      describe('offender is main occupier', () => {
        test('should be UNSTARTED when electricity not answered', () => {
          const licence = {
            stage: 'PROCESSING_RO',
            licence: {
              proposedAddress: {
                curfewAddress: {
                  occupier: {
                    isOffender: 'Yes',
                  },
                },
              },
              curfew: {
                curfewAddressReview: {},
              },
            },
          }
          const status = getLicenceStatus(licence)
          expect(status.tasks.curfewAddressReview).toEqual(TaskState.UNSTARTED)
        })
        test('should be DONE when electricity answered', () => {
          const licence = {
            stage: 'PROCESSING_RO',
            licence: {
              proposedAddress: {
                curfewAddress: {
                  occupier: {
                    isOffender: 'Yes',
                  },
                },
              },
              curfew: {
                curfewAddressReview: {
                  electricity: 'No',
                },
              },
            },
          }
          const status = getLicenceStatus(licence)
          expect(status.tasks.curfewAddressReview).toEqual(TaskState.DONE)
        })
      })

      describe('offender is not main occupier', () => {
        test('should be DONE when consent & electricity answered', () => {
          const licence = {
            stage: 'PROCESSING_RO',
            licence: {
              proposedAddress: {
                curfewAddress: {
                  occupier: {
                    isOffender: 'No',
                  },
                },
              },
              curfew: {
                curfewAddressReview: {
                  electricity: 'Yes',
                  consent: 'No',
                },
              },
            },
          }
          const status = getLicenceStatus(licence)
          expect(status.tasks.curfewAddressReview).toEqual(TaskState.DONE)
        })
        test('should be STARTED when consent answered', () => {
          const licence = {
            stage: 'PROCESSING_RO',
            licence: {
              proposedAddress: {
                curfewAddress: {
                  occupier: {
                    isOffender: 'No',
                  },
                },
              },
              curfew: {
                curfewAddressReview: {
                  consent: 'No',
                },
              },
            },
          }
          const status = getLicenceStatus(licence)
          expect(status.tasks.curfewAddressReview).toEqual(TaskState.STARTED)
        })
        test('should be STARTED when electricity answered', () => {
          const licence = {
            stage: 'PROCESSING_RO',
            licence: {
              proposedAddress: {
                curfewAddress: {
                  occupier: {
                    isOffender: 'No',
                  },
                },
              },
              curfew: {
                curfewAddressReview: {
                  electricity: 'No',
                },
              },
            },
          }
          const status = getLicenceStatus(licence)
          expect(status.tasks.curfewAddressReview).toEqual(TaskState.STARTED)
        })
        test('should be UNSTARTED when electricity and consent not answered', () => {
          const licence = {
            stage: 'PROCESSING_RO',
            licence: {
              proposedAddress: {
                curfewAddress: {
                  occupier: {
                    isOffender: 'No',
                  },
                },
              },
              curfew: {
                curfewAddressReview: {},
              },
            },
          }
          const status = getLicenceStatus(licence)
          expect(status.tasks.curfewAddressReview).toEqual(TaskState.UNSTARTED)
        })
      })
    })

    describe('bass address RO task', () => {
      test('should show bassAreaCheck UNSTARTED when empty', () => {
        const licence = {
          stage: 'PROCESSING_RO',
          licence: {
            bassReferral: {
              bassAreaCheck: {},
            },
          },
        }

        const status = getLicenceStatus(licence)

        expect(status.tasks.bassAreaCheck).toEqual(TaskState.UNSTARTED)
        expect(status.decisions.bassAreaSuitable).toEqual(undefined)
      })

      test('should show bassAreaCheck STARTED when unsuitable and no reason', () => {
        const licence = {
          stage: 'PROCESSING_RO',
          licence: {
            bassReferral: {
              bassAreaCheck: {
                bassAreaSuitable: 'No',
              },
            },
          },
        }

        const status = getLicenceStatus(licence)

        expect(status.tasks.bassAreaCheck).toEqual(TaskState.STARTED)
        expect(status.decisions.bassAreaSuitable).toBe(false)
      })

      test('should show bassAreaCheck DONE when unsuitable with reason', () => {
        const licence = {
          stage: 'PROCESSING_RO',
          licence: {
            bassReferral: {
              bassAreaCheck: {
                bassAreaSuitable: 'No',
                bassAreaReason: 'reason',
              },
            },
          },
        }

        const status = getLicenceStatus(licence)

        expect(status.tasks.bassAreaCheck).toEqual(TaskState.DONE)
        expect(status.decisions.bassAreaNotSuitable).toBe(true)
      })
    })

    describe('Approved Premises address', () => {
      test('should be UNSTARTED when empty', () => {
        const licence = {
          stage: 'PROCESSING_RO',
          licence: {
            curfew: {
              approvedPremises: {
                required: 'Yes',
              },
              approvedPremisesAddress: {},
            },
          },
        }
        const status = getLicenceStatus(licence)
        expect(status.tasks.approvedPremisesAddress).toEqual(TaskState.UNSTARTED)
      })
      test('should be UNSTARTED when approved premises not required', () => {
        const licence = {
          stage: 'PROCESSING_RO',
          licence: {
            curfew: {
              approvedPremises: {
                required: 'No',
              },
              approvedPremisesAddress: {
                addressLine1: '1',
                addressTown: '1',
                postCode: '1',
              },
            },
          },
        }
        const status = getLicenceStatus(licence)
        expect(status.tasks.approvedPremisesAddress).toEqual(TaskState.UNSTARTED)
      })
      test('should be STARTED if some present', () => {
        const licence = {
          stage: 'PROCESSING_RO',
          licence: {
            curfew: {
              approvedPremises: {
                required: 'Yes',
              },
              approvedPremisesAddress: {
                addressLine1: '1',
              },
            },
          },
        }
        const status = getLicenceStatus(licence)
        expect(status.tasks.approvedPremisesAddress).toEqual(TaskState.STARTED)
      })
      test('should be DONE when all mandatory present', () => {
        const licence = {
          stage: 'PROCESSING_RO',
          licence: {
            curfew: {
              approvedPremises: {
                required: 'Yes',
              },
              approvedPremisesAddress: {
                addressLine1: '1',
                addressTown: '1',
                postCode: '1',
              },
            },
          },
        }
        const status = getLicenceStatus(licence)
        expect(status.tasks.approvedPremisesAddress).toEqual(TaskState.DONE)
      })
    })
  })

  describe('PROCESSING_CA', () => {
    describe('final checks address review', () => {
      test('should show approved premises required for bug DCS-650', () => {
        const licence = {
          stage: 'PROCESSING_CA',
          licence: {
            risk: {
              riskManagement: {
                planningActions: 'No',
                unsuitableReason: '',
                awaitingInformation: 'No',
                riskManagementDetails:
                  'Having contacted the Approved Premises, it is clear that an Approved Premises place cannot be put in place in time for a HDC release or 10 prior.',
                proposedAddressSuitable: 'No',
                nonDisclosableInformation: 'No',
                nonDisclosableInformationDetails: '',
              },
            },
            curfew: {
              approvedPremises: {
                required: 'No',
              },
            },
            eligibility: {
              crdTime: {
                decision: 'No',
              },
              excluded: {
                decision: 'No',
              },
              suitability: {
                decision: 'No',
              },
            },
            bassReferral: {
              bassRequest: {
                proposedTown: 'Test Town',
                specificArea: 'Yes',
                bassRequested: 'Yes',
                proposedCounty: 'Test County',
                additionalInformation: 'PLEASE COMPLETE AS AP AS PER EMAIL',
              },
              bassAreaCheck: {
                bassAreaReason: '',
                bassAreaCheckSeen: 'true',
                approvedPremisesRequiredYesNo: 'Yes',
              },
              approvedPremisesAddress: {
                postCode: 'TEST',
                telephone: '00000000000',
                addressTown: 'Test Town',
                addressLine1: 'Test Street',
                addressLine2: 'Off Test Road',
              },
            },
            proposedAddress: {
              optOut: {
                decision: 'No',
              },
              addressProposed: {
                decision: 'No',
              },
            },
          },
        }

        const status = getLicenceStatus(licence)

        expect(status.decisions.approvedPremisesRequired).toBe(true)
      })

      test('should show address review APPROVED when consent, electricity and curfewAddressApproved are Yes', () => {
        const licence = {
          stage: 'PROCESSING_CA',
          licence: {
            proposedAddress: {
              curfewAddress: {
                addressLine1: 'address',
              },
            },
            curfew: {
              curfewHours: 'anything',
              curfewAddressReview: {
                consent: 'Yes',
                electricity: 'Yes',
                homeVisitConducted: 'No',
              },
            },
            risk: {
              riskManagement: {
                proposedAddressSuitable: 'Yes',
              },
            },
          },
        }

        const status = getLicenceStatus(licence)

        expect(status.decisions.curfewAddressApproved).toBe(true)
      })

      test('should show address review WITHDRAWN when in rejections list', () => {
        const licence = {
          stage: 'PROCESSING_CA',
          licence: {
            proposedAddress: {
              curfewAddress: {},
              rejections: [
                {
                  address: {
                    addressLine1: 'line1',
                  },
                  addressReview: {
                    curfewAddressReview: {
                      consent: 'Yes',
                      electricity: 'Yes',
                      homeVisitConducted: 'Yes',
                    },
                  },
                  withdrawalReason: 'withdrawAddress',
                },
              ],
            },
            risk: {
              riskManagement: {
                proposedAddressSuitable: 'Yes',
              },
            },
            curfew: {
              curfewHours: 'anything',
            },
          },
        }

        const status = getLicenceStatus(licence)

        expect(status.decisions.addressWithdrawn).toBe(true)
      })

      test('should show address review REJECTED when address is not suitable', () => {
        const licence = {
          stage: 'PROCESSING_CA',
          licence: {
            proposedAddress: {
              curfewAddress: {
                addressLine1: 'address',
              },
            },
            curfew: {
              curfewHours: 'anything',
              curfewAddressReview: {
                consent: 'Yes',
                electricity: 'Yes',
                homeVisitConducted: 'No',
              },
            },
            risk: {
              riskManagement: {
                proposedAddressSuitable: 'No',
              },
            },
          },
        }

        const status = getLicenceStatus(licence)

        expect(status.decisions.curfewAddressRejected).toBe(true)
        expect(status.decisions.addressReviewFailed).toBe(false)
        expect(status.decisions.addressUnsuitable).toBe(true)
      })

      test('should show address review UNSTARTED when there are active addresses', () => {
        const licence = {
          stage: 'PROCESSING_CA',
          licence: {
            proposedAddress: {
              curfewAddress: {
                addresses: [
                  {
                    consent: 'Yes',
                    electricity: 'Yes',
                    homeVisitConducted: 'No',
                  },
                  {
                    addressLine1: 'a',
                  },
                ],
              },
              risk: {
                riskManagement: {
                  proposedAddressSuitable: 'No',
                },
              },
            },
            curfew: {
              curfewHours: 'anything',
            },
          },
        }

        const status = getLicenceStatus(licence)

        expect(status.tasks.curfewAddressReview).toEqual(TaskState.UNSTARTED)
      })

      test('should show refusal reason and caRefused in PROCESSING_CA', () => {
        const licence = {
          stage: 'PROCESSING_CA',
          licence: {
            finalChecks: {
              refusal: {
                decision: 'Yes',
                reason: 'addressUnsuitable',
              },
            },
          },
        }

        const status = getLicenceStatus(licence)

        expect(status.decisions.caRefused).toEqual(true)
        expect(status.decisions.refusalReason).toEqual('No available address')
      })
    })
  })

  describe('ELIGIBILITY', () => {
    test('should show unsuitableResult true when unsuitable and no exceptional circumstances', () => {
      const licence = {
        stage: 'APPROVAL',
        licence: {
          eligibility: {
            excluded: {
              decision: 'Yes',
            },
            suitability: {
              decision: 'Yes',
            },
            exceptionalCircumstances: {
              decision: 'No',
            },
            crdTime: {
              decision: 'Yes',
            },
          },
        },
      }

      const status = getLicenceStatus(licence)

      expect(status.decisions.unsuitableResult).toBe(true)
    })

    test('should show NOT unsuitableResult true when unsuitable and there are exceptional circumstances', () => {
      const licence = {
        stage: 'APPROVAL',
        licence: {
          eligibility: {
            excluded: {
              decision: 'Yes',
            },
            suitability: {
              decision: 'Yes',
            },
            exceptionalCircumstances: {
              decision: 'Yes',
            },
            crdTime: {
              decision: 'Yes',
            },
          },
        },
      }

      const status = getLicenceStatus(licence)

      expect(status.decisions.unsuitableResult).toBe(false)
    })

    test('should show eligible when eligibility decisions false', () => {
      const licence = {
        stage: 'ELIGIBILITY',
        licence: {
          eligibility: {
            excluded: {
              decision: 'No',
            },
            suitability: {
              decision: 'No',
            },
            crdTime: {
              decision: 'No',
            },
          },
        },
      }

      const status = getLicenceStatus(licence)

      expect(status.decisions.eligible).toBe(true)
    })

    test('should show NOT eligible when eligibility decision true', () => {
      const licence = {
        stage: 'ELIGIBILITY',
        licence: {
          eligibility: {
            excluded: {
              decision: 'No',
            },
            suitability: {
              decision: 'Yes',
            },
            exceptionalCircumstances: {
              decision: 'No',
            },
            crdTime: {
              decision: 'No',
            },
          },
        },
      }

      const status = getLicenceStatus(licence)

      expect(status.decisions.eligible).toBe(false)
    })

    test('should show eligible when unsuitable but exceptional circumstances', () => {
      const licence = {
        stage: 'ELIGIBILITY',
        licence: {
          eligibility: {
            excluded: {
              decision: 'No',
            },
            suitability: {
              decision: 'Yes',
            },
            exceptionalCircumstances: {
              decision: 'Yes',
            },
            crdTime: {
              decision: 'No',
            },
          },
        },
      }

      const status = getLicenceStatus(licence)

      expect(status.decisions.eligible).toBe(true)
    })
  })

  describe('Post-decision', () => {
    test('should show createLicence task UNSTARTED when no approved version', () => {
      const licence = {
        stage: 'DECIDED',
        version: 1,
        licence: {
          notEmpty: true,
        },
      }

      const status = getLicenceStatus(licence)

      expect(status.tasks.createLicence).toEqual(TaskState.UNSTARTED)
    })

    test('should show createLicence task UNSTARTED when working version higher than approved version', () => {
      const licence = {
        stage: 'DECIDED',
        version: 2,
        approved_version: 1,
        licence: {
          notEmpty: true,
        },
      }

      const status = getLicenceStatus(licence)

      expect(status.tasks.createLicence).toEqual(TaskState.UNSTARTED)
    })

    test('should show createLicence task DONE when working version is the same as approved version', () => {
      const licence = {
        stage: 'DECIDED',
        version: 2,
        approved_version: 2,
        licence: {
          notEmpty: true,
        },
      }

      const status = getLicenceStatus(licence)

      expect(status.tasks.createLicence).toEqual(TaskState.DONE)
    })
  })

  describe('Eligibility', () => {
    test('should show eligibility DONE when excluded is YES', () => {
      const licence = {
        stage: 'PROCESSING_CA',
        licence: {
          eligibility: {
            excluded: {
              decision: 'Yes',
            },
          },
        },
      }

      const status = getLicenceStatus(licence)

      expect(status.tasks.eligibility).toEqual(TaskState.DONE)
    })

    test('should show eligibility DONE when (un)suitabililty is YES and exceptionalCircumstances is answered', () => {
      const licence = {
        stage: 'PROCESSING_CA',
        licence: {
          eligibility: {
            excluded: {
              decision: 'No',
            },
            suitability: {
              decision: 'Yes',
            },
            exceptionalCircumstances: {
              decision: 'No',
            },
          },
        },
      }

      const status = getLicenceStatus(licence)

      expect(status.tasks.eligibility).toEqual(TaskState.DONE)
    })

    test('should show eligibility STARTED when (un)suitabililty is YES and exceptionalCircumstances missing', () => {
      const licence = {
        stage: 'PROCESSING_CA',
        licence: {
          eligibility: {
            excluded: {
              decision: 'No',
            },
            suitability: {
              decision: 'Yes',
            },
            exceptionalCircumstances: {},
          },
        },
      }

      const status = getLicenceStatus(licence)

      expect(status.tasks.eligibility).toEqual(TaskState.STARTED)
    })

    test('should show eligibility STARTED when (un)suitabililty is No and excluded is No but no crdTime', () => {
      const licence = {
        stage: 'PROCESSING_CA',
        licence: {
          eligibility: {
            excluded: {
              decision: 'No',
            },
            suitability: {
              decision: 'No',
            },
          },
        },
      }

      const status = getLicenceStatus(licence)

      expect(status.tasks.eligibility).toEqual(TaskState.STARTED)
    })

    test('should show eligibility DONE when suitability is No and excluded is No but and complete crdTime', () => {
      const licence = {
        stage: 'PROCESSING_CA',
        licence: {
          eligibility: {
            excluded: {
              decision: 'No',
            },
            suitability: {
              decision: 'No',
            },
            crdTime: {
              decision: 'Yes',
              dmApproval: 'No',
            },
          },
        },
      }

      const status = getLicenceStatus(licence)

      expect(status.tasks.eligibility).toEqual(TaskState.DONE)
    })
  })

  describe('Eligibility - Proposed Address', () => {
    test('should show curfew address DONE when opted out', () => {
      const licence = {
        stage: 'PROCESSING_CA',
        licence: { proposedAddress: { optOut: { decision: 'Yes' } } },
      }

      const status = getLicenceStatus(licence)
      expect(status.tasks.curfewAddress).toEqual(TaskState.DONE)
    })

    test('should show curfew address DONE when bass referral needed', () => {
      const licence = {
        stage: 'PROCESSING_CA',
        licence: {
          proposedAddress: { addressProposed: { decision: 'No' } },
          bassReferral: { bassRequest: { bassRequested: 'Yes' } },
        },
      }

      const status = getLicenceStatus(licence)
      expect(status.tasks.curfewAddress).toEqual(TaskState.DONE)
    })

    test('should show curfew address UNSTARTED when no addresses', () => {
      const licence = {
        stage: 'PROCESSING_CA',
        licence: { proposedAddress: {} },
      }

      const status = getLicenceStatus(licence)
      expect(status.tasks.curfewAddress).toEqual(TaskState.UNSTARTED)
    })

    test('should show curfew address DONE when minimum fields not empty', () => {
      const licence = {
        stage: 'PROCESSING_CA',
        licence: {
          proposedAddress: {
            curfewAddress: {
              addressLine1: 'a',
              addressTown: 'b',
              postCode: 'c',
              telephone: 'd',
              cautionedAgainstResident: 'e',
            },
          },
        },
      }

      const status = getLicenceStatus(licence)
      expect(status.tasks.curfewAddress).toEqual(TaskState.DONE)
    })

    test('should show curfew address STARTED if any of minimum fields empty', () => {
      const licence = {
        stage: 'PROCESSING_CA',
        licence: {
          proposedAddress: {
            curfewAddress: {
              addressLine1: '',
              addressTown: 'b',
              postCode: 'c',
              telephone: 'd',
              cautionedAgainstResident: 'e',
            },
          },
        },
      }

      const status = getLicenceStatus(licence)
      expect(status.tasks.curfewAddress).toEqual(TaskState.STARTED)
    })

    test('should show curfew address as STARTED if telephone empty and Main Occupier NOT checked', () => {
      const licence = {
        stage: 'PROCESSING_CA',
        licence: {
          proposedAddress: {
            curfewAddress: {
              addressLine1: '123 ABC',
              addressTown: 'b',
              postCode: 'c',
              telephone: '',
              occupier: {
                isOffender: 'No',
              },
            },
          },
        },
      }

      const status = getLicenceStatus(licence)
      expect(status.tasks.curfewAddress).toEqual(TaskState.STARTED)
    })

    test('should show curfew address as DONE if telephone empty and Main Occupier IS checked', () => {
      const licence = {
        stage: 'PROCESSING_CA',
        licence: {
          proposedAddress: {
            curfewAddress: {
              addressLine1: '123 ABC',
              addressTown: 'b',
              postCode: 'c',
              cautionedAgainstResident: 'e',
              telephone: '',
              occupier: {
                isOffender: 'Yes',
              },
            },
          },
        },
      }

      const status = getLicenceStatus(licence)
      expect(status.tasks.curfewAddress).toEqual(TaskState.DONE)
    })
  })
})
