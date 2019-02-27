const baseJoi = require('joi')
const dateExtend = require('joi-date-extensions')
const postcodeExtend = require('joi-postcode')

const joi = baseJoi.extend(dateExtend).extend(postcodeExtend)
const moment = require('moment')

const today = moment()
  .startOf('day')
  .format('MM-DD-YYYY')

module.exports = joi.object({
  NOCONTACTASSOCIATE: joi.object({
    groupsOrOrganisation: joi.string().required(),
  }),
  INTIMATERELATIONSHIP: joi.object({
    intimateGender: joi.string().required(),
  }),
  NOCONTACTNAMED: joi.object({
    noContactOffenders: joi.string().required(),
  }),
  NORESIDE: joi.object({
    notResideWithGender: joi.string().required(),
    notResideWithAge: joi.string().required(),
  }),
  NOUNSUPERVISEDCONTACT: joi.object({
    unsupervisedContactGender: joi.string().required(),
    unsupervisedContactAge: joi.string().required(),
    unsupervisedContactSocial: joi.string().required(),
  }),
  NOCHILDRENSAREA: joi.object({
    notInSightOf: joi.string().required(),
  }),
  NOWORKWITHAGE: joi.object({
    noWorkWithAge: joi.string().required(),
  }),
  NOCOMMUNICATEVICTIM: joi.object({
    victimFamilyMembers: joi.string().required(),
    socialServicesDept: joi.string().required(),
  }),
  COMPLYREQUIREMENTS: joi.object({
    courseOrCentre: joi.string().required(),
  }),
  ATTENDALL: joi.object({
    appointmentName: joi.string().required(),
    appointmentProfession: joi.string().required(),
  }),
  HOMEVISITS: joi.object({
    mentalHealthName: joi.string().required(),
  }),
  REMAINADDRESS: joi.object({
    curfewAddress: joi.string().required(),
    curfewFrom: joi.string().required(),
    curfewTo: joi.string().required(),
    curfewTagRequired: joi.string().optional(),
  }),
  CONFINEADDRESS: joi.object({
    confinedTo: joi.string().required(),
    confinedFrom: joi.string().required(),
    confinedReviewFrequency: joi.string().required(),
  }),
  REPORTTO: joi.object({
    reportingAddress: joi.string().required(),
    reportingTime: joi
      .string()
      .allow('')
      .optional(),
    reportingDaily: joi.when('reportingTime', {
      is: '',
      then: joi.string().required(),
      otherwise: joi.valid(['']).optional(),
    }),
    reportingFrequency: joi.string().required(),
  }),
  VEHICLEDETAILS: joi.object({
    vehicleDetails: joi.string().required(),
  }),
  EXCLUSIONADDRESS: joi.object({
    noEnterPlace: joi.string().required(),
  }),
  EXCLUSIONAREA: joi.object({
    exclusionArea: joi.string().required(),
  }),
  NOTIFYRELATIONSHIP: joi.object({}),
  NOCONTACTPRISONER: joi.object({}),
  NOCONTACTSEXOFFENDER: joi.object({}),
  CAMERAAPPROVAL: joi.object({}),
  NOCAMERA: joi.object({}),
  NOCAMERAPHONE: joi.object({}),
  USAGEHISTORY: joi.object({}),
  NOINTERNET: joi.object({}),
  ONEPHONE: joi.object({}),
  RETURNTOUK: joi.object({}),
  SURRENDERPASSPORT: joi.object({}),
  NOTIFYPASSPORT: joi.object({}),
  ATTENDDEPENDENCY: joi.object({
    appointmentDate: joi
      .date()
      .format('DD/MM/YYYY')
      .min(today)
      .required(),
    appointmentTime: joi.string().required(),
    appointmentAddress: joi.string().required(),
  }),
  ATTENDSAMPLE: joi.object({
    attendSampleDetailsName: joi.string().required(),
    attendSampleDetailsAddress: joi.string().required(),
  }),

  // 2019
  DO_NOT_CONTACT_PRISONERS: joi.object({}),
  DO_NOT_MEET: joi.object({
    do_not_meet_associated: joi.string().optional(),
    do_not_meet_name: joi.string().required(),
  }),
  DO_NOT_CONTACT_SEX_OFFENDER: joi.object({}),
  TELL_PROBATION_ABOUT_RELATIONSHIP: joi.object({
    tell_probation_about_relationship_gender: joi.string().required(),
  }),
  DO_NOT_LIVE_OR_STAY: joi.object({
    do_not_live: joi.string().required(),
  }),
  NO_UNSUPERVISED_CONTACT: joi.object({
    do_not_unsupervised_contact: joi.string().required(),
    do_not_unsupervised_social_services_dept: joi.string().optional(),
    do_not_unsupervised_social_services_dept_name: joi.when('do_not_unsupervised_social_services_dept', {
      is: 'yes',
      then: joi.string().required(),
      otherwise: joi.any().optional(),
    }),
  }),
  DO_NOT_STAY_IN_SIGHT_OF: joi.object({
    do_not_in_sight_of_type: joi.string().required(),
  }),
  DO_NOT_TAKE_PART_IN_ACTIVITY: joi.object({
    do_not_work_involve: joi.string().required(),
  }),
  DO_NOT_CONTACT_VICTIM: joi.object({
    do_not_contact_victim_name: joi.string().required(),
    do_not_contact_victim_social_services_dept: joi.string().optional(),
    do_not_contact_victim_social_services_dept_name: joi.when('do_not_contact_victim_social_services_dept', {
      is: 'yes',
      then: joi.string().required(),
      otherwise: joi.any().optional(),
    }),
  }),
  FOLLOW_REHABILITATION_INSTRUCTIONS: joi.object({
    follow_rehabilitation_instructions: joi.string().required(),
  }),
  GIVE_URINE_SAMPLE: joi.object({
    give_sample: joi.string().required(),
  }),
  GO_WHERE_PROBATION_OFFICER: joi.object({}),
  GO_TO_APPOINTMENTS: joi.object({
    go_to_appointments_with: joi.string().required(),
  }),
})
