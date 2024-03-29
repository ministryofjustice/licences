import baseJoi from 'joi'
import dateJoi from '@hapi/joi-date'

const joi = baseJoi.extend(dateJoi)
import moment from 'moment'

const today = moment().startOf('day').format('MM-DD-YYYY')

export default joi.object({
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
    abuseAndBehaviours: joi.any().required(),
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
    reportingTime: joi.string().allow('').optional(),
    reportingDaily: joi.when('reportingTime', {
      is: '',
      then: joi.string().required(),
      otherwise: joi.valid('').optional(),
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
    appointmentDate: joi.date().format('DD/MM/YYYY').min(today).required(),
    appointmentTime: joi.string().required(),
    appointmentAddress: joi.string().required(),
  }),
  ATTENDDEPENDENCYINDRUGSSECTION: joi.object({
    appointmentDateInDrugsSection: joi.date().format('DD/MM/YYYY').min(today).required(),
    appointmentTimeInDrugsSection: joi.string().required(),
    appointmentAddressInDrugsSection: joi.string().required(),
  }),
  ATTENDSAMPLE: joi.object({
    attendSampleDetailsName: joi.string().required(),
    attendSampleDetailsAddress: joi.string().required(),
  }),
  POLYGRAPH: joi.object({}),
  DRUG_TESTING: joi.object({
    drug_testing_name: joi.string().required(),
    drug_testing_address: joi.string().required(),
  }),
})
