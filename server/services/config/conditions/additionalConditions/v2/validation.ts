import baseJoi from 'joi'
import dateJoi from '@hapi/joi-date'

const joi = baseJoi.extend(dateJoi)
import moment from 'moment'

const today = moment().startOf('day').format('MM-DD-YYYY')

export default joi.object({
  RESIDE_AT_SPECIFIC_PLACE: joi.object({
    region: joi.string().required(),
  }),
  NO_RESIDE: joi.object({
    notResideWithGender: joi.string().required(),
    notResideWithAge: joi.string().required(),
  }),
  NO_CONTACT_PRISONER: joi.object({}),
  NO_CONTACT_ASSOCIATE: joi.object({
    groupsOrOrganisation: joi.string().required(),
  }),
  NO_CONTACT_SEX_OFFENDER: joi.object({}),
  NO_CONTACT_NAMED: joi.object({
    noContactOffenders: joi.string().required(),
  }),
  NO_UNSUPERVISED_CONTACT: joi.object({
    unsupervisedContactGender: joi.string().required(),
    unsupervisedContactAge: joi.string().required(),
    unsupervisedContactSocial: joi.string().required(),
  }),
  NO_COMMUNICATE_VICTIM: joi.object({
    victimFamilyMembers: joi.string().required(),
    socialServicesDept: joi.string().required(),
  }),
  ATTEND_DEPENDENCY_IN_DRUGS_SECTION: joi.object({
    appointmentDateInDrugsSection: joi.date().format('DD/MM/YYYY').min(today).required(),
    appointmentTimeInDrugsSection: joi.string().required(),
    appointmentAddressInDrugsSection: joi.string().required(),
  }),
  ATTEND_ALL: joi.object({
    appointmentProfessions: joi.any().required(),
  }),
  HOME_VISITS: joi.object({
    mentalHealthName: joi.string().required(),
  }),
  RETURN_TO_UK: joi.object({}),
  NO_WORK_WITH_AGE: joi.object({
    noWorkWithAge: joi.string().required(),
  }),
  COMPLY_REQUIREMENTS: joi.object({
    courseOrCentre: joi.string().required(),
    abuseAndBehaviours: joi.any().required(),
  }),
  SPECIFIC_ITEM: joi.object({
    specificItem: joi.string().required(),
  }),
  SURRENDER_PASSPORT: joi.object({}),
  ONE_PHONE: joi.object({}),
  NO_INTERNET: joi.object({}),
  USAGE_HISTORY: joi.object({}),
  NO_CAMERA: joi.object({}),
  NO_CAMERA_PHONE: joi.object({}),
  CAMERA_APPROVAL: joi.object({}),
  INTIMATE_RELATIONSHIP: joi.object({
    intimateGender: joi.string().required(),
  }),
  NOTIFY_RELATIONSHIP: joi.object({}),
  NOTIFY_PASSPORT: joi.object({}),

  VEHICLE_DETAILS: joi.object({
    vehicleDetails: joi.string().required(),
  }),

  REMAIN_ADDRESS: joi.object({
    curfewAddress: joi.string().required(),
    curfewFrom: joi.string().required(),
    curfewTo: joi.string().required(),
    curfewTagRequired: joi.string().optional(),
  }),
  CONFINE_ADDRESS: joi.object({
    confinedTo: joi.string().required(),
    confinedFrom: joi.string().required(),
    confinedReviewFrequency: joi.string().required(),
  }),
  POLICE_ESCORT: joi.object({}),
  NO_CHILDRENS_AREA: joi.object({
    notInSightOf: joi.string().required(),
  }),
  EXCLUSION_ADDRESS: joi.object({
    noEnterPlace: joi.string().required(),
  }),
  EXCLUSION_AREA: joi.object({
    exclusionArea: joi.string().required(),
  }),
  REPORT_TO: joi.object({
    reportingAddress: joi.string().required(),
    reportingTime: joi.when('reportingDaily', {
      is: joi.exist(),
      then: joi.valid('').optional(),
      otherwise: joi.string().required(),
    }),
    reportingDaily: joi.string().allow('').optional(),
    reportingFrequency: joi.string().required(),
  }),
  POLYGRAPH: joi.object({}),
  DONT_HAMPER_DRUG_TESTING: joi.object({}),
  DRUG_TESTING: joi.object({
    drug_testing_name: joi.string().required(),
    drug_testing_address: joi.string().required(),
  }),
  ELECTRONIC_MONITORING_INSTALLATION: joi.object({
    conditionTypes: joi.string().required(),
  }),
  ELECTRONIC_MONITORING_TRAIL: joi.object({
    trailEndDate: joi.date().format('DD/MM/YYYY').min(today).required(),
  }),
  CURFEW_UNTIL_INSTALLATION: joi.object({
    approvedAddress: joi.string().required(),
  }),
  ALCOHOL_MONITORING: joi.object({
    timeframe: joi.string().required(),
    endDate: joi.date().format('DD/MM/YYYY').min(today).required(),
  }),
  NOTIFY_BANKING: joi.object({}),
  PLACE_OF_WORSHIP: joi.object({}),
  SPECIFIC_CONDUCT_OR_ACTS: joi.object({}),
  CONTACT_EXTREME: joi.object({}),
  ATTEND_EXTREME: joi.object({}),
  DELIVER_EXTREME: joi.object({}),
  PROMOTE_EXTREME: joi.object({}),
  EXTREME_MATERIALS: joi.object({}),
  ATTEND_DEPENDENCY: joi.object({
    appointmentDate: joi.date().format('DD/MM/YYYY').min(today).required(),
    appointmentTime: joi.string().required(),
    appointmentAddress: joi.string().required(),
  }),
  ATTEND_SAMPLE: joi.object({
    attendSampleDetailsName: joi.string().required(),
    attendSampleDetailsAddress: joi.string().required(),
  }),
  ALLOW_POLICE_SEARCH: joi.object({}),
})
