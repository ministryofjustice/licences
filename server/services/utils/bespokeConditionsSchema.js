const baseJoi = require('joi');
const dateExtend = require('joi-date-extensions');
const postcodeExtend = require('joi-postcode');
const joi = baseJoi.extend(dateExtend).extend(postcodeExtend);
const moment = require('moment');
const today = moment().startOf('day').format('MM-DD-YYYY');

module.exports = joi.object({
    NOCONTACTASSOCIATE: joi.object({
        groupsOrOrganisation: joi.string().required()
    }),
    INTIMATERELATIONSHIP: joi.object({
        intimateGender: joi.string().required()
    }),
    NOCONTACTNAMED: joi.object({
        noContactOffenders: joi.string().required()
    }),
    NORESIDE: joi.object({
        notResideWithGender: joi.string().required(),
        notResideWithAge: joi.string().required()
    }),
    NOUNSUPERVISEDCONTACT: joi.object({
        unsupervisedContactGender: joi.string().required(),
        unsupervisedContactAge: joi.string().required(),
        unsupervisedContactSocial: joi.string().required()
    }),
    NOCHILDRENSAREA: joi.object({
        notInSightOf: joi.string().required()
    }),
    NOWORKWITHAGE: joi.object({
        noWorkWithAge: joi.string().required()
    }),
    NOCOMMUNICATEVICTIM: joi.object({
        victimFamilyMembers: joi.string().required(),
        socialServicesDept: joi.string().required()
    }),
    COMPLYREQUIREMENTS: joi.object({
        courseOrCentre: joi.string().required()
    }),
    ATTENDALL: joi.object({
        appointmentName: joi.string().required(),
        appointmentProfession: joi.string().required()
    }),
    HOMEVISITS: joi.object({
        mentalHealthName: joi.string().required()
    }),
    REMAINADDRESS: joi.object({
        curfewAddress: joi.string().required(),
        curfewFrom: joi.string().required(),
        curfewTo: joi.string().required()
    }),
    CONFINEADDRESS: joi.object({
        confinedTo: joi.string().required(),
        confinedFrom: joi.string().required(),
        confinedReviewFrequency: joi.string().required()
    }),
    REPORTTO: joi.object({
        reportingAddress: joi.string().required(),
        reportingTime: joi.string().allow('').optional(),
        reportingDaily: joi.when('reportingTime', {
            is: '',
            then: joi.string().required(),
            otherwise: joi.valid(['']).optional()
        }),
        reportingFrequency: joi.string().required()
    }),
    VEHICLEDETAILS: joi.object({
        vehicleDetails: joi.string().required()
    }),
    EXCLUSIONADDRESS: joi.object({
        noEnterPlace: joi.string().required()
    }),
    EXCLUSIONAREA: joi.object({
        exclusionArea: joi.string().required()
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
        appointmentAddress: joi.string().required()
    }),
    ATTENDSAMPLE: joi.object({
        attendSampleDetailsName: joi.string().required(),
        attendSampleDetailsAddress: joi.string().required()
    })
});
