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
  ALLOW_VISIT: joi.object({
    allow_visit_with: joi.string().required(),
  }),
  STAY_AT_ADDRESS: joi.object({
    stay_at_address_name: joi.string().required(),
    stay_at_address_from: joi.string().required(),
    stay_at_address_to: joi.string().required(),
    stay_at_address_frequency: joi.string().required(),
  }),
  REPORT_TO_STAFF_AT: joi.any().optional(),
  REPORT_WITHIN_2_DAYS: joi.any().optional(),
  POLICE_TAKE_TO: joi.object({
    police_take_to_address: joi.string().required(),
  }),
  TELL_PROBATION_DOCUMENT: joi.object({
    tell_probation_document_own: joi.string().required(),
    tell_probation_document_apply: joi.string().required(),
  }),
  GIVE_PASSPORT_TO_PROBATION: joi.any().optional(),
  TELL_PROBATION_VEHICLE_DETAILS: joi.any().optional(),
  DO_NOT_TRAVEL_IN: joi.any().optional(),
  TELL_PROBATION_REUSABLE_CARD: joi.any().optional(),
  DO_NOT_GO_PREMISES: joi.object({
    do_not_go_premises_address: joi.string().required(),
  }),
  DO_NOT_GO_AREA: joi.any().optional(),
  ONLY_WORSHIP_APPROVED: joi.any().optional(),
  HAVE_ELECTRONIC_TAG: joi.any().optional(),
  STAY_AT_NIGHT: joi.object({
    stay_at_night_address: joi.string().required(),
  }),
  YOU_WILL_BE_SUBJECT_TO: joi.any().optional(),
  GO_FOR_POLYGRAPH: joi.any().optional(),
  DO_NOT_HAVE_MORE_THAN_ONE_PHONE: joi.any().optional(),
  ONLY_USE_INTERNET_AT: joi.object({
    only_use_internet_at_location: joi.string().required(),
  }),
  DO_NOT_DELETE_HISTORY: joi.any().optional(),
  GET_PERMISSION_FOR_SOFTWARE: joi.any().optional(),
  DO_NOT_ACCESS_DOWNLOAD: joi.object({
    do_not_access_download_type: joi.string().required(),
    do_not_access_download_target: joi.string().required(),
  }),
  PROVIDE_DETAILS_OF_CLOUD_STORAGE: joi.any().optional(),
  DO_NOT_OWN_ITEM: joi.object({
    do_not_own_item: joi.string().required(),
  }),
  TELL_ABOUT_ANIMAL: joi.object({
    tell_about_animal: joi.string().required(),
  }),
  PROVIDE_ADDRESS_OF_PREMISES: joi.any().optional(),
  DO_NOT_HAVE_MORE_MONEY: joi.object({
    do_not_have_more_money_amount: joi.string().required(),
  }),
  PROVIDE_BANK_DETAILS: joi.any().optional(),
  PROVIDE_THIRD_PARTY_ACCOUNTS: joi.any().optional(),
  PROVIDE_MONEY_TRANSFER_DETAILS: joi.any().optional(),
  DO_NOT_CONTACT_EXTREMISTS: joi.any().optional(),
  DO_NOT_GO_TO_WORSHIP_MEETINGS: joi.any().optional(),
  DO_NOT_GIVE_SERMON: joi.any().optional(),
  DO_NOT_PROMOTE_EXTREMISM: joi.any().optional(),
  DO_NOT_DEMONSTRATE: joi.any().optional(),
  DO_NOT_HAVE_ENCODED_INFORMATION: joi.any().optional(),
})
