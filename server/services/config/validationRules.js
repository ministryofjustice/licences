const baseJoi = require('joi');
const dateExtend = require('joi-date-extensions');
const postcodeExtend = require('joi-postcode');
const joi = baseJoi.extend(dateExtend).extend(postcodeExtend);

const optionalString = joi.string().allow('').optional();
const forbidden = joi.valid(['']).optional();
const requiredString = joi.string().required();
const requiredPhone = joi.string().regex(/^[0-9+\s]+$/).required();
const optionalAge = joi.number().min(0).max(110).allow('').optional();
const selection = joi.array().min(1).required();
const requiredYesNo = joi.valid(['Yes', 'No']).required();
const requiredDate = joi.date().format('DD/MM/YYYY').min('now').required();
const requiredTime = joi.date().format('HH:mm').required();
const requiredPostcode = joi.postcode().required();
const requiredIf = (field, answer, typeRequired = requiredString, ifNot = optionalString) => {
    return joi.when(field, {is: answer, then: typeRequired, otherwise: ifNot});
};

// ELIGIBILITY
const excluded = joi.object().keys({
    decision: requiredYesNo,
    reason: requiredIf('decision', 'Yes', selection)
});

const suitability = joi.object().keys({
    decision: requiredYesNo,
    reason: requiredIf('decision', 'Yes', selection)
});

const crdTime = joi.object().keys({
    decision: requiredYesNo,
    dmApproval: requiredIf('decision', 'Yes')
});

const exceptionalCircumstances = joi.object().keys({
    decision: requiredYesNo
});

const optOut = joi.object().keys({
    decision: requiredYesNo,
    reason: requiredIf('decision', 'Yes')
});

const addressProposed = joi.object().keys({
    decision: requiredYesNo
});

const bassRequest = joi.object().keys({
    bassRequested: requiredYesNo,
    proposedTown: requiredIf('bassRequested', 'Yes'),
    proposedCounty: requiredIf('bassRequested', 'Yes')
});

const bassAreaCheck = joi.object().keys({
    bassAreaSuitable: requiredYesNo,
    bassAreaReason: requiredIf('bassAreaSuitable', 'No')
});

const bassOffer = joi.object().keys({
    bassAccepted: optionalString,
    bassArea: requiredIf('bassAccepted', 'Yes'),
    addressLine1: requiredIf('bassAccepted', 'Yes'),
    addressLine2: optionalString,
    addressTown: requiredIf('bassAccepted', 'Yes'),
    postCode: requiredIf('bassAccepted', 'Yes', requiredPostcode),
    telephone: optionalString
});

const residentSchema = joi.object({
    name: requiredString,
    age: optionalAge,
    relationship: requiredString
});

const curfewAddress = joi.object().keys({
    addressLine1: requiredString,
    addressLine2: optionalString,
    addressTown: requiredString,
    postCode: requiredPostcode,
    telephone: requiredPhone,
    occupier: joi.object().keys({
        name: requiredString,
        relationship: requiredString,
        isOffender: optionalString
    }),
    cautionedAgainstResident: requiredYesNo,
    consent: requiredIf('occupier.isOffender', joi.not('Yes'), requiredYesNo),
    electricity: joi.when('occupier.isOffender', {
        is: joi.not('Yes'),
        then: requiredIf('consent', 'Yes'),
        otherwise: requiredYesNo
    }),
    homeVisitConducted: joi.when('occupier.isOffender', {
        is: joi.not('Yes'),
        then: requiredIf('consent', 'Yes'),
        otherwise: requiredYesNo
    }),
    deemedSafe: joi.when('occupier.isOffender', {
        is: joi.not('Yes'),
        then: requiredIf('consent', 'Yes', requiredIf('electricity', 'Yes', requiredIf('homeVisitConducted', 'Yes'))),
        otherwise: requiredIf('electricity', 'Yes', requiredIf('homeVisitConducted', 'Yes'))
    }),
    unsafeReason: joi.when('occupier.isOffender', {
        is: joi.not('Yes'),
        then: requiredIf('consent', 'Yes', requiredIf('electricity', 'Yes', requiredIf('homeVisitConducted', 'Yes',
            requiredIf('deemedSafe', 'No')))),
        otherwise: requiredIf('electricity', 'Yes', requiredIf('homeVisitConducted', 'Yes',
            requiredIf('deemedSafe', 'No')))
    })

}).required();

// PROCESSING_RO

const curfewHours = joi.object().keys({
    mondayFrom: requiredTime,
    mondayUntil: requiredTime,
    tuesdayFrom: requiredTime,
    tuesdayUntil: requiredTime,
    wednesdayFrom: requiredTime,
    wednesdayUntil: requiredTime,
    thursdayFrom: requiredTime,
    thursdayUntil: requiredTime,
    fridayFrom: requiredTime,
    fridayUntil: requiredTime,
    saturdayFrom: requiredTime,
    saturdayUntil: requiredTime,
    sundayFrom: requiredTime,
    sundayUntil: requiredTime
});

