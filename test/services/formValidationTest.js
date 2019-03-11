/* eslint-disable global-require */
const createLicenceService = require('../../server/services/licenceService')

describe('validation', () => {
  const service = createLicenceService({}, {})

  describe('validateForm', () => {
    describe('eligibility', () => {
      const {
        excluded,
        suitability,
        exceptionalCircumstances,
        crdTime,
      } = require('../../server/routes/config/eligibility')
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

        options.forEach(option => {
          it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
            const { outcome, formResponse } = option
            expect(service.validateForm({ formResponse, pageConfig })).to.eql(outcome)
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

        options.forEach(option => {
          it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
            const { outcome, formResponse } = option
            expect(service.validateForm({ formResponse, pageConfig })).to.eql(outcome)
          })
        })
      })

      describe('exceptionalCircumstances', () => {
        const pageConfig = exceptionalCircumstances
        const options = [
          { formResponse: { decision: 'Yes' }, outcome: {} },
          { formResponse: { decision: '' }, outcome: { decision: 'Select yes or no' } },
        ]

        options.forEach(option => {
          it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
            const { outcome, formResponse } = option
            expect(service.validateForm({ formResponse, pageConfig })).to.eql(outcome)
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

        options.forEach(option => {
          it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
            const { outcome, formResponse } = option
            expect(service.validateForm({ formResponse, pageConfig })).to.eql(outcome)
          })
        })
      })

      describe('curfewAddress', () => {
        const { curfewAddress } = require('../../server/routes/config/proposedAddress')
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
                telephone: 'Enter a telephone number in the right format',
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
                residents: [{ name: 'n', relationship: 'n' }, { name: '', relationship: 'n' }],
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
          ]

          options.forEach(option => {
            it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
              const { outcome, formResponse } = option
              expect(
                service.validateForm({
                  formResponse,
                  pageConfig,
                  formType: 'curfewAddress',
                })
              ).to.eql(outcome)
            })
          })
        })
      })
    })

    describe('processing_ro', () => {
      const { riskManagement } = require('../../server/routes/config/risk')
      describe('risk', () => {
        const pageConfig = riskManagement
        const options = [
          {
            formResponse: {
              planningActions: 'No',
              awaitingInformation: 'No',
              proposedAddressSuitable: 'No',
              unsuitableReason: '',
            },
            outcome: { unsuitableReason: 'Provide details of why you made this decision' },
          },
          {
            formResponse: {
              planningActions: 'No',
              awaitingInformation: 'No',
              proposedAddressSuitable: 'No',
              unsuitableReason: 'Reason',
            },
            outcome: {},
          },
          {
            formResponse: { planningActions: '', awaitingInformation: '', proposedAddressSuitable: '' },
            outcome: {
              planningActions: 'Say if there are risk management actions',
              awaitingInformation: 'Say if you are still awaiting information',
              proposedAddressSuitable: 'Say if the proposed address is suitable',
            },
          },
          {
            formResponse: {
              planningActions: 'Yes',
              awaitingInformation: 'Yes',
              proposedAddressSuitable: 'Yes',
            },
            outcome: {},
          },
        ]

        options.forEach(option => {
          it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
            const { outcome, formResponse } = option
            expect(service.validateForm({ formResponse, pageConfig })).to.eql(outcome)
          })
        })
      })

      const { victimLiaison } = require('../../server/routes/config/victim')
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

        options.forEach(option => {
          it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
            const { outcome, formResponse } = option
            expect(service.validateForm({ formResponse, pageConfig })).to.eql(outcome)
          })
        })
      })

      const { reportingInstructions } = require('../../server/routes/config/reporting')
      describe('reportingInstructions', () => {
        const pageConfig = reportingInstructions
        const options = [
          {
            formResponse: {
              name: 'n',
              buildingAndStreet1: 'o',
              townOrCity: 't',
              postcode: 'S1 4JQ',
              telephone: '0770000000',
            },
            outcome: {},
          },
          {
            formResponse: {
              name: '',
              buildingAndStreet1: '',
              townOrCity: '',
              postcode: 'a',
              telephone: 'd',
            },
            outcome: {
              name: 'Enter a name',
              buildingAndStreet1: 'Enter a building or street',
              townOrCity: 'Enter a town or city',
              postcode: 'Enter a postcode in the right format',
              telephone: 'Enter a telephone number in the right format',
            },
          },
        ]

        options.forEach(option => {
          it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
            const { outcome, formResponse } = option
            expect(service.validateForm({ formResponse, pageConfig })).to.eql(outcome)
          })
        })
      })

      const { curfewHours, curfewAddressReview } = require('../../server/routes/config/curfew')
      describe('curfewAddressReview', () => {
        const pageConfig = curfewAddressReview
        const options = [
          {
            formResponse: { consent: 'No' },
            outcome: {},
          },
          {
            formResponse: { consent: 'Yes' },
            outcome: { electricity: 'Say if there is an electricity supply' },
          },
          {
            formResponse: { consent: 'Yes', electricity: 'Yes' },
            outcome: { homeVisitConducted: 'Say if you did a home visit' },
          },
          {
            formResponse: { consent: 'Yes', electricity: 'No' },
            outcome: {},
          },
          {
            formResponse: { consent: 'Yes', electricity: 'Yes', homeVisitConducted: 'Yes' },
            outcome: {},
          },
        ]

        options.forEach(option => {
          it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
            const { outcome, formResponse } = option
            expect(
              service.validateForm({
                formResponse,
                pageConfig,
                formType: 'curfewAddressReview',
              })
            ).to.eql(outcome)
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

        options.forEach(option => {
          it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
            const { outcome, formResponse } = option
            expect(
              service.validateForm({
                formResponse,
                pageConfig,
                formType: 'curfewAddressReview',
                bespokeConditions: { offenderIsMainOccupier: true },
              })
            ).to.eql(outcome)
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

        options.forEach(option => {
          it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
            const { outcome, formResponse } = option
            expect(service.validateForm({ formResponse, pageConfig })).to.eql(outcome)
          })
        })
      })

      const { standard, additional } = require('../../server/routes/config/licenceConditions')
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

        options.forEach(option => {
          it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
            const { outcome, formResponse } = option
            expect(service.validateForm({ formResponse, pageConfig })).to.eql(outcome)
          })
        })
      })

      describe('additionalConditions', () => {
        const pageConfig = additional
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
          { formResponse: { COMPLYREQUIREMENTS: { courseOrCentre: 'g' } }, outcome: {} },
          {
            formResponse: { COMPLYREQUIREMENTS: {} },
            outcome: { COMPLYREQUIREMENTS: { courseOrCentre: 'Enter name of course / centre' } },
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
                appointmentDate: '12/03/2020',
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
            outcome: { ATTENDDEPENDENCY: { appointmentDate: 'Enter a date that is in the future' } },
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
              DO_NOT_MEET: {
                do_not_meet_associated: 'a',
                do_not_meet_name: 'a',
              },
            },
            outcome: {},
          },
          {
            formResponse: { DO_NOT_MEET: {} },
            outcome: {
              DO_NOT_MEET: {
                do_not_meet_name: 'Enter name',
              },
            },
          },
          {
            formResponse: {
              TELL_PROBATION_ABOUT_RELATIONSHIP: {
                tell_probation_about_relationship_gender: 'a',
              },
            },
            outcome: {},
          },
          {
            formResponse: { TELL_PROBATION_ABOUT_RELATIONSHIP: {} },
            outcome: {
              TELL_PROBATION_ABOUT_RELATIONSHIP: {
                tell_probation_about_relationship_gender: 'Select an option',
              },
            },
          },
          {
            formResponse: {
              DO_NOT_LIVE_OR_STAY: {
                do_not_live: 'a',
              },
            },
            outcome: {},
          },
          {
            formResponse: { DO_NOT_LIVE_OR_STAY: {} },
            outcome: {
              DO_NOT_LIVE_OR_STAY: {
                do_not_live: 'Select an option',
              },
            },
          },
          {
            formResponse: {
              NO_UNSUPERVISED_CONTACT: {
                do_not_unsupervised_contact: 'a',
                do_not_unsupervised_social_services_dept: 'a',
                do_not_unsupervised_social_services_dept_name: 'a',
              },
            },
            outcome: {},
          },
          {
            formResponse: { NO_UNSUPERVISED_CONTACT: {} },
            outcome: {
              NO_UNSUPERVISED_CONTACT: {
                do_not_unsupervised_contact: 'Select an option',
              },
            },
          },
          {
            formResponse: {
              NO_UNSUPERVISED_CONTACT: {
                do_not_unsupervised_contact: 'a',
                do_not_unsupervised_social_services_dept: 'yes',
                do_not_unsupervised_social_services_dept_name: '',
              },
            },
            outcome: {
              NO_UNSUPERVISED_CONTACT: {
                do_not_unsupervised_social_services_dept_name: 'Enter social services name',
              },
            },
          },
          {
            formResponse: {
              DO_NOT_STAY_IN_SIGHT_OF: {
                do_not_in_sight_of_type: 'a',
              },
            },
            outcome: {},
          },
          {
            formResponse: { DO_NOT_STAY_IN_SIGHT_OF: {} },
            outcome: {
              DO_NOT_STAY_IN_SIGHT_OF: {
                do_not_in_sight_of_type: 'Enter a type of location',
              },
            },
          },
          {
            formResponse: {
              DO_NOT_TAKE_PART_IN_ACTIVITY: {
                do_not_work_involve: 'a',
              },
            },
            outcome: {},
          },
          {
            formResponse: { DO_NOT_TAKE_PART_IN_ACTIVITY: {} },
            outcome: {
              DO_NOT_TAKE_PART_IN_ACTIVITY: {
                do_not_work_involve: 'Select an option',
              },
            },
          },
          {
            formResponse: {
              DO_NOT_CONTACT_VICTIM: {
                do_not_contact_victim_name: 'a',
                do_not_contact_victim_social_services_dept: 'a',
                do_not_contact_victim_social_services_dept_name: 'a',
              },
            },
            outcome: {},
          },
          {
            formResponse: { DO_NOT_CONTACT_VICTIM: {} },
            outcome: {
              DO_NOT_CONTACT_VICTIM: {
                do_not_contact_victim_name: 'Enter a victim name',
              },
            },
          },
          {
            formResponse: {
              DO_NOT_CONTACT_VICTIM: {
                do_not_contact_victim_name: 'a',
                do_not_contact_victim_social_services_dept: 'yes',
                do_not_contact_victim_social_services_dept_name: '',
              },
            },
            outcome: {
              DO_NOT_CONTACT_VICTIM: {
                do_not_contact_victim_social_services_dept_name: 'Enter social services name',
              },
            },
          },
          {
            formResponse: {
              FOLLOW_REHABILITATION_INSTRUCTIONS: {
                follow_rehabilitation_instructions: 'a',
              },
            },
            outcome: {},
          },
          {
            formResponse: { FOLLOW_REHABILITATION_INSTRUCTIONS: {} },
            outcome: {
              FOLLOW_REHABILITATION_INSTRUCTIONS: {
                follow_rehabilitation_instructions: 'Select an option',
              },
            },
          },
          {
            formResponse: {
              GIVE_URINE_SAMPLE: {
                give_sample: 'a',
              },
            },
            outcome: {},
          },
          {
            formResponse: { GIVE_URINE_SAMPLE: {} },
            outcome: {
              GIVE_URINE_SAMPLE: {
                give_sample: 'Select an option',
              },
            },
          },
          {
            formResponse: {
              GO_TO_APPOINTMENTS: {
                go_to_appointments_with: 'a',
              },
            },
            outcome: {},
          },
          {
            formResponse: { GO_TO_APPOINTMENTS: {} },
            outcome: {
              GO_TO_APPOINTMENTS: {
                go_to_appointments_with: 'Select an option',
              },
            },
          },
          {
            formResponse: {
              ALLOW_VISIT: {
                allow_visit_with: 'a',
              },
            },
            outcome: {},
          },
          {
            formResponse: { ALLOW_VISIT: {} },
            outcome: {
              ALLOW_VISIT: {
                allow_visit_with: 'Select an option',
              },
            },
          },
          {
            formResponse: {
              STAY_AT_ADDRESS: {
                stay_at_address_name: 'a',
                stay_at_address_from: 'a',
                stay_at_address_to: 'a',
                stay_at_address_frequency: 'a',
              },
            },
            outcome: {},
          },
          {
            formResponse: { STAY_AT_ADDRESS: {} },
            outcome: {
              STAY_AT_ADDRESS: {
                stay_at_address_name: 'Enter an address',
                stay_at_address_from: 'Enter a curfew from time',
                stay_at_address_to: 'Enter a curfew to time',
                stay_at_address_frequency: 'Select an option',
              },
            },
          },
          {
            formResponse: {
              REPORT_TO_STAFF_AT: {
                report_to_staff_at_location: 'a',
                report_to_staff_at_time_and_day: 'a',
              },
            },
            outcome: {},
          },
          {
            formResponse: { REPORT_TO_STAFF_AT: {} },
            outcome: {
              REPORT_TO_STAFF_AT: {
                report_to_staff_at_location: 'Enter a location',
                report_to_staff_at_time_and_day: 'Enter a time and day',
              },
            },
          },
          {
            formResponse: {
              POLICE_TAKE_TO: {
                police_take_to_address: 'a',
              },
            },
            outcome: {},
          },
          {
            formResponse: { POLICE_TAKE_TO: {} },
            outcome: {
              POLICE_TAKE_TO: {
                police_take_to_address: 'Enter an address',
              },
            },
          },
          {
            formResponse: {
              TELL_PROBATION_DOCUMENT: {
                tell_probation_document_own: 'a',
                tell_probation_document_apply: 'a',
              },
            },
            outcome: {},
          },
          {
            formResponse: { TELL_PROBATION_DOCUMENT: {} },
            outcome: {
              TELL_PROBATION_DOCUMENT: {
                tell_probation_document_own: 'Select an option',
                tell_probation_document_apply: 'Select an option',
              },
            },
          },
          {
            formResponse: {
              DO_NOT_GO_PREMISES: {
                do_not_go_premises_address: 'a',
              },
            },
            outcome: {},
          },
          {
            formResponse: { DO_NOT_GO_PREMISES: {} },
            outcome: {
              DO_NOT_GO_PREMISES: {
                do_not_go_premises_address: 'Give premises details',
              },
            },
          },
          {
            formResponse: {
              STAY_AT_NIGHT: {
                stay_at_night_address: 'a',
              },
            },
            outcome: {},
          },
          {
            formResponse: { STAY_AT_NIGHT: {} },
            outcome: {
              STAY_AT_NIGHT: {
                stay_at_night_address: 'Give an address',
              },
            },
          },
          {
            formResponse: {
              ONLY_USE_INTERNET_AT: {
                only_use_internet_at_location: 'a',
              },
            },
            outcome: {},
          },
          {
            formResponse: { ONLY_USE_INTERNET_AT: {} },
            outcome: {
              ONLY_USE_INTERNET_AT: {
                only_use_internet_at_location: 'Give a location',
              },
            },
          },
          {
            formResponse: {
              DO_NOT_ACCESS_DOWNLOAD: {
                do_not_access_download_type: 'a',
                do_not_access_download_target: 'a',
              },
            },
            outcome: {},
          },
          {
            formResponse: { DO_NOT_ACCESS_DOWNLOAD: {} },
            outcome: {
              DO_NOT_ACCESS_DOWNLOAD: {
                do_not_access_download_type: 'Select an option',
                do_not_access_download_target: 'Give details',
              },
            },
          },
          {
            formResponse: {
              DO_NOT_OWN_ITEM: {
                do_not_own_item: 'a',
              },
            },
            outcome: {},
          },
          {
            formResponse: { DO_NOT_OWN_ITEM: {} },
            outcome: {
              DO_NOT_OWN_ITEM: {
                do_not_own_item: 'Give details',
              },
            },
          },
          {
            formResponse: {
              TELL_ABOUT_ANIMAL: {
                tell_about_animal: 'a',
              },
            },
            outcome: {},
          },
          {
            formResponse: { TELL_ABOUT_ANIMAL: {} },
            outcome: {
              TELL_ABOUT_ANIMAL: {
                tell_about_animal: 'Give details',
              },
            },
          },
          {
            formResponse: {
              DO_NOT_HAVE_MORE_MONEY: {
                do_not_have_more_money_amount: 'a',
              },
            },
            outcome: {},
          },
          {
            formResponse: { DO_NOT_HAVE_MORE_MONEY: {} },
            outcome: {
              DO_NOT_HAVE_MORE_MONEY: {
                do_not_have_more_money_amount: 'Give amount',
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
              DO_NOT_CONTACT_PRISONERS: {},
              DO_NOT_CONTACT_SEX_OFFENDER: {},
              GO_WHERE_PROBATION_OFFICER: {},
              REPORT_WITHIN_2_DAYS: {},
              GIVE_PASSPORT_TO_PROBATION: {},
              TELL_PROBATION_VEHICLE_DETAILS: {},
              DO_NOT_TRAVEL_IN: {},
              TELL_PROBATION_REUSABLE_CARD: {},
              DO_NOT_GO_AREA: {},
              ONLY_WORSHIP_APPROVED: {},
              YOU_WILL_BE_SUBJECT_TO: {},
              GO_FOR_POLYGRAPH: {},
              DO_NOT_HAVE_MORE_THAN_ONE_PHONE: {},
              DO_NOT_DELETE_HISTORY: {},
              GET_PERMISSION_FOR_SOFTWARE: {},
              PROVIDE_DETAILS_OF_CLOUD_STORAGE: {},
              PROVIDE_ADDRESS_OF_PREMISES: {},
              PROVIDE_BANK_DETAILS: {},
              PROVIDE_THIRD_PARTY_ACCOUNTS: {},
              PROVIDE_MONEY_TRANSFER_DETAILS: {},
              DO_NOT_CONTACT_EXTREMISTS: {},
              DO_NOT_GO_TO_WORSHIP_MEETINGS: {},
              DO_NOT_GIVE_SERMON: {},
              DO_NOT_PROMOTE_EXTREMISM: {},
              DO_NOT_DEMONSTRATE: {},
              DO_NOT_HAVE_ENCODED_INFORMATION: {},
            },
            outcome: {},
          },
        ]

        options.forEach(option => {
          it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
            const { outcome, formResponse } = option
            expect(
              service.validateForm({
                formResponse,
                pageConfig,
                formType: 'additional',
              })
            ).to.eql(outcome)
          })
        })
      })
    })

    describe('processing_ca', () => {
      const { seriousOffence, onRemand, confiscationOrder } = require('../../server/routes/config/finalChecks')
      describe('excluded', () => {
        const pageConfig = seriousOffence
        const options = [
          { formResponse: { decision: 'Yes' }, outcome: {} },
          { formResponse: { decision: '' }, outcome: { decision: 'Select yes or no' } },
        ]

        options.forEach(option => {
          it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
            const { outcome, formResponse } = option
            expect(service.validateForm({ formResponse, pageConfig })).to.eql(outcome)
          })
        })
      })

      describe('onRemand', () => {
        const pageConfig = onRemand
        const options = [
          { formResponse: { decision: 'Yes' }, outcome: {} },
          { formResponse: { decision: '' }, outcome: { decision: 'Select yes or no' } },
        ]

        options.forEach(option => {
          it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
            const { outcome, formResponse } = option
            expect(service.validateForm({ formResponse, pageConfig })).to.eql(outcome)
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

        options.forEach(option => {
          it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
            const { outcome, formResponse } = option
            expect(service.validateForm({ formResponse, pageConfig })).to.eql(outcome)
          })
        })
      })
    })

    describe('curfew', () => {
      const { firstNight } = require('../../server/routes/config/curfew')
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

        options.forEach(option => {
          it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
            const { outcome, formResponse } = option
            expect(service.validateForm({ formResponse, pageConfig })).to.eql(outcome)
          })
        })
      })
    })

    describe('bassReferral', () => {
      const { bassRequest, bassAreaCheck, bassOffer } = require('../../server/routes/config/bassReferral')

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

        options.forEach(option => {
          it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
            const { outcome, formResponse } = option
            expect(service.validateForm({ formResponse, pageConfig })).to.eql(outcome)
          })
        })
      })

      describe('bassAreaCheck', () => {
        const pageConfig = bassAreaCheck
        const options = [
          { formResponse: { bassAreaSuitable: 'Yes' }, outcome: {} },
          { formResponse: { bassAreaSuitable: 'No' }, outcome: { bassAreaReason: 'Enter a reason' } },
          { formResponse: { bassAreaSuitable: 'No', bassAreaReason: 'reason' }, outcome: {} },
        ]

        options.forEach(option => {
          it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
            const { outcome, formResponse } = option
            expect(service.validateForm({ formResponse, pageConfig })).to.eql(outcome)
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

          options.forEach(option => {
            it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.response)}`, () => {
              const { outcome, formResponse } = option
              expect(
                service.validateForm({
                  formResponse,
                  pageConfig,
                  bespokeConditions: { postApproval: false },
                })
              ).to.eql(outcome)
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

          options.forEach(option => {
            it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
              const { outcome, formResponse } = option
              expect(
                service.validateForm({
                  formResponse,
                  pageConfig,
                  bespokeConditions: { postApproval: true },
                })
              ).to.eql(outcome)
            })
          })
        })
      })
    })

    describe('approval', () => {
      const { release } = require('../../server/routes/config/approval')
      describe('release', () => {
        const pageConfig = release

        context('when confiscationOrder is true', () => {
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

          options.forEach(option => {
            it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
              const { outcome, formResponse } = option
              expect(
                service.validateForm({
                  formResponse,
                  pageConfig,
                  bespokeConditions: { confiscationOrder: true },
                })
              ).to.eql(outcome)
            })
          })
        })

        context('when confiscationOrder is false', () => {
          const options = [
            { formResponse: { decision: 'Yes', notedComments: 'comments' }, outcome: {} },
            { formResponse: { decision: 'Yes', notedComments: '' }, outcome: {} },
            { formResponse: { decision: 'No', reason: 'reason' }, outcome: {} },
            { formResponse: { decision: 'No', reason: ['reason', 'reason2'] }, outcome: {} },
            { formResponse: { decision: 'No', reason: [] }, outcome: { reason: 'Select a reason' } },
          ]

          options.forEach(option => {
            it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
              const { outcome, formResponse } = option
              expect(service.validateForm({ formResponse, pageConfig })).to.eql(outcome)
            })
          })
        })
      })
    })

    describe('reporting', () => {
      const { reportingDate } = require('../../server/routes/config/reporting')
      describe('reportingDate', () => {
        const pageConfig = reportingDate

        const options = [
          { formResponse: { reportingDate: '12/03/2025', reportingTime: '15:00' }, outcome: {} },
          {
            formResponse: { reportingDate: '12/03/2016', reportingTime: '15:00' },
            outcome: { reportingDate: 'Enter a date that is in the future' },
          },
          {
            formResponse: { reportingDate: '24/24/2025', reportingTime: '15:00' },
            outcome: { reportingDate: 'Enter a valid date' },
          },
          {
            formResponse: { reportingDate: '', reportingTime: '15:00' },
            outcome: { reportingDate: 'Enter a valid date' },
          },
          {
            formResponse: { reportingDate: '', reportingTime: '' },
            outcome: { reportingDate: 'Enter a valid date', reportingTime: 'Enter a valid time' },
          },
          {
            formResponse: { reportingDate: '12/03/2025', reportingTime: '24:40' },
            outcome: { reportingTime: 'Enter a valid time' },
          },
        ]

        options.forEach(option => {
          it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
            const { outcome, formResponse } = option
            expect(service.validateForm({ formResponse, pageConfig })).to.eql(outcome)
          })
        })
      })
    })

    describe('vary', () => {
      const { licenceDetails } = require('../../server/routes/config/vary')
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
              telephone: 'Enter a telephone number in the right format',
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

        options.forEach(option => {
          it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.formResponse)}`, () => {
            const { outcome, formResponse } = option
            expect(service.validateForm({ formResponse, pageConfig })).to.eql(outcome)
          })
        })
      })
    })
  })

  describe('validateFormGroup', () => {
    describe('eligibility', () => {
      const stage = 'ELIGIBILITY'
      const validAddress = {
        addressLine1: 'a1',
        addressTown: 't1',
        postCode: 'S105NW',
        cautionedAgainstResident: 'No',
        telephone: '07700000000',
      }

      const invalidAddress = {
        addressTown: 't1',
        postCode: 'S105NW',
        cautionedAgainstResident: 'No',
        telephone: '07700000000',
      }
      const validLicence = { proposedAddress: { curfewAddress: validAddress } }
      const invalidLicence = { proposedAddress: { curfewAddress: invalidAddress } }

      const options = [
        { licence: validLicence, outcome: {} },
        {
          licence: invalidLicence,
          outcome: { proposedAddress: { curfewAddress: { addressLine1: 'Enter an address' } } },
        },
        { licence: {}, outcome: { proposedAddress: { curfewAddress: 'Please provide a curfew address' } } },
      ]

      options.forEach(option => {
        it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.licence)}`, () => {
          const { outcome, licence } = option
          expect(service.validateFormGroup({ licence, stage })).to.eql(outcome)
        })
      })

      context('bass referral needed', () => {
        const validBassRequest = { bassRequested: 'No', specificArea: 'No' }
        const validBassLicence = {
          proposedAddress: {
            curfewAddress: {
              addresses: [validAddress],
            },
          },
          bassReferral: {
            bassRequest: validBassRequest,
          },
        }

        const bassOptions = [
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

        bassOptions.forEach(option => {
          it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.licence)}`, () => {
            const { outcome, licence } = option
            expect(service.validateFormGroup({ licence, stage, decisions: { bassReferralNeeded: true } })).to.eql(
              outcome
            )
          })
        })
      })
    })

    describe('processing_ro', () => {
      const stage = 'PROCESSING_RO'
      const validRiskManagement = {
        planningActions: 'No',
        awaitingInformation: 'No',
        proposedAddressSuitable: 'Yes',
      }
      const validVictim = { decision: 'No' }
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
        buildingAndStreet1: 'o',
        townOrCity: 't',
        postcode: 'S1 4JQ',
        telephone: '0770000000',
      }

      const validAddressReview = { consent: 'Yes', electricity: 'Yes', homeVisitConducted: 'Yes' }

      const validLicence = {
        risk: { riskManagement: validRiskManagement },
        victim: { victimLiaison: validVictim },
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

      const validLicenceNoOccupierConsent = {
        ...validLicence,
        curfew: {
          ...validLicence.curfew,
          curfewAddressReview: { consent: 'No' },
        },
      }

      const validLicenceNoElec = {
        ...validLicence,
        curfew: {
          ...validLicence.curfew,
          curfewAddressReview: { consent: 'Yes', electricity: 'No' },
        },
      }

      const validLicenceNoConditions = {
        risk: { riskManagement: validRiskManagement },
        victim: { victimLiaison: validVictim },
        curfew: {
          curfewHours: validCurfewHours,
          curfewAddressReview: validAddressReview,
        },
        reporting: { reportingInstructions: validReportingInstructions },
        licenceConditions: { standard: { additionalConditionsRequired: 'No' } },
      }

      const invalidLicence = {
        risk: { riskManagement: { planningActions: '', awaitingInformation: 'No' } },
        victim: { victimLiaison: validVictim },
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
            risk: { riskManagement: 'Enter the risk management and victim liaison details' },
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
            risk: { riskManagement: 'Enter the risk management and victim liaison details' },
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

      context('address not rejected', () => {
        options.forEach(option => {
          it(`should return ${JSON.stringify(option.standardOutcome)} for ${JSON.stringify(option.licence)}`, () => {
            const { standardOutcome, licence, decisions } = option
            expect(service.validateFormGroup({ licence, stage, decisions: decisions || {} })).to.eql(standardOutcome)
          })
        })
      })

      context('address review failed', () => {
        options.forEach(option => {
          it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.licence)}`, () => {
            const { addressReviewFailedOutcome, licence, decisions } = option
            const decs = {
              ...decisions,
              curfewAddressRejected: true,
              addressReviewFailed: true,
            }
            expect(service.validateFormGroup({ licence, stage, decisions: decs })).to.eql(addressReviewFailedOutcome)
          })
        })
      })

      context('risk failed', () => {
        options.forEach(option => {
          it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.licence)}`, () => {
            const { addressRiskFailedOutcome, licence, decisions } = option
            const decs = {
              ...decisions,
              curfewAddressRejected: true,
              addressReviewFailed: false,
              addressUnsuitable: true,
            }
            expect(service.validateFormGroup({ licence, stage, decisions: decs })).to.eql(addressRiskFailedOutcome)
          })
        })
      })

      context('bass requested', () => {
        const validBassRequest = { bassRequested: 'Yes', specificArea: 'No' }
        const validBassAreaCheck = { bassAreaSuitable: 'Yes' }
        const validBassLicence = {
          ...validLicence,
          bassReferral: {
            bassRequest: validBassRequest,
            bassAreaCheck: validBassAreaCheck,
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

        bassOptions.forEach(option => {
          it(`should return ${JSON.stringify(option.outcome)} for ${JSON.stringify(option.licence)}`, () => {
            const { outcome, licence } = option
            expect(
              service.validateFormGroup({
                licence,
                stage,
                decisions: { bassReferralNeeded: true },
              })
            ).to.eql(outcome)
          })
        })
      })

      context('bass area suitable', () => {
        const validBassRequest = { bassRequested: 'No', specificArea: 'No' }
        const validBassAreaCheck = { bassAreaSuitable: 'Yes' }
        const validBassLicence = {
          curfew: { curfewHours: validCurfewHours },
          bassReferral: {
            bassRequest: validBassRequest,
            bassAreaCheck: validBassAreaCheck,
          },
        }

        const bassOptions = [
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

        bassOptions.forEach(option => {
          it(`should return ${JSON.stringify(option.bassOutcome)} for ${JSON.stringify(option.licence)}`, () => {
            const { bassOutcome, licence } = option
            expect(service.validateFormGroup({ licence, stage, decisions: { bassAreaNotSuitable: true } })).to.eql(
              bassOutcome
            )
          })
        })
      })
    })
  })
})
