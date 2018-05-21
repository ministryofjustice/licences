const baseJoi = require('joi');
const dateExtend = require('joi-date-extensions');
const postcodeExtend = require('joi-postcode');
const joi = baseJoi.extend(dateExtend).extend(postcodeExtend);

const optionalString = joi.string().allow('').optional();
const forbidden = joi.valid(['']).optional();
const requiredString = joi.string().required();
const requiredPhone = joi.string().regex(/^[0-9\+\s]+$/).required();
const optionalAge = joi.number().min(0).max(110).allow('').optional();
const selection = joi.array().min(1).required();
const requiredYesNo = joi.valid(['Yes', 'No']).required();
const requiredDate = joi.date().format('DD/MM/YYYY').min('now').required();
const requiredTime = joi.date().format('HH:mm').required();
const requiredPostcode = joi.postcode().required();
const requiredIf = (field, answer, typeRequired = requiredString, ifNot = optionalString) => {
    return joi.when(field, {is: answer, then: typeRequired, otherwise: ifNot});
};

function getMessage(errorType, errorMessage) {
    if (errorType === 'date.format') {
        if(errorMessage.includes('[HH:mm]')) {
            return 'Invalid time';
        }
        return 'Invalid or incorrectly formatted date';
    }

    if (errorType === 'string.alphanum') {
        return 'Invalid entry - letters and numbers only';
    }

    if (errorType === 'number.base') {
        return 'Invalid entry - number required';
    }

    if (errorType === 'string.regex.base') {
        if(errorMessage.includes('telephone')) {
            return 'Invalid entry - number required';
        }
        return 'Invalid postcode';
    }

    if (errorType === 'number.min') {
        return 'Invalid age - must be 0 or above';
    }

    if (errorType === 'number.max') {
        return 'Invalid age - must be 110 or below';
    }

    if (errorType === 'date.min') {
        return 'Invalid date - must not be in the past';
    }

    return 'Not answered';
}

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
    decision: requiredYesNo
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
    postCode: requiredPostcode,
    telephone: requiredPhone,
    occupier: joi.object().required().keys({
        name: requiredString,
        age: optionalAge,
        relationship: requiredString
    }),
    residents: joi.array().items(joi.object().keys({
        name: requiredString,
        age: optionalAge,
        relationship: requiredString
    })),
    cautionedAgainstResident: requiredYesNo,
    consent: requiredYesNo,
    electricity: requiredIf('consent', 'Yes'),
    homeVisitConducted: requiredIf('electricity', 'Yes'),
    deemedSafe: requiredString,
    unsafeReason: requiredIf('deemedSafe', 'No')
}).required();

// PROCESSING_RO

const curfewHours = joi.object().keys({
    firstNightFrom: requiredTime,
    firstNightUntil: requiredTime,
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
    NOTIFYPASSPORT: joi.object({})
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

const release = {
    decision: requiredYesNo,
    reason: requiredIf('decision', 'No')
};

const schema = {
    eligibility: {excluded, suitability, crdTime},
    proposedAddress: {optOut, addressProposed, bassReferral, curfewAddress},
    curfew: {curfewHours},
    risk: {riskManagement},
    reporting: {reportingInstructions},
    licenceConditions: {standard, additional, bespoke},
    finalChecks: {seriousOffence, onRemand},
    approval: {release}
};

module.exports = function(licence) {
    return section => {
        if(!licence[section]) {
            return [{
                path: {[section]: 'Not answered'}
            }];
        }

        const errorsForSection = joi.validate(licence[section], schema[section], {abortEarly: false}).error;

        if(!errorsForSection) {
            return [];
        }

        return errorsForSection.details.map(error => {
            return {
                path: {
                    [section]: error.path.reduceRight((object, key) => {
                        return {[key]: object};
                    }, getMessage(error.type, error.message))
                }
            };
        });
    };
};
