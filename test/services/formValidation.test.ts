import moment from 'moment'
import { createLicenceService } from '../../server/services/licenceService'

import { crdTime, exceptionalCircumstances, excluded, suitability } from '../../server/routes/config/eligibility'
import riskConfig from '../../server/routes/config/risk'
import { curfewAddress } from '../../server/routes/config/proposedAddress'
import { victimLiaison } from '../../server/routes/config/victim'
import { reportingDate, reportingInstructions } from '../../server/routes/config/reporting'
import {
  approvedPremisesAddress,
  curfewAddressReview,
  curfewHours,
  firstNight,
} from '../../server/routes/config/curfew'
import { additional, standard } from '../../server/routes/config/licenceConditions'
import {
  confiscationOrder,
  onRemand,
  seriousOffence,
  undulyLenientSentence,
  segregation,
} from '../../server/routes/config/finalChecks'
import { bassAreaCheck, bassOffer, bassRequest } from '../../server/routes/config/bassReferral'
import { release } from '../../server/routes/config/approval'
import { licenceDetails } from '../../server/routes/config/vary'
import { CurfewAddress, Licence, LicenceStage, RiskManagement } from '../../server/data/licenceTypes'

describe('validation', () => {
  const service = createLicenceService(null)

  describe('validateForm', () => {
    describe('eligibility', () => {
      describe('excluded', () => {
        const pageConfig = excluded
        const options = [
          { formResponse: { decision: 'Yes', reason: ['a', 'b'] }, outcome: {} },
          { formResponse: { decision: '', reason: ['a', 'b'] }, outcome: { decision: 'Select yes or no' } },
          {
            formResponse: { decision: 'Yes', reason: [] },
            outcome: { reason: 'Select one or more reasons' },
          },
          { formResponse: { decision: 'No', reason: [] }, outcome: {} },
        ]

        options.forEach((option) => {
          test(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
            const { outcome, formResponse } = option
            expect(service.validateForm({ formResponse, pageConfig })).toEqual(outcome)
          })
        })
      })

      describe('suitability', () => {
        const pageConfig = suitability
        const options = [
          { formResponse: { decision: 'Yes', reason: ['a', 'b'] }, outcome: {} },
          { formResponse: { decision: '', reason: ['a', 'b'] }, outcome: { decision: 'Select yes or no' } },
          {
            formResponse: { decision: 'Yes', reason: [] },
            outcome: { reason: 'Select one or more reasons' },
          },
          { formResponse: { decision: 'No', reason: [] }, outcome: {} },
        ]

        options.forEach((option) => {
          test(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
            const { outcome, formResponse } = option
            expect(service.validateForm({ formResponse, pageConfig })).toEqual(outcome)
          })
        })
      })

      describe('exceptionalCircumstances', () => {
        const pageConfig = exceptionalCircumstances
        const options = [
          { formResponse: { decision: 'Yes' }, outcome: {} },
          { formResponse: { decision: '' }, outcome: { decision: 'Select yes or no' } },
        ]

        options.forEach((option) => {
          test(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
            const { outcome, formResponse } = option
            expect(service.validateForm({ formResponse, pageConfig })).toEqual(outcome)
          })
        })
      })

      describe('crdTime', () => {
        const pageConfig = crdTime
        const options = [
          { formResponse: { decision: 'Yes', dmApproval: 'Yes' }, outcome: {} },
          { formResponse: { decision: '' }, outcome: { decision: 'Select yes or no' } },
          { formResponse: { decision: 'Yes' }, outcome: { dmApproval: 'Select yes or no' } },
          { formResponse: { decision: 'No' }, outcome: {} },
        ]

        options.forEach((option) => {
          test(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
            const { outcome, formResponse } = option
            expect(service.validateForm({ formResponse, pageConfig })).toEqual(outcome)
          })
        })
      })

      describe('curfewAddress', () => {
        describe('curfewAddress', () => {
          const pageConfig = curfewAddress

          const options = [
            {
              formResponse: {
                addressLine1: 'a1',
                addressTown: 't1',
                postCode: 'S105NW',
                cautionedAgainstResident: 'No',
                telephone: '07700000000',
              },
              outcome: {},
            },
            {
              formResponse: {
                addressLine1: '',
                addressTown: 't1',
                postCode: 'S105NW',
                cautionedAgainstResident: 'No',
                telephone: 'a',
              },
              outcome: {
                addressLine1: 'Enter an address',
                telephone: 'Enter a telephone number, like 01632 960 001 or 07700 900 982',
              },
            },
            {
              formResponse: {
                addressLine1: 'a1',
                addressTown: 't1',
                postCode: 'S105NW',
                cautionedAgainstResident: 'No',
                telephone: '',
              },
              outcome: {
                telephone: 'Enter a telephone number',
              },
            },
            {
              formResponse: {
                addressLine1: 'a1',
                addressTown: 't1',
                postCode: 'S105NW',
                cautionedAgainstResident: 'No',
                telephone: '07700000000',
                residents: [{ name: 'name', relationship: 'rel' }],
              },
              outcome: {},
            },
            {
              formResponse: {
                addressLine1: 'a1',
                addressTown: 't1',
                postCode: 'S105NW',
                cautionedAgainstResident: 'No',
                telephone: '07700000000',
                residents: [{ name: 'a', relationship: '' }],
              },
              outcome: { residents: { 0: { relationship: 'Enter a relationship' } } },
            },
            {
              formResponse: {
                addressLine1: 'a1',
                addressTown: 't1',
                postCode: 'S105NW',
                cautionedAgainstResident: 'No',
                telephone: '07700000000',
                residents: [],
              },
              outcome: {},
            },
            {
              formResponse: {
                addressLine1: 'a1',
                addressTown: 't1',
                postCode: 'S105NW',
                cautionedAgainstResident: 'No',
                telephone: '07700000000',
                residents: [
                  { name: 'n', relationship: 'n' },
                  { name: '', relationship: 'n' },
                ],
              },
              outcome: { residents: { 1: { name: 'Enter a name' } } },
            },
            {
              formResponse: {
                addressLine1: 'a1',
                addressTown: 't1',
                postCode: 'S105NW',
                cautionedAgainstResident: 'No',
                telephone: '07700000000',
                residents: [
                  { name: 'n', relationship: 'n' },
                  { name: 'name', relationship: 'n', age: 'sss' },
                ],
              },
              outcome: { residents: { 1: { age: 'Invalid Age - Enter Number' } } },
            },
            {
              formResponse: {
                addressLine1: 'a1',
                addressTown: 't1',
                postCode: 'S105NW',
                cautionedAgainstResident: 'No',
                telephone: '07700000000',
                residents: [{ name: 'n', relationship: 'n' }],
                occupier: { name: 'o', relationship: 'r' },
              },
              outcome: {},
            },
            {
              formResponse: {
                addressLine1: 'a1',
                addressTown: 't1',
                postCode: 'S105NW',
                cautionedAgainstResident: 'No',
                telephone: '07700000000',
                residents: [{ name: 'n', relationship: 'n' }],
                occupier: { name: 'o', relationship: 'Enter a relationship' },
              },
              outcome: {},
            },
            {
              formResponse: {
                addressLine1: 'a1',
                addressTown: 't1',
                postCode: 'S105NW',
                cautionedAgainstResident: 'No',
                telephone: '',
                residents: [{ name: 'n', relationship: 'n' }],
                occupier: { name: 'o', relationship: 'Enter a relationship', isOffender: 'Yes' },
              },
              outcome: {},
            },
            {
              formResponse: {
                addressLine1: 'a1',
                addressTown: 't1',
                postCode: 'S105NW',
                cautionedAgainstResident: 'No',
                telephone: '12345678900',
                residents: [{ name: 'n', relationship: 'n' }],
                occupier: { name: 'o', relationship: 'Enter a relationship', isOffender: 'Yes' },
              },
              outcome: {},
            },
            {
              formResponse: {
                addressLine1: 'a1',
                addressTown: 't1',
                postCode: 'S105NW',
                cautionedAgainstResident: 'No',
                telephone: '',
                residents: [{ name: 'n', relationship: 'n' }],
                occupier: { name: 'o', relationship: 'Enter a relationship', isOffender: 'No' },
              },
              outcome: {
                telephone: 'Enter a telephone number',
              },
            },
          ]

          options.forEach((option) => {
            test(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
              const { outcome, formResponse } = option
              expect(
                service.validateForm({
                  formResponse,
                  pageConfig,
                  formType: 'curfewAddress',
                })
              ).toEqual(outcome)
            })
          })
        })
      })
    })

    describe('processing_ro', () => {
      describe('risk', () => {
        const pageConfig = riskConfig.riskManagement
        const options = [
          {
            formResponse: {
              version: '1',
              planningActions: 'No',
              awaitingInformation: 'No',
              proposedAddressSuitable: 'No',
              unsuitableReason: '',
              nonDisclosableInformation: 'No',
            },
            outcome: { unsuitableReason: 'Provide details of why you made this decision' },
          },
          {
            formResponse: {
              version: '1',
              planningActions: 'No',
              awaitingInformation: 'No',
              proposedAddressSuitable: 'No',
              unsuitableReason: 'Reason',
              nonDisclosableInformation: 'No',
            },
            outcome: {},
          },
          {
            formResponse: {
              version: '1',
              planningActions: '',
              awaitingInformation: '',
              hasConsideredChecks: '',
              awaitingOtherInformation: '',
              proposedAddressSuitable: '',
              nonDisclosableInformation: '',
            },
            outcome: {
              planningActions: 'Say if there are risk management actions',
              awaitingInformation: 'Say if you are still awaiting information',
              proposedAddressSuitable: 'Say if the proposed address is suitable',
              nonDisclosableInformation: 'Say if you want to add information that cannot be disclosed to the offender',
            },
          },
          {
            formResponse: {
              version: '2',
              hasConsideredChecks: '',
              awaitingOtherInformation: '',
              proposedAddressSuitable: '',
              nonDisclosableInformation: '',
            },
            outcome: {
              hasConsideredChecks:
                'Say if you have requested and considered risk information related to the proposed address',
              awaitingOtherInformation: 'Say if you are still awaiting information',
              proposedAddressSuitable: 'Say if the proposed address is suitable',
              nonDisclosableInformation: 'Say if you want to add information that cannot be disclosed to the offender',
            },
          },
          {
            formResponse: {
              version: '3',
              hasConsideredChecks: '',
              awaitingOtherInformation: '',
              proposedAddressSuitable: '',
              nonDisclosableInformation: '',
              manageInTheCommunity: '',
              mentalHealthPlan: '',
              pomConsultation: '',
            },
            outcome: {
              hasConsideredChecks:
                'Say if you have requested and considered risk information related to the proposed address',
              awaitingOtherInformation: 'Say if you are still awaiting information',
              proposedAddressSuitable: 'Say if the proposed address is suitable',
              nonDisclosableInformation: 'Say if you want to add information that cannot be disclosed to the offender',
              manageInTheCommunity:
                'Say if it is possible to manage the offender in the community safely at the proposed address',
              mentalHealthPlan:
                'Say if it is essential to the offender’s risk management that there is a plan in place to treat their mental health on release',
              pomConsultation: 'Say if you have consulted the POM about the offender’s progress in custody',
            },
          },
          {
            formResponse: {
              version: '3',
              hasConsideredChecks: 'Yes',
              awaitingOtherInformation: 'No',
              proposedAddressSuitable: 'Yes',
              emsInformation: 'No',
              nonDisclosableInformation: 'No',
              manageInTheCommunity: 'No',
              manageInTheCommunityNotPossibleReason: '',
              mentalHealthPlan: 'No',
              prisonHealthcareConsultation: '',
              pomConsultation: 'Yes',
            },
            outcome: {
              manageInTheCommunityNotPossibleReason: 'Provide details of why you made this decision',
            },
          },
          {
            formResponse: {
              version: '3',
              hasConsideredChecks: 'Yes',
              awaitingOtherInformation: 'No',
              proposedAddressSuitable: 'Yes',
              emsInformation: 'No',
              nonDisclosableInformation: 'No',
              manageInTheCommunity: 'Yes',
              mentalHealthPlan: 'Yes',
              prisonHealthcareConsultation: '',
              pomConsultation: 'Yes',
            },
            outcome: {
              prisonHealthcareConsultation: 'Say if you have consulted prison healthcare',
            },
          },
          {
            formResponse: {
              version: '1',
              planningActions: 'Yes',
              awaitingInformation: 'Yes',
              proposedAddressSuitable: 'Yes',
              emsInformation: 'No',
              nonDisclosableInformation: 'No',
            },
            outcome: {},
          },
          {
            formResponse: {
              version: '1',
              planningActions: 'Yes',
              awaitingInformation: 'Yes',
              proposedAddressSuitable: 'Yes',
              emsInformation: 'No',
              nonDisclosableInformation: 'Yes',
            },
            outcome: {
              nonDisclosableInformationDetails: 'Provide information that cannot be disclosed to the offender',
            },
          },
          {
            formResponse: {
              version: '1',
              planningActions: 'Yes',
              awaitingInformation: 'Yes',
              proposedAddressSuitable: 'Yes',
              emsInformation: 'No',
              nonDisclosableInformation: 'Yes',
              nonDisclosableInformationDetails: 'text',
            },
            outcome: {},
          },
          {
            formResponse: {
              version: '1',
              planningActions: 'Yes',
              awaitingInformation: 'Yes',
              proposedAddressSuitable: 'Yes',
              emsInformation: 'Yes',
              nonDisclosableInformation: 'No',
            },
            outcome: { emsInformationDetails: 'Provide information about the offender or the address' },
          },
          {
            formResponse: {
              version: '1',
              planningActions: 'Yes',
              awaitingInformation: 'Yes',
              proposedAddressSuitable: 'Yes',
              emsInformation: 'Yes',
              emsInformationDetails: '',
              nonDisclosableInformation: 'No',
            },
            outcome: { emsInformationDetails: 'Provide information about the offender or the address' },
          },
          {
            formResponse: {
              version: '1',
              planningActions: 'Yes',
              awaitingInformation: 'Yes',
              proposedAddressSuitable: 'Yes',
              nonDisclosableInformation: 'No',
            },
            outcome: {
              emsInformation: 'Say if you want to provide additional information about the offender or the address',
            },
          },
        ]

        options.forEach((option) => {
          test(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
            const { outcome, formResponse } = option
            expect(service.validateForm({ formResponse, pageConfig })).toEqual(outcome)
          })
        })
      })

      describe('victim liaison', () => {
        const pageConfig = victimLiaison
        const options = [
          {
            formResponse: { decision: 'No' },
            outcome: {},
          },
          {
            formResponse: { decision: 'Yes' },
            outcome: {
              victimLiaisonDetails: 'Provide details of the victim liaison case',
            },
          },
        ]

        options.forEach((option) => {
          test(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
            const { outcome, formResponse } = option
            expect(service.validateForm({ formResponse, pageConfig })).toEqual(outcome)
          })
        })
      })

      describe('reportingInstructions', () => {
        const pageConfig = reportingInstructions
        const options = [
          {
            formResponse: {
              name: 'n',
              organisation: 'o',
              buildingAndStreet1: 'b',
              townOrCity: 't',
              postcode: 'FA1 1KE',
              telephone: '0770000000',
              reportingDate: '01/02/2030',
              reportingTime: '12:34',
            },
            outcome: {},
          },
          {
            formResponse: {
              name: '',
              organisation: '',
              buildingAndStreet1: '',
              townOrCity: '',
              postcode: 'a',
              telephone: '',
              reportingDate: '',
              reportingTime: '',
            },
            outcome: {
              name: 'Enter a name',
              organisation: 'Enter a CRC/NPS organisation name',
              buildingAndStreet1: 'Enter a building or street',
              townOrCity: 'Enter a town or city',
              postcode: 'Enter a postcode in the right format',
              telephone: 'Enter a telephone number',
              reportingDate: 'Enter a date',
              reportingTime: 'Enter a time',
            },
          },
        ]

        options.forEach((option) => {
          test(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
            const { outcome, formResponse } = option
            expect(service.validateForm({ formResponse, pageConfig })).toEqual(outcome)
          })
        })
      })

      describe('curfewAddressReview', () => {
        const pageConfig = curfewAddressReview
        const options = [
          {
            formResponse: { consent: 'No' },
            outcome: {},
          },
          {
            formResponse: { consentHavingSpoken: 'No' },
            outcome: {},
          },
          {
            formResponse: { consent: 'Yes' },
            outcome: { electricity: 'Say if there is an electricity supply' },
          },
          {
            formResponse: { consentHavingSpoken: 'Yes' },
            outcome: { electricity: 'Say if there is an electricity supply' },
          },
          {
            formResponse: { consent: 'Yes', electricity: 'Yes' },
            outcome: { homeVisitConducted: 'Say if you did a home visit' },
          },
          {
            formResponse: { consentHavingSpoken: 'Yes', electricity: 'Yes' },
            outcome: { homeVisitConducted: 'Say if you did a home visit' },
          },
          {
            formResponse: { consent: 'Yes', electricity: 'No' },
            outcome: {},
          },
          {
            formResponse: { consentHavingSpoken: 'Yes', electricity: 'No' },
            outcome: {},
          },
          {
            formResponse: { consent: 'Yes', electricity: 'Yes', homeVisitConducted: 'Yes' },
            outcome: {},
          },
          {
            formResponse: { consentHavingSpoken: 'Yes', electricity: 'Yes', homeVisitConducted: 'Yes' },
            outcome: {},
          },
        ]

        options.forEach((option) => {
          test(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
            const { outcome, formResponse } = option
            expect(
              service.validateForm({
                formResponse,
                pageConfig,
                formType: 'curfewAddressReview',
              })
            ).toEqual(outcome)
          })
        })
      })

      describe('curfewAddressReview offender is main occupier', () => {
        const pageConfig = curfewAddressReview
        const options = [
          {
            formResponse: {},
            outcome: { electricity: 'Say if there is an electricity supply' },
          },
          {
            formResponse: {
              electricity: 'Yes',
            },
            outcome: { homeVisitConducted: 'Say if you did a home visit' },
          },

          {
            formResponse: {
              electricity: 'No',
            },
            outcome: {},
          },
        ]

        options.forEach((option) => {
          test(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
            const { outcome, formResponse } = option
            expect(
              service.validateForm({
                formResponse,
                pageConfig,
                formType: 'curfewAddressReview',
                bespokeConditions: { offenderIsMainOccupier: true },
              })
            ).toEqual(outcome)
          })
        })
      })

      describe('curfewHours', () => {
        const pageConfig = curfewHours
        const options = [
          {
            formResponse: {
              daySpecificInputs: '',
              allFrom: '',
              allUntil: '',
              mondayFrom: '07:00',
              mondayUntil: '20:00',
              tuesdayFrom: '07:00',
              tuesdayUntil: '20:00',
              wednesdayFrom: '07:00',
              wednesdayUntil: '20:00',
              thursdayFrom: '07:00',
              thursdayUntil: '20:00',
              fridayFrom: '07:00',
              fridayUntil: '20:00',
              saturdayFrom: '07:00',
              saturdayUntil: '20:00',
              sundayFrom: '07:00',
              sundayUntil: '20:00',
            },
            outcome: {},
          },
          {
            formResponse: {
              daySpecificInputs: '',
              allFrom: '',
              allUntil: '',
              mondayFrom: '25:00',
              mondayUntil: '',
              tuesdayFrom: '',
              tuesdayUntil: '',
              wednesdayFrom: '',
              wednesdayUntil: '',
              thursdayFrom: '',
              thursdayUntil: '',
              fridayFrom: '',
              fridayUntil: '',
              saturdayFrom: '',
              saturdayUntil: '',
              sundayFrom: '',
              sundayUntil: '',
            },
            outcome: {
              mondayFrom: 'Enter a valid time',
              mondayUntil: 'Enter a valid time',
              tuesdayFrom: 'Enter a valid time',
              tuesdayUntil: 'Enter a valid time',
              wednesdayFrom: 'Enter a valid time',
              wednesdayUntil: 'Enter a valid time',
              thursdayFrom: 'Enter a valid time',
              thursdayUntil: 'Enter a valid time',
              fridayFrom: 'Enter a valid time',
              fridayUntil: 'Enter a valid time',
              saturdayFrom: 'Enter a valid time',
              saturdayUntil: 'Enter a valid time',
              sundayFrom: 'Enter a valid time',
              sundayUntil: 'Enter a valid time',
            },
          },
        ]

        options.forEach((option) => {
          test(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
            const { outcome, formResponse } = option
            expect(service.validateForm({ formResponse, pageConfig })).toEqual(outcome)
          })
        })
      })

      describe('standardConditions', () => {
        const pageConfig = standard
        const options = [
          {
            formResponse: { additionalConditionsRequired: 'Yes' },
            outcome: {},
          },
          {
            formResponse: {},
            outcome: { additionalConditionsRequired: 'Select yes or no' },
          },
        ]

        options.forEach((option) => {
          test(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
            const { outcome, formResponse } = option
            expect(service.validateForm({ formResponse, pageConfig })).toEqual(outcome)
          })
        })
      })

      describe('additionalConditions', () => {
        const pageConfig = additional.get(1)
        const options = [
          { formResponse: {}, outcome: {} },
          { formResponse: { NOCONTACTASSOCIATE: { groupsOrOrganisation: 'ngr' } }, outcome: {} },
          {
            formResponse: { NOCONTACTASSOCIATE: { groupsOrOrganisation: '' } },
            outcome: {
              NOCONTACTASSOCIATE: {
                groupsOrOrganisation: 'Enter a name or describe specific groups or organisations',
              },
            },
          },
          { formResponse: { INTIMATERELATIONSHIP: { intimateGender: 'g' } }, outcome: {} },
          {
            formResponse: { INTIMATERELATIONSHIP: {} },
            outcome: {
              INTIMATERELATIONSHIP: { intimateGender: 'Select women / men / women or men' },
            },
          },
          { formResponse: { NOCONTACTNAMED: { noContactOffenders: 'g' } }, outcome: {} },
          {
            formResponse: { NOCONTACTNAMED: {} },
            outcome: {
              NOCONTACTNAMED: { noContactOffenders: 'Enter named offender(s) or individual(s)' },
            },
          },
          { formResponse: { NORESIDE: { notResideWithGender: 'g', notResideWithAge: 'a' } }, outcome: {} },
          {
            formResponse: { NORESIDE: {} },
            outcome: {
              NORESIDE: {
                notResideWithGender: 'Select any / any female / any male',
                notResideWithAge: 'Enter age',
              },
            },
          },
          {
            formResponse: {
              NOUNSUPERVISEDCONTACT: {
                unsupervisedContactGender: 'g',
                unsupervisedContactAge: 'a',
                unsupervisedContactSocial: 'b',
              },
            },
            outcome: {},
          },
          {
            formResponse: { NOUNSUPERVISEDCONTACT: {} },
            outcome: {
              NOUNSUPERVISEDCONTACT: {
                unsupervisedContactGender: 'Select any / any female / any male',
                unsupervisedContactAge: 'Enter age',
                unsupervisedContactSocial: 'Enter name of appropriate social service department',
              },
            },
          },
          { formResponse: { NOCHILDRENSAREA: { notInSightOf: 'g' } }, outcome: {} },
          {
            formResponse: { NOCHILDRENSAREA: {} },
            outcome: {
              NOCHILDRENSAREA: { notInSightOf: "Enter location, for example children's play area" },
            },
          },
          { formResponse: { NOWORKWITHAGE: { noWorkWithAge: 'g' } }, outcome: {} },
          {
            formResponse: { NOWORKWITHAGE: {} },
            outcome: { NOWORKWITHAGE: { noWorkWithAge: 'Enter age' } },
          },
          {
            formResponse: { NOCOMMUNICATEVICTIM: { victimFamilyMembers: 'g', socialServicesDept: 'a' } },
            outcome: {},
          },
          {
            formResponse: { NOCOMMUNICATEVICTIM: {} },
            outcome: {
              NOCOMMUNICATEVICTIM: {
                victimFamilyMembers: 'Enter name of victim and /or family members',
                socialServicesDept: 'Enter name of appropriate social service department',
              },
            },
          },
          { formResponse: { COMPLYREQUIREMENTS: { courseOrCentre: 'g', abuseAndBehaviours: [] } }, outcome: {} },
          {
            formResponse: { COMPLYREQUIREMENTS: {} },
            outcome: {
              COMPLYREQUIREMENTS: {
                courseOrCentre: 'Enter name of course / centre',
                abuseAndBehaviours:
                  'Select at least one option from the alcohol abuse / drug abuse / sexual behaviour / violent behaviour / gambling / solvent abuse / anger / debt / prolific behaviour / offending behaviour',
              },
            },
          },
          { formResponse: { ATTENDALL: { appointmentName: 'g', appointmentProfession: 'a' } }, outcome: {} },
          {
            formResponse: { ATTENDALL: {} },
            outcome: {
              ATTENDALL: {
                appointmentName: 'Enter name',
                appointmentProfession: 'Select psychiatrist / psychologist / medical practitioner',
              },
            },
          },
          { formResponse: { HOMEVISITS: { mentalHealthName: 'g' } }, outcome: {} },
          {
            formResponse: { HOMEVISITS: {} },
            outcome: { HOMEVISITS: { mentalHealthName: 'Enter name' } },
          },
          {
            formResponse: {
              REMAINADDRESS: {
                curfewAddress: 'g',
                curfewFrom: 'a',
                curfewTo: 'b',
              },
            },
            outcome: {},
          },
          {
            formResponse: {
              REMAINADDRESS: {
                curfewAddress: 'g',
                curfewFrom: 'a',
                curfewTo: 'b',
                curfewTagRequired: 'Yes',
              },
            },
            outcome: {},
          },
          {
            formResponse: { REMAINADDRESS: {} },
            outcome: {
              REMAINADDRESS: {
                curfewAddress: 'Enter curfew address',
                curfewFrom: 'Enter start of curfew hours',
                curfewTo: 'Enter end of curfew hours',
              },
            },
          },
          {
            formResponse: {
              CONFINEADDRESS: {
                confinedTo: 'g',
                confinedFrom: 'a',
                confinedReviewFrequency: 'b',
              },
            },
            outcome: {},
          },
          {
            formResponse: { CONFINEADDRESS: {} },
            outcome: {
              CONFINEADDRESS: {
                confinedTo: 'Enter time',
                confinedFrom: 'Enter time',
                confinedReviewFrequency: 'Enter frequency, for example weekly',
              },
            },
          },
          {
            formResponse: {
              REPORTTO: {
                reportingAddress: 'g',
                reportingTime: '12:00',
                reportingDaily: '',
                reportingFrequency: 'c',
              },
            },
            outcome: {},
          },
          {
            formResponse: {
              REPORTTO: {
                reportingAddress: 'g',
                reportingTime: '',
                reportingDaily: 'd',
                reportingFrequency: 'c',
              },
            },
            outcome: {},
          },
          {
            formResponse: {
              REPORTTO: {
                reportingAddress: '',
                reportingTime: '',
                reportingDaily: '',
                reportingFrequency: '',
              },
            },
            outcome: {
              REPORTTO: {
                reportingAddress: 'Enter name of approved premises / police station',
                reportingDaily: 'Enter time / daily',
                reportingFrequency: 'Enter frequency, for example weekly',
              },
            },
          },
          { formResponse: { VEHICLEDETAILS: { vehicleDetails: 'g' } }, outcome: {} },
          {
            formResponse: { VEHICLEDETAILS: {} },
            outcome: { VEHICLEDETAILS: { vehicleDetails: 'Enter details, for example make, model' } },
          },
          { formResponse: { EXCLUSIONADDRESS: { noEnterPlace: 'g' } }, outcome: {} },
          {
            formResponse: { EXCLUSIONADDRESS: {} },
            outcome: {
              EXCLUSIONADDRESS: { noEnterPlace: 'Enter name / type of premises / address / road' },
            },
          },
          { formResponse: { EXCLUSIONAREA: { exclusionArea: 'g' } }, outcome: {} },
          {
            formResponse: { EXCLUSIONAREA: {} },
            outcome: { EXCLUSIONAREA: { exclusionArea: 'Enter clearly specified area' } },
          },
          {
            formResponse: {
              ATTENDDEPENDENCY: {
                appointmentDate: moment().add(1, 'day').format('DD/MM/YYYY'),
                appointmentTime: 'a',
                appointmentAddress: 'b',
              },
            },
            outcome: {},
          },
          {
            formResponse: { ATTENDDEPENDENCY: {} },
            outcome: {
              ATTENDDEPENDENCY: {
                appointmentDate: 'Enter appointment date',
                appointmentTime: 'Enter appointment time',
                appointmentAddress: 'Enter appointment name and address',
              },
            },
          },
          {
            formResponse: {
              ATTENDDEPENDENCY: {
                appointmentDate: '12/03/2016',
                appointmentTime: 'a',
                appointmentAddress: 'b',
              },
            },
            outcome: { ATTENDDEPENDENCY: { appointmentDate: 'The reporting date must be today or in the future' } },
          },
          {
            formResponse: {
              ATTENDSAMPLE: {
                attendSampleDetailsName: 'a',
                attendSampleDetailsAddress: 'a',
              },
            },
            outcome: {},
          },
          {
            formResponse: { ATTENDSAMPLE: {} },
            outcome: {
              ATTENDSAMPLE: {
                attendSampleDetailsName: 'Enter appointment name',
                attendSampleDetailsAddress: 'Enter appointment address',
              },
            },
          },
          {
            formResponse: {
              NOTIFYRELATIONSHIP: {},
              NOCONTACTPRISONER: {},
              NOCONTACTSEXOFFENDER: {},
              CAMERAAPPROVAL: {},
              NOCAMERA: {},
              NOCAMERAPHONE: {},
              USAGEHISTORY: {},
              NOINTERNET: {},
              ONEPHONE: {},
              RETURNTOUK: {},
              SURRENDERPASSPORT: {},
              NOTIFYPASSPORT: {},
            },
            outcome: {},
          },
        ]

        options.forEach((option) => {
          test(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
            const { outcome, formResponse } = option
            expect(
              service.validateForm({
                formResponse,
                pageConfig,
                formType: 'additional',
              })
            ).toEqual(outcome)
          })
        })
      })
    })

    describe('processing_ca', () => {
      describe('excluded', () => {
        const pageConfig = seriousOffence
        const options = [
          { formResponse: { decision: 'Yes' }, outcome: {} },
          { formResponse: { decision: '' }, outcome: { decision: 'Select yes or no' } },
        ]

        options.forEach((option) => {
          test(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
            const { outcome, formResponse } = option
            expect(service.validateForm({ formResponse, pageConfig })).toEqual(outcome)
          })
        })
      })

      describe('onRemand', () => {
        const pageConfig = onRemand
        const options = [
          { formResponse: { decision: 'Yes' }, outcome: {} },
          { formResponse: { decision: '' }, outcome: { decision: 'Select yes or no' } },
        ]

        options.forEach((option) => {
          test(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
            const { outcome, formResponse } = option
            expect(service.validateForm({ formResponse, pageConfig })).toEqual(outcome)
          })
        })
      })

      describe('confiscationOrder', () => {
        const pageConfig = confiscationOrder
        const options = [
          { formResponse: { decision: 'No' }, outcome: {} },
          {
            formResponse: { decision: 'Yes', confiscationUnitConsulted: '' },
            outcome: { confiscationUnitConsulted: 'Select yes or no' },
          },
          { formResponse: { decision: 'Yes', confiscationUnitConsulted: 'No' }, outcome: {} },
          {
            formResponse: { decision: 'Yes', confiscationUnitConsulted: 'Yes', comments: '' },
            outcome: { comments: 'Provide details' },
          },
          {
            formResponse: { decision: 'Yes', confiscationUnitConsulted: 'Yes', comments: 'wgew' },
            outcome: {},
          },
        ]

        options.forEach((option) => {
          test(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
            const { outcome, formResponse } = option
            expect(service.validateForm({ formResponse, pageConfig })).toEqual(outcome)
          })
        })
      })
    })

    describe('undulyLenientSentence', () => {
      const pageConfig = undulyLenientSentence
      const options = [
        { formResponse: { decision: 'Yes' }, outcome: {} },
        { formResponse: { decision: '' }, outcome: { decision: 'Select yes or no' } },
      ]

      options.forEach((option) => {
        test(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
          const { outcome, formResponse } = option
          expect(service.validateForm({ formResponse, pageConfig })).toEqual(outcome)
        })
      })
    })

    describe('segregation', () => {
      const pageConfig = segregation
      const options = [
        { formResponse: { decision: 'Yes' }, outcome: {} },
        { formResponse: { decision: '' }, outcome: { decision: 'Select yes or no' } },
      ]

      options.forEach((option) => {
        test(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
          const { outcome, formResponse } = option
          expect(service.validateForm({ formResponse, pageConfig })).toEqual(outcome)
        })
      })
    })

    describe('curfew', () => {
      describe('firstNight', () => {
        const pageConfig = firstNight

        const options = [
          { formResponse: { firstNightFrom: '13:00', firstNightUntil: '14:00' }, outcome: {} },
          {
            formResponse: { firstNightFrom: '25:00', firstNightUntil: '14:00' },
            outcome: { firstNightFrom: 'Enter a valid from time' },
          },
          {
            formResponse: { firstNightFrom: '13:00', firstNightUntil: '' },
            outcome: { firstNightUntil: 'Enter a valid until time' },
          },
          {
            formResponse: {},
            outcome: {
              firstNightFrom: 'Enter a valid from time',
              firstNightUntil: 'Enter a valid until time',
            },
          },
        ]

        options.forEach((option) => {
          test(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
            const { outcome, formResponse } = option
            expect(service.validateForm({ formResponse, pageConfig })).toEqual(outcome)
          })
        })
      })

      describe('approvedPremisesAddress', () => {
        const options = [
          {
            formResponse: { telephone: 'abc' },
            outcome: {
              addressLine1: 'Enter an address',
              addressTown: 'Enter a town or city',
              postCode: 'Enter a postcode',
              telephone: 'Enter a telephone number in the right format',
            },
          },
        ]

        options.forEach((option) => {
          test(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
            const { outcome, formResponse } = option
            expect(service.validateForm({ formResponse, pageConfig: approvedPremisesAddress })).toEqual(outcome)
          })
        })
      })
    })

    describe('bassReferral', () => {
      describe('bassRequest', () => {
        const pageConfig = bassRequest
        const options = [
          { formResponse: { bassRequested: 'No' }, outcome: {} },
          {
            formResponse: { bassRequested: 'Yes', specificArea: 'Yes' },
            outcome: { proposedCounty: 'Enter a county', proposedTown: 'Enter a town' },
          },
          {
            formResponse: { bassRequested: 'Yes', specificArea: 'Yes', proposedCounty: 'county' },
            outcome: { proposedTown: 'Enter a town' },
          },
          {
            formResponse: {
              bassRequested: 'Yes',
              specificArea: 'Yes',
              proposedCounty: 'county',
              proposedTown: 'town',
            },
            outcome: {},
          },
        ]

        options.forEach((option) => {
          test(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
            const { outcome, formResponse } = option
            expect(service.validateForm({ formResponse, pageConfig })).toEqual(outcome)
          })
        })
      })

      describe('bassAreaCheck', () => {
        const pageConfig = bassAreaCheck
        const options = [
          { formResponse: { bassAreaSuitable: 'Yes', approvedPremisesRequiredYesNo: 'No' }, outcome: {} },
          {
            formResponse: { bassAreaSuitable: 'No', approvedPremisesRequiredYesNo: 'No' },
            outcome: { bassAreaReason: 'Enter a reason' },
          },
          {
            formResponse: { bassAreaSuitable: 'No', bassAreaReason: 'reason', approvedPremisesRequiredYesNo: 'No' },
            outcome: {},
          },
          { formResponse: { approvedPremisesRequiredYesNo: 'No' }, outcome: {} },
          { formResponse: { approvedPremisesRequiredYesNo: 'Yes' }, outcome: {} },
          {
            formResponse: { approvedPremisesRequiredYesNo: '' },
            outcome: { approvedPremisesRequiredYesNo: 'Select Yes or No' },
          },
        ]

        options.forEach((option) => {
          test(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
            const { outcome, formResponse } = option
            expect(service.validateForm({ formResponse, pageConfig })).toEqual(outcome)
          })
        })
      })

      describe('bassOffer', () => {
        const pageConfig = bassOffer

        describe('bassOffer - pre approval', () => {
          const options = [
            { formResponse: { bassAccepted: 'No' }, outcome: {} },
            {
              formResponse: { bassAccepted: 'Yes' },
              outcome: {},
            },
            {
              formResponse: { bassAccepted: '' },
              outcome: { bassAccepted: 'Select an option' },
            },
          ]

          options.forEach((option) => {
            test(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
              const { outcome, formResponse } = option
              expect(
                service.validateForm({
                  formResponse,
                  pageConfig,
                  bespokeConditions: { postApproval: false },
                })
              ).toEqual(outcome)
            })
          })
        })

        describe('bassOffer - post approval', () => {
          const options = [
            { formResponse: { bassAccepted: 'No' }, outcome: {} },
            {
              formResponse: {
                bassAccepted: 'Yes',
              },
              outcome: {
                addressLine1: 'Enter a building or street',
                addressTown: 'Enter a town or city',
                bassArea: 'Enter the provided area',
                postCode: 'Enter a postcode in the right format',
              },
            },
            {
              formResponse: {
                bassAccepted: 'Yes',
                addressLine1: 'Road',
                addressTown: 'Town',
                bassArea: 'Area',
                postCode: 'LE17 4XJ',
                telephone: '111',
              },
              outcome: {},
            },
            {
              formResponse: {
                bassAccepted: 'Yes',
                addressLine1: 'Road',
                addressTown: 'Town',
                bassArea: 'Area',
                postCode: 'LE17 4XJ',
                telephone: '',
              },
              outcome: {},
            },
            {
              formResponse: {
                bassAccepted: 'Yes',
                addressLine1: 'Road',
                addressTown: 'Town',
                bassArea: 'Area',
                postCode: 'a',
                telephone: '111',
              },
              outcome: { postCode: 'Enter a postcode in the right format' },
            },
            {
              formResponse: {
                bassAccepted: 'Yes',
                addressLine1: 'Road',
                addressTown: 'Town',
                bassArea: 'Area',
                postCode: 'AB11AB',
                telephone: 'a',
              },
              outcome: { telephone: 'Enter a telephone number in the right format' },
            },
          ]

          options.forEach((option) => {
            test(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
              const { outcome, formResponse } = option
              expect(
                service.validateForm({
                  formResponse,
                  pageConfig,
                  bespokeConditions: { postApproval: true },
                })
              ).toEqual(outcome)
            })
          })
        })
      })
    })

    describe('approval', () => {
      describe('release', () => {
        const pageConfig = release

        describe('when confiscationOrder is true', () => {
          const options = [
            { formResponse: { decision: 'Yes', notedComments: 'comments' }, outcome: {} },
            { formResponse: { decision: 'Yes' }, outcome: { notedComments: 'Add a comment' } },
            {
              formResponse: { decision: 'Yes', notedComments: '' },
              outcome: { notedComments: 'Add a comment' },
            },
            { formResponse: { decision: 'No', reason: 'reason' }, outcome: {} },
            { formResponse: { decision: 'No', reason: ['reason1', 'reason2'] }, outcome: {} },
            { formResponse: { decision: 'No', reason: [] }, outcome: { reason: 'Select a reason' } },
          ]

          options.forEach((option) => {
            test(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
              const { outcome, formResponse } = option
              expect(
                service.validateForm({
                  formResponse,
                  pageConfig,
                  bespokeConditions: { confiscationOrder: true },
                })
              ).toEqual(outcome)
            })
          })
        })

        describe('when confiscationOrder is false', () => {
          const options = [
            { formResponse: { decision: 'Yes', notedComments: 'comments' }, outcome: {} },
            { formResponse: { decision: 'Yes', notedComments: '' }, outcome: {} },
            { formResponse: { decision: 'No', reason: 'reason' }, outcome: {} },
            { formResponse: { decision: 'No', reason: ['reason', 'reason2'] }, outcome: {} },
            { formResponse: { decision: 'No', reason: [] }, outcome: { reason: 'Select a reason' } },
          ]

          options.forEach((option) => {
            test(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
              const { outcome, formResponse } = option
              expect(service.validateForm({ formResponse, pageConfig })).toEqual(outcome)
            })
          })
        })
      })
    })

    describe('reporting', () => {
      describe('reportingDate', () => {
        const pageConfig = reportingDate

        const options = [
          { formResponse: { reportingDate: moment().format('DD/MM/YYYY'), reportingTime: '15:00' }, outcome: {} },
          {
            formResponse: { reportingDate: moment().subtract(1, 'day').format('DD/MM/YYYY'), reportingTime: '15:00' },
            outcome: { reportingDate: 'The reporting date must be today or in the future' },
          },
          {
            formResponse: { reportingDate: moment('2025-24-24').format('DD/MM/YYYY'), reportingTime: '15:00' },
            outcome: { reportingDate: 'Enter a valid date' },
          },
          {
            formResponse: { reportingDate: '', reportingTime: '15:00' },
            outcome: { reportingDate: 'Enter a date' },
          },
          {
            formResponse: { reportingDate: '', reportingTime: '' },
            outcome: { reportingDate: 'Enter a date', reportingTime: 'Enter a time' },
          },
          {
            formResponse: { reportingDate: moment().format('DD/MM/YYYY'), reportingTime: '24:40' },
            outcome: { reportingTime: 'Enter a valid time' },
          },
        ]

        options.forEach((option) => {
          test(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
            const { outcome, formResponse } = option
            expect(service.validateForm({ formResponse, pageConfig })).toEqual(outcome)
          })
        })
      })
    })

    describe('vary', () => {
      describe('reportingDate', () => {
        const pageConfig = licenceDetails

        const options = [
          {
            formResponse: {
              addressLine1: 'l',
              addressTown: 'l',
              postCode: 's10 5nw',
              telephone: '01111111',
              daySpecificInputs: 'No',
              allFrom: '07:00',
              allUntil: '19:00',
              additionalConditions: 'No',
            },
            outcome: {},
          },
          {
            formResponse: {
              addressLine1: '',
              addressTown: '',
              postCode: '',
              telephone: 'ads',
              daySpecificInputs: 'No',
              allFrom: '07:00',
              allUntil: '19:00',
              additionalConditions: 'No',
            },
            outcome: {
              addressLine1: 'Enter an address',
              addressTown: 'Enter a town or city',
              postCode: 'Enter a postcode',
              telephone: 'Enter a telephone number, like 01632 960 001 or 07700 900 982',
            },
          },
          {
            formResponse: {
              addressLine1: 'l',
              addressTown: 'l',
              postCode: 's10 5nw',
              telephone: '01111111',
              daySpecificInputs: '',
              allFrom: '07:00',
              allUntil: '19:00',
              additionalConditions: '',
            },
            outcome: {
              daySpecificInputs: 'Say if you require day specific curfew hours',
              additionalConditions: 'Say if you require additional conditions',
            },
          },
          {
            formResponse: {
              addressLine1: 'l',
              addressTown: 'l',
              postCode: 's10 5nw',
              telephone: '01111111',
              daySpecificInputs: 'Yes',
              allFrom: '07:00',
              allUntil: '19:00',
              additionalConditions: 'Yes',
            },
            outcome: {
              fridayFrom: 'Enter a valid time for Friday time from',
              fridayUntil: 'Enter a valid time for Friday time to',
              mondayFrom: 'Enter a valid time for Monday time from',
              mondayUntil: 'Enter a valid time for Monday time to',
              saturdayFrom: 'Enter a valid time for Saturday time from',
              saturdayUntil: 'Enter a valid time for Saturday time to',
              sundayFrom: 'Enter a valid time for Sunday time from',
              sundayUntil: 'Enter a valid time for Sunday time to',
              thursdayFrom: 'Enter a valid time for Thursday time from',
              thursdayUntil: 'Enter a valid time for Thursday time to',
              tuesdayFrom: 'Enter a valid time for Tuesday time from',
              tuesdayUntil: 'Enter a valid time for Tuesday time to',
              wednesdayFrom: 'Enter a valid time for Wednesday time from',
              wednesdayUntil: 'Enter a valid time for Wednesday time to',
            },
          },
          {
            formResponse: {
              addressLine1: 'l',
              addressTown: 'l',
              postCode: 's10 5nw',
              telephone: '01111111',
              daySpecificInputs: 'No',
              allFrom: '07:00',
              allUntil: '19:00',
              additionalConditions: 'No',
              reportingPostCode: 1,
            },
            outcome: {
              reportingPostCode: 'Enter a postcode in the right format for the reporting address',
            },
          },
        ]

        options.forEach((option) => {
          test(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
            const { outcome, formResponse } = option
            expect(service.validateForm({ formResponse, pageConfig })).toEqual(outcome)
          })
        })
      })
    })
  })

  describe('validateFormGroup', () => {
    describe('eligibility', () => {
      const stage = LicenceStage.ELIGIBILITY
      const conditionVersion = 1
      const validAddress: CurfewAddress = {
        addressLine1: 'a1',
        addressTown: 't1',
        postCode: 'S105NW',
        cautionedAgainstResident: 'No',
        telephone: '07700000000',
      }

      const invalidAddress: CurfewAddress = {
        addressTown: 't1',
        postCode: 'S105NW',
        cautionedAgainstResident: 'No',
        telephone: '07700000000',
      }
      const validLicence: Licence = { proposedAddress: { curfewAddress: validAddress } }
      const invalidLicence: Licence = { proposedAddress: { curfewAddress: invalidAddress } }

      const options = [
        { licence: validLicence, outcome: {} },
        {
          licence: invalidLicence,
          outcome: { proposedAddress: { curfewAddress: { addressLine1: 'Enter an address' } } },
        },
        { licence: {}, outcome: { proposedAddress: { curfewAddress: 'Please provide a curfew address' } } },
      ]

      options.forEach((option) => {
        test(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.licence)}`, () => {
          const { outcome, licence } = option
          expect(service.validateFormGroup({ licence, stage, conditionVersion })).toEqual(outcome)
        })
      })

      describe('bass referral needed', () => {
        const validBassLicence: Licence = {
          proposedAddress: {
            curfewAddress: validAddress,
          },
          bassReferral: {
            bassRequest: { bassRequested: 'No', specificArea: 'No' },
          },
        }

        const bassOptions: Array<{ licence: Licence; outcome: any }> = [
          { licence: validBassLicence, outcome: {} },
          {
            licence: {
              ...validBassLicence,
              bassReferral: {
                ...validBassLicence.bassReferral,
                bassRequest: { bassRequested: 'Yes', specificArea: 'Yes' },
              },
            },
            outcome: {
              bassReferral: {
                bassRequest: {
                  proposedCounty: 'Enter a county',
                  proposedTown: 'Enter a town',
                },
              },
            },
          },
        ]

        bassOptions.forEach((option) => {
          test(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.licence)}`, () => {
            const { outcome, licence } = option
            expect(
              service.validateFormGroup({
                licence,
                stage,
                decisions: { bassReferralNeeded: true },
                tasks: undefined,
                conditionVersion,
              })
            ).toEqual(outcome)
          })
        })
      })
    })

    describe('processing_ro', () => {
      const stage = LicenceStage.PROCESSING_RO
      const conditionVersion = 1
      const validRiskManagement: RiskManagement = {
        version: '1',
        planningActions: 'No',
        awaitingInformation: 'No',
        proposedAddressSuitable: 'Yes',
        emsInformation: 'No',
        nonDisclosableInformation: 'No',
      }
      const validCurfewHours = {
        daySpecificInputs: '',
        allFrom: '',
        allUntil: '',
        mondayFrom: '07:00',
        mondayUntil: '20:00',
        tuesdayFrom: '07:00',
        tuesdayUntil: '20:00',
        wednesdayFrom: '07:00',
        wednesdayUntil: '20:00',
        thursdayFrom: '07:00',
        thursdayUntil: '20:00',
        fridayFrom: '07:00',
        fridayUntil: '20:00',
        saturdayFrom: '07:00',
        saturdayUntil: '20:00',
        sundayFrom: '07:00',
        sundayUntil: '20:00',
      }
      const validReportingInstructions = {
        name: 'n',
        organisation: 'o',
        buildingAndStreet1: 'b',
        townOrCity: 't',
        postcode: 'FA1 1KE',
        telephone: '0770000000',
        reportingDate: '01/02/2030',
        reportingTime: '12:34',
      }

      const validAddressReview = { consent: 'Yes', electricity: 'Yes', homeVisitConducted: 'Yes' }

      const validLicence: Licence = {
        risk: { riskManagement: validRiskManagement },
        victim: { victimLiaison: { decision: 'No' } },
        curfew: {
          curfewHours: validCurfewHours,
          curfewAddressReview: validAddressReview,
        },
        reporting: { reportingInstructions: validReportingInstructions },
        licenceConditions: {
          standard: { additionalConditionsRequired: 'Yes' },
          additional: { NOTIFYRELATIONSHIP: {} },
        },
      }

      const validLicenceOccupierIsOffender = {
        ...validLicence,
        curfew: {
          ...validLicence.curfew,
          curfewAddressReview: { electricity: 'Yes', homeVisitConducted: 'Yes' },
        },
      }

      const validLicenceNoOccupierConsent: Licence = {
        ...validLicence,
        curfew: {
          ...validLicence.curfew,
          curfewAddressReview: { consent: 'No' },
        },
      }

      const validLicenceNoElec: Licence = {
        ...validLicence,
        curfew: {
          ...validLicence.curfew,
          curfewAddressReview: { consent: 'Yes', electricity: 'No' },
        },
      }

      const validLicenceNoConditions: Licence = {
        risk: { riskManagement: validRiskManagement },
        victim: { victimLiaison: { decision: 'No' } },
        curfew: {
          curfewHours: validCurfewHours,
          curfewAddressReview: validAddressReview,
        },
        reporting: { reportingInstructions: validReportingInstructions },
        licenceConditions: { standard: { additionalConditionsRequired: 'No' } },
      }

      const invalidLicence: Licence = {
        risk: {
          riskManagement: {
            version: '1',
            planningActions: '',
            awaitingInformation: 'No',
            nonDisclosableInformation: 'No',
          },
        },
        victim: { victimLiaison: { decision: 'No' } },
        curfew: {
          curfewHours: validCurfewHours,
          curfewAddressReview: validAddressReview,
        },
        reporting: { reportingInstructions: validReportingInstructions },
        licenceConditions: {
          standard: { additionalConditionsRequired: 'Yes' },
          additional: { NOTIFYRELATIONSHIP: {} },
        },
      }

      const options = [
        {
          licence: validLicence,
          standardOutcome: {},
          addressReviewFailedOutcome: {},
          addressRiskFailedOutcome: {},
        },
        {
          licence: validLicenceNoConditions,
          standardOutcome: {},
          addressReviewFailedOutcome: {},
          addressRiskFailedOutcome: {},
        },
        {
          licence: invalidLicence,
          standardOutcome: {
            risk: {
              riskManagement: {
                planningActions: 'Say if there are risk management actions',
                proposedAddressSuitable: 'Say if the proposed address is suitable',
              },
            },
          },
          addressReviewFailedOutcome: {},
          addressRiskFailedOutcome: {
            risk: {
              riskManagement: {
                planningActions: 'Say if there are risk management actions',
                proposedAddressSuitable: 'Say if the proposed address is suitable',
              },
            },
          },
        },
        {
          licence: {},
          standardOutcome: {
            risk: { riskManagement: 'Enter the risk management details' },
            victim: {
              victimLiaison: 'Enter the victim liaison details',
            },
            curfew: {
              curfewHours: 'Enter the proposed curfew hours',
              curfewAddressReview: 'Enter the curfew address review details',
            },
            licenceConditions: {
              standard: 'standard conditions error message',
            },
            reporting: { reportingInstructions: 'Enter the reporting instructions' },
          },
          addressReviewFailedOutcome: {
            curfew: {
              curfewAddressReview: 'Enter the curfew address review details',
            },
          },
          addressRiskFailedOutcome: {
            curfew: {
              curfewAddressReview: 'Enter the curfew address review details',
            },
            risk: { riskManagement: 'Enter the risk management details' },
          },
        },
        {
          licence: validLicenceOccupierIsOffender,
          standardOutcome: {},
          addressReviewFailedOutcome: {},
          addressRiskFailedOutcome: {},
          decisions: { offenderIsMainOccupier: true },
        },
        {
          licence: validLicenceNoOccupierConsent,
          standardOutcome: {},
          addressReviewFailedOutcome: {},
          addressRiskFailedOutcome: {},
        },
        {
          licence: validLicenceNoElec,
          standardOutcome: {},
          addressReviewFailedOutcome: {},
          addressRiskFailedOutcome: {},
        },
      ]

      describe('address not rejected', () => {
        options.forEach((option) => {
          test(`should return ${JSON.stringify(option.standardOutcome)} for ${JSON.stringify(option.licence)}`, () => {
            const { standardOutcome, licence, decisions } = option
            expect(service.validateFormGroup({ licence, stage, decisions: decisions || {}, conditionVersion })).toEqual(
              standardOutcome
            )
          })
        })
      })

      describe('address review failed', () => {
        options.forEach((option) => {
          test(`should return ${JSON.stringify(option.addressReviewFailedOutcome)} for ${JSON.stringify(
            option.licence
          )}`, () => {
            const { addressReviewFailedOutcome, licence, decisions } = option
            const decs = {
              ...decisions,
              curfewAddressRejected: true,
              addressReviewFailed: true,
            }
            expect(service.validateFormGroup({ licence, stage, decisions: decs, conditionVersion })).toEqual(
              addressReviewFailedOutcome
            )
          })
        })
      })

      describe('risk failed', () => {
        options.forEach((option) => {
          test(`should return ${JSON.stringify(option.addressRiskFailedOutcome)} for ${JSON.stringify(
            option.licence
          )}`, () => {
            const { addressRiskFailedOutcome, licence, decisions } = option
            const decs = {
              ...decisions,
              curfewAddressRejected: true,
              addressReviewFailed: false,
              addressUnsuitable: true,
            }
            expect(service.validateFormGroup({ licence, stage, decisions: decs, conditionVersion })).toEqual(
              addressRiskFailedOutcome
            )
          })
        })
      })

      describe('bass requested', () => {
        const validBassLicence: Licence = {
          ...validLicence,
          bassReferral: {
            bassRequest: { bassRequested: 'Yes', specificArea: 'No' },
            bassAreaCheck: { bassAreaSuitable: 'Yes', approvedPremisesRequiredYesNo: 'No' },
          },
        }

        const bassOptions = [
          { licence: validBassLicence, outcome: {} },
          {
            licence: { ...validBassLicence, bassReferral: {} },
            outcome: {
              bassAreaCheck: {
                bassReferral: 'Enter the bass area check details',
              },
              bassReferral: {
                bassRequest: 'Enter the bass referral details',
              },
            },
          },
          { licence: { ...validBassLicence, proposedAddress: {} }, outcome: {} },
        ]

        bassOptions.forEach((option) => {
          test(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.licence)}`, () => {
            const { outcome, licence } = option
            expect(
              service.validateFormGroup({
                licence,
                stage,
                decisions: { bassReferralNeeded: true },
                conditionVersion,
              })
            ).toEqual(outcome)
          })
        })
      })

      describe('bass area suitable', () => {
        const validBassLicence: Licence = {
          curfew: { curfewHours: validCurfewHours },
          bassReferral: {
            bassRequest: { bassRequested: 'No', specificArea: 'No' },
            bassAreaCheck: { bassAreaSuitable: 'Yes', approvedPremisesRequiredYesNo: 'No' },
          },
        }

        const bassOptions: Array<{ licence: Licence; bassOutcome: any }> = [
          { licence: validBassLicence, bassOutcome: {} },
          {
            licence: {
              ...validBassLicence,
              bassReferral: {
                ...validBassLicence.bassReferral,
                bassRequest: { bassRequested: 'Yes', specificArea: 'Yes' },
              },
            },
            bassOutcome: {
              bassReferral: {
                bassRequest: {
                  proposedCounty: 'Enter a county',
                  proposedTown: 'Enter a town',
                },
              },
            },
          },
          {
            licence: {},
            bassOutcome: {
              bassReferral: {
                bassAreaCheck: 'Enter the bass area check details',
                bassRequest: 'Enter the bass referral details',
              },
            },
          },
        ]

        bassOptions.forEach((option) => {
          test(`should return ${JSON.stringify(option.bassOutcome)} for ${JSON.stringify(option.licence)}`, () => {
            const { bassOutcome, licence } = option
            expect(
              service.validateFormGroup({ licence, stage, decisions: { bassAreaNotSuitable: true }, conditionVersion })
            ).toEqual(bassOutcome)
          })
        })
      })
    })
  })
})