const riskManagement = joi.object().keys({
    planningActions: requiredYesNo,
    planningActionsDetails: requiredIf('planningActions', 'Yes'),
    awaitingInformation: requiredYesNo,
    awaitingInformationDetails: requiredIf('awaitingInformation', 'Yes'),
    victimLiaison: requiredYesNo,
    victimLiaisonDetails: requiredIf('victimLiaison', 'Yes')
});

const reportingInstructions = joi.object({
    name: requiredString,
    buildingAndStreet1: requiredString,
    buildingAndStreet2: optionalString,
    townOrCity: requiredString,
    postcode: requiredPostcode,
    telephone: requiredPhone
});

const reportingDate = joi.object({
    reportingDate: requiredDate,
    reportingTime: requiredTime
});

const firstNight = joi.object({
    firstNightFrom: requiredTime,
    firstNightUntil: requiredTime
});

const standard = joi.object({
    additionalConditionsRequired: requiredString
});

const additional = joi.object({
    NOCONTACTASSOCIATE: joi.object({
        groupsOrOrganisation: requiredString
    }),
    INTIMATERELATIONSHIP: joi.object({
        intimateGender: requiredString
    }),
    NOCONTACTNAMED: joi.object({
        noContactOffenders: requiredString
    }),
    NORESIDE: joi.object({
        notResideWithGender: requiredString,
        notResideWithAge: requiredString
    }),
    NOUNSUPERVISEDCONTACT: joi.object({
        unsupervisedContactGender: requiredString,
        unsupervisedContactAge: requiredString,
        unsupervisedContactSocial: requiredString
    }),
    NOCHILDRENSAREA: joi.object({
        notInSightOf: requiredString
    }),
    NOWORKWITHAGE: joi.object({
        noWorkWithAge: requiredString
    }),
    NOCOMMUNICATEVICTIM: joi.object({
        victimFamilyMembers: requiredString,
        socialServicesDept: requiredString
    }),
    COMPLYREQUIREMENTS: joi.object({
        courseOrCentre: requiredString
    }),
    ATTENDALL: joi.object({
        appointmentName: requiredString,
        appointmentProfession: requiredString
    }),
    HOMEVISITS: joi.object({
        mentalHealthName: requiredString
    }),
    REMAINADDRESS: joi.object({
        curfewAddress: requiredString,
        curfewFrom: requiredString,
        curfewTo: requiredString
    }),
    CONFINEADDRESS: joi.object({
        confinedTo: requiredString,
        confinedFrom: requiredString,
        confinedReviewFrequency: requiredString
    }),
    REPORTTO: joi.object({
        reportingAddress: requiredString,
        reportingTime: optionalString,
        reportingDaily: requiredIf('reportingTime', '', requiredString, forbidden),
        reportingFrequency: requiredString
    }),
    VEHICLEDETAILS: joi.object({
        vehicleDetails: requiredString
    }),
    EXCLUSIONADDRESS: joi.object({
        noEnterPlace: requiredString
    }),
    EXCLUSIONAREA: joi.object({
        exclusionArea: requiredString
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
        appointmentDate: requiredDate,
        appointmentTime: requiredString,
        appointmentAddress: requiredString
    }),
    ATTENDSAMPLE: joi.object({
        attendSampleDetailsName: requiredString,
        attendSampleDetailsAddress: requiredString
    })
});

const bespoke = joi.array().items(joi.object({
    text: requiredString,
    approved: requiredYesNo
}));

const seriousOffence = {
    decision: requiredYesNo
};

const onRemand = {
    decision: requiredYesNo
};

const confiscationOrder = {
    decision: requiredYesNo,
    confiscationUnitConsulted: requiredIf('decision', 'Yes', requiredYesNo),
    comments: requiredIf('confiscationUnitConsulted', 'Yes')
};

const release = {
    decision: requiredYesNo,
    reason: requiredIf('decision', 'No'),
    notedComments: requiredIf('decision', 'Yes')
};

const taggingCompany = {
    telephone: requiredPhone
};

const schema = {
    eligibility: {excluded, suitability, crdTime, exceptionalCircumstances},
    proposedAddress: {optOut, addressProposed, curfewAddress},
    bassReferral: {bassRequest, bassAreaCheck, bassOffer},
    curfew: {curfewHours, firstNight},
    risk: {riskManagement},
    reporting: {reportingInstructions, reportingDate},
    licenceConditions: {standard, additional, bespoke},
    finalChecks: {seriousOffence, onRemand, confiscationOrder},
    approval: {release},
    monitoring: {taggingCompany}
};

module.exports = {
    validate: (licence, section, form) => {
        return joi.validate(
            licence[section][form],
            schema[section][form],
            {stripUnknown: true, abortEarly: false}
        ).error;
    },

    validateResident: resident => {
        return joi.validate(
            resident,
            residentSchema,
            {stripUnknown: true, abortEarly: false}
        ).error;
    }
};
