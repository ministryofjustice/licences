const baseJoi = require('joi');
const dateExtend = require('joi-date-extensions');
const joi = baseJoi.extend(dateExtend);

const optionalString = joi.string().allow('').optional();
const requiredString = joi.string().required();
const selection = joi.array().min(1).required();
const requiredYesNo = joi.valid(['Yes', 'No']).required();
const requiredDate = joi.date().format('YYYY-MM-DD').required();
const requiredIf = (field, answer, typeRequired = requiredString) => {
    return joi.when(field, {is: answer, then: typeRequired, otherwise: joi.valid(['']).optional()});
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
    reason: requiredIf('decision', 'Yes')
});

const optOut = joi.object().keys({
    decision: requiredYesNo,
    reason: requiredIf('decision', 'Yes')
});

const addressProposed = joi.object().keys({
    decision: requiredYesNo
});

const bassReferral = joi.object().keys({
    decision: requiredYesNo,
    proposedTown: requiredIf('decision', 'Yes'),
    proposedCounty: requiredIf('decision', 'Yes')
});

const curfewAddress = joi.object().keys({
    addressLine1: requiredString,
    addressLine2: optionalString,
    addressTown: requiredString,
    postCode: requiredString,
    telephone: requiredString,
    occupier: joi.object().required().keys({
        name: requiredString,
        age: optionalString,
        relationship: requiredString
    }),
    residents: joi.array().items(joi.object().keys({
        name: requiredString,
        age: optionalString,
        relationship: requiredString
    })),
    cautionedAgainstResident: requiredYesNo
});

// PROCESSING_RO
const curfewAddressReview = joi.object().keys({
    consent: requiredYesNo,
    electricity: requiredIf('consent', 'Yes'),
    homeVisitConducted: requiredIf('electricity', 'Yes')
});

const addressSafety = joi.object().keys({
    deemedSafe: requiredYesNo,
    unsafeReason: requiredIf('deemedSafe', 'No')
});

const curfewHours = joi.object().keys({
    firstNightFrom: requiredString,
    firstNightUntil: requiredString,
    mondayFrom: requiredString,
    mondayUntil: requiredString,
    tuesdayFrom: requiredString,
    tuesdayUntil: requiredString,
    wednesdayFrom: requiredString,
    wednesdayUntil: requiredString,
    thursdayFrom: requiredString,
    thursdayUntil: requiredString,
    fridayFrom: requiredString,
    fridayUntil: requiredString,
    saturdayFrom: requiredString,
    saturdayUntil: requiredString,
    sundayFrom: requiredString,
    sundayUntil: requiredString
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
    postcode: requiredString,
    telephone: requiredString
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
    ATTEND: joi.object({
        appointmentDate: requiredDate,
        appointmentTime: requiredString,
        appointmentAddress: requiredString
    }),
    ATTENDALL: joi.object({
        appointmentName: requiredString
    }),
    HOMEVISITS: joi.object({
        mentalHealthName: requiredString
    }),
    REMAINADDRESS: joi.object({
        curfewAddress: requiredString,
        curfewFrom: requiredString,
        curfewTo: requiredString,
        curfewTagRequired: requiredString
    }),
    CONFINEADDRESS: joi.object({
        confinedTo: requiredString,
        confinedFrom: requiredString,
        confinedReviewFrequency: requiredString
    }),
    REPORTTO: joi.object({
        reportingAddress: requiredString,
        reportingTime: optionalString,
        reportingDaily: requiredIf('reportingTime', ''),
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
    NOTIFYPASSPORT: joi.object({})
});

const seriousOffence = {
    decision: requiredYesNo
};

const onRemand = {
    decision: requiredYesNo
};

const release = {
    decision: requiredYesNo,
    reason: requiredIf('decision', 'No')
};

const schema = {
    eligibility: {excluded, suitability, crdTime},
    proposedAddress: {optOut, addressProposed, bassReferral, curfewAddress},
    curfew: {curfewAddressReview, addressSafety, curfewHours},
    risk: {riskManagement},
    reporting: {reportingInstructions},
    licenceConditions: {standard, additional},
    finalChecks: {seriousOffence, onRemand},
    approval: {release}
};

module.exports = function(licence) {
    return section => {
        if(!licence[section]) {
            return {
                details: [{path: [section], type: 'any.required', message: `${section} is required`}]
            };
        }
        return joi.validate(licence[section], schema[section], {abortEarly: false}).error;
    };
};
