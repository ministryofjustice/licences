import getLicenceStatus from '../../server/utils/licenceStatus'
import { taskStates } from '../../server/services/config/taskStates'

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
      expect(status.decisions.finalChecksPass).toBe(false)
      expect(status.decisions.postponed).toBe(true)
      expect(status.decisions.approved).toBe(true)
      expect(status.decisions.refused).toBe(false)
      expect(status.decisions.dmRefused).toBe(false)
      expect(status.decisions.offenderIsMainOccupier).toBe(true)
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
            postpone: {
              decision: 'No',
            },
          },
          approval: {
            release: {
              decision: 'No',
              reason: ['noAvailableAddress', 'addressUnsuitable', 'outOfTime', 'insufficientTime'],
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

      expect(status.tasks.exclusion).toEqual(taskStates.UNSTARTED)
      expect(status.tasks.crdTime).toEqual(taskStates.UNSTARTED)
      expect(status.tasks.suitability).toEqual(taskStates.UNSTARTED)
      expect(status.tasks.eligibility).toEqual(taskStates.UNSTARTED)
      expect(status.tasks.optOut).toEqual(taskStates.UNSTARTED)
      expect(status.tasks.bassRequest).toEqual(taskStates.UNSTARTED)
      expect(status.tasks.bassAreaCheck).toEqual(taskStates.UNSTARTED)
      expect(status.tasks.bassOffer).toEqual(taskStates.UNSTARTED)
      expect(status.tasks.bassAddress).toEqual(taskStates.UNSTARTED)
      expect(status.tasks.curfewAddress).toEqual(taskStates.UNSTARTED)
      expect(status.tasks.curfewAddressReview).toEqual(taskStates.UNSTARTED)
      expect(status.tasks.curfewHours).toEqual(taskStates.UNSTARTED)
      expect(status.tasks.licenceConditions).toEqual(taskStates.UNSTARTED)
      expect(status.tasks.riskManagement).toEqual(taskStates.UNSTARTED)
      expect(status.tasks.reportingInstructions).toEqual(taskStates.UNSTARTED)
      expect(status.tasks.seriousOffenceCheck).toEqual(taskStates.UNSTARTED)
      expect(status.tasks.onRemandCheck).toEqual(taskStates.UNSTARTED)
      expect(status.tasks.confiscationOrderCheck).toEqual(taskStates.UNSTARTED)
      expect(status.tasks.finalChecks).toEqual(taskStates.UNSTARTED)
      expect(status.tasks.approval).toEqual(taskStates.UNSTARTED)
      expect(status.tasks.createLicence).toEqual(taskStates.UNSTARTED)
      expect(status.tasks.approvedPremisesAddress).toEqual(taskStates.UNSTARTED)
    })

    test('should show tasks UNSTARTED when task data missing', () => {
      const licence = {
        stage: 'APPROVAL',
        licence: {},
      }

      const status = getLicenceStatus(licence)

      expect(status.tasks.exclusion).toEqual(taskStates.UNSTARTED)
      expect(status.tasks.crdTime).toEqual(taskStates.UNSTARTED)
      expect(status.tasks.suitability).toEqual(taskStates.UNSTARTED)
      expect(status.tasks.eligibility).toEqual(taskStates.UNSTARTED)
      expect(status.tasks.optOut).toEqual(taskStates.UNSTARTED)
      expect(status.tasks.bassRequest).toEqual(taskStates.UNSTARTED)
      expect(status.tasks.bassAreaCheck).toEqual(taskStates.UNSTARTED)
      expect(status.tasks.bassOffer).toEqual(taskStates.UNSTARTED)
      expect(status.tasks.bassAddress).toEqual(taskStates.UNSTARTED)
      expect(status.tasks.curfewAddress).toEqual(taskStates.UNSTARTED)
      expect(status.tasks.curfewAddressReview).toEqual(taskStates.UNSTARTED)
      expect(status.tasks.curfewHours).toEqual(taskStates.UNSTARTED)
      expect(status.tasks.licenceConditions).toEqual(taskStates.UNSTARTED)
      expect(status.tasks.riskManagement).toEqual(taskStates.UNSTARTED)
      expect(status.tasks.reportingInstructions).toEqual(taskStates.UNSTARTED)
      expect(status.tasks.seriousOffenceCheck).toEqual(taskStates.UNSTARTED)
      expect(status.tasks.onRemandCheck).toEqual(taskStates.UNSTARTED)
      expect(status.tasks.confiscationOrderCheck).toEqual(taskStates.UNSTARTED)
      expect(status.tasks.finalChecks).toEqual(taskStates.UNSTARTED)
      expect(status.tasks.approval).toEqual(taskStates.UNSTARTED)
      expect(status.tasks.createLicence).toEqual(taskStates.UNSTARTED)
      expect(status.tasks.approvedPremisesAddress).toEqual(taskStates.UNSTARTED)
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

      expect(status.tasks.curfewAddress).toEqual(taskStates.STARTED)
      expect(status.tasks.bassAddress).toEqual(taskStates.STARTED)
      expect(status.tasks.curfewAddressReview).toEqual(taskStates.STARTED)
      expect(status.tasks.licenceConditions).toEqual(taskStates.STARTED)
      expect(status.tasks.riskManagement).toEqual(taskStates.STARTED)
      expect(status.tasks.finalChecks).toEqual(taskStates.STARTED)
      expect(status.tasks.approvedPremisesAddress).toEqual(taskStates.STARTED)
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
              reason: 'blah',
            },
            suitability: {
              decision: 'Yes',
              reason: 'blah',
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
              reason: 'blah',
            },
            curfewAddress: {
              addressLine1: 'line',
              occupier: 'occupier',
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

      expect(status.tasks.exclusion).toEqual(taskStates.DONE)
      expect(status.tasks.crdTime).toEqual(taskStates.DONE)
      expect(status.tasks.suitability).toEqual(taskStates.DONE)
      expect(status.tasks.eligibility).toEqual(taskStates.DONE)
      expect(status.tasks.optOut).toEqual(taskStates.DONE)
      expect(status.tasks.bassRequest).toEqual(taskStates.DONE)
      expect(status.tasks.bassAreaCheck).toEqual(taskStates.DONE)
      expect(status.tasks.bassOffer).toEqual(taskStates.DONE)
      expect(status.tasks.bassAddress).toEqual(taskStates.DONE)
      expect(status.tasks.curfewAddress).toEqual(taskStates.DONE)
      expect(status.tasks.curfewAddressReview).toEqual(taskStates.DONE)
      expect(status.tasks.curfewHours).toEqual(taskStates.DONE)
      expect(status.tasks.licenceConditions).toEqual(taskStates.DONE)
      expect(status.tasks.riskManagement).toEqual(taskStates.DONE)
      expect(status.tasks.reportingInstructions).toEqual(taskStates.DONE)
      expect(status.tasks.seriousOffenceCheck).toEqual(taskStates.DONE)
      expect(status.tasks.onRemandCheck).toEqual(taskStates.DONE)
      expect(status.tasks.confiscationOrderCheck).toEqual(taskStates.DONE)
      expect(status.tasks.finalChecks).toEqual(taskStates.DONE)
      expect(status.tasks.approval).toEqual(taskStates.DONE)
      expect(status.tasks.createLicence).toEqual(taskStates.DONE)
      expect(status.tasks.approvedPremisesAddress).toEqual(taskStates.DONE)
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
          expect(status.tasks.curfewAddressReview).toEqual(taskStates.UNSTARTED)
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
          expect(status.tasks.curfewAddressReview).toEqual(taskStates.DONE)
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
          expect(status.tasks.curfewAddressReview).toEqual(taskStates.DONE)
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
          expect(status.tasks.curfewAddressReview).toEqual(taskStates.STARTED)
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
          expect(status.tasks.curfewAddressReview).toEqual(taskStates.STARTED)
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
          expect(status.tasks.curfewAddressReview).toEqual(taskStates.UNSTARTED)
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

        expect(status.tasks.bassAreaCheck).toEqual(taskStates.UNSTARTED)
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

        expect(status.tasks.bassAreaCheck).toEqual(taskStates.STARTED)
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

        expect(status.tasks.bassAreaCheck).toEqual(taskStates.DONE)
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
        expect(status.tasks.approvedPremisesAddress).toEqual(taskStates.UNSTARTED)
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
        expect(status.tasks.approvedPremisesAddress).toEqual(taskStates.UNSTARTED)
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
        expect(status.tasks.approvedPremisesAddress).toEqual(taskStates.STARTED)
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
        expect(status.tasks.approvedPremisesAddress).toEqual(taskStates.DONE)
      })
    })
  })

  describe('PROCESSING_CA', () => {
    describe('final checks address review', () => {
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

        expect(status.tasks.curfewAddressReview).toEqual(taskStates.UNSTARTED)
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

      expect(status.tasks.createLicence).toEqual(taskStates.UNSTARTED)
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

      expect(status.tasks.createLicence).toEqual(taskStates.UNSTARTED)
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

      expect(status.tasks.createLicence).toEqual(taskStates.DONE)
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

      expect(status.tasks.eligibility).toEqual(taskStates.DONE)
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

      expect(status.tasks.eligibility).toEqual(taskStates.DONE)
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

      expect(status.tasks.eligibility).toEqual(taskStates.STARTED)
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

      expect(status.tasks.eligibility).toEqual(taskStates.STARTED)
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

      expect(status.tasks.eligibility).toEqual(taskStates.DONE)
    })
  })

  describe('Eligibility - Proposed Address', () => {
    test('should show curfew address DONE when opted out', () => {
      const licence = {
        stage: 'PROCESSING_CA',
        licence: { proposedAddress: { optOut: { decision: 'Yes' } } },
      }

      const status = getLicenceStatus(licence)
      expect(status.tasks.curfewAddress).toEqual(taskStates.DONE)
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
      expect(status.tasks.curfewAddress).toEqual(taskStates.DONE)
    })

    test('should show curfew address UNSTARTED when no addresses', () => {
      const licence = {
        stage: 'PROCESSING_CA',
        licence: { proposedAddress: {} },
      }

      const status = getLicenceStatus(licence)
      expect(status.tasks.curfewAddress).toEqual(taskStates.UNSTARTED)
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
      expect(status.tasks.curfewAddress).toEqual(taskStates.DONE)
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
      expect(status.tasks.curfewAddress).toEqual(taskStates.STARTED)
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
      expect(status.tasks.curfewAddress).toEqual(taskStates.STARTED)
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
      expect(status.tasks.curfewAddress).toEqual(taskStates.DONE)
    })
  })
})
