const baseJoi = require('joi');
const dateExtend = require('joi-date-extensions');
const postcodeExtend = require('joi-postcode');
const joi = baseJoi.extend(dateExtend).extend(postcodeExtend);
const {all, pipe, getIn, isEmpty, merge} = require('../../utils/functionalHelpers');
const validationMessages = require('../config/validationMessages');

const {sectionContaining} = require('../config/formsAndSections');

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

function getMessage(errorType, errorMessage, errorPath) {

    if (errorType === 'date.format') {
        if (errorMessage.includes('[HH:mm]')) {
            return 'Enter a valid time';
        }
        return 'Enter a valid date';
    }

    if (errorType === 'number.base') {
        return 'Enter a valid number';
    }

    if (errorType === 'string.regex.base') {
        if (errorMessage.includes('telephone')) {
            return 'Enter a valid phone number';
        }
        return 'Enter a valid postcode';
    }

    if (errorType === 'number.min') {
        return 'Enter a valid age';
    }

    if (errorType === 'number.max') {
        return 'Enter a valid age';
    }

    if (errorType === 'date.min') {
        return 'Enter a date that is not in the past';
    }

    const path = errorPath
        .filter(pathItem => !Number.isInteger(pathItem))
        .join('_');

    if (validationMessages[path]) {
        return validationMessages[path];
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

const bassReferral = joi.object().keys({
    decision: requiredYesNo,
    proposedTown: requiredIf('decision', 'Yes'),
    proposedCounty: requiredIf('decision', 'Yes')
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
        relationship: requiredString
    }),
    cautionedAgainstResident: requiredYesNo,
    consent: requiredYesNo,
    electricity: requiredIf('consent', 'Yes'),
    homeVisitConducted:
        requiredIf('consent', 'Yes',
            requiredIf('electricity', 'Yes')),
    deemedSafe:
        requiredIf('consent', 'Yes',
            requiredIf('electricity', 'Yes',
                requiredIf('homeVisitConducted', 'Yes'))),
    unsafeReason:
        requiredIf('consent', 'Yes',
            requiredIf('electricity', 'Yes',
                requiredIf('homeVisitConducted', 'Yes',
                    requiredIf('deemedSafe', 'No'))))
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
    proposedAddress: {optOut, addressProposed, bassReferral, curfewAddress},
    curfew: {curfewHours, firstNight},
    risk: {riskManagement},
    reporting: {reportingInstructions, reportingDate},
    licenceConditions: {standard, additional, bespoke},
    finalChecks: {seriousOffence, onRemand, confiscationOrder},
    approval: {release},
    monitoring: {taggingCompany}
};

module.exports = function(licence) {
    return form => {
        const section = sectionContaining[form];

        if (!licence[section]) {
            return [{
                path: {[section]: 'Not answered'}
            }];
        }

        const errors = joi.validate(
            licence[section][form],
            schema[section][form],
            {stripUnknown: true, abortEarly: false}
        ).error;

        const allErrors = form === 'curfewAddress' ? addResidentErrors(errors, licence[section]) : errors;

        if (!allErrors) {
            return [];
        }

        const errorsArray = getArrayOfPathsAndMessages(section, form, allErrors);

        return updateWithSpecialCases(errorsArray);
    };
};

function getArrayOfPathsAndMessages(section, form, allErrors) {

    return allErrors.details.map(error => {
        // error object may have multiple error objects e.g. list of residents errors
        if (Array.isArray(error)) {
            return error.map(createPathWithErrorMessage);
        }

        return createPathWithErrorMessage(error);
    });

    function createPathWithErrorMessage(errorItem) {
        return {
            path: {
                [section]: {
                    [form]: errorItem.path.reduceRight((object, key) => {
                        return {[key]: object};
                    }, getMessage(errorItem.type, errorItem.message, [form, ...errorItem.path]))
                }
            }
        };
    }
}

function addResidentErrors(errorsForSection, licenceSection) {
    // resident errors handled separately as can't successfully get errors from list of objects using standard joi
    const residents = getIn(licenceSection, ['curfewAddress', 'residents']);
    if (!residents) {
        return errorsForSection;
    }

    return residents.reduce((allErrors, resident, index) => {
        const residentErrors = joi.validate(
            resident,
            residentSchema,
            {stripUnknown: true, abortEarly: false}
        ).error;

        if (!residentErrors) {
            return allErrors;
        }

        // merge the details of the resident errors into same object
        const residentDetails = residentErrors.details.map(detail => {
            return merge(detail, {path: ['residents', index, ...detail.path]});
        });

        return {...allErrors, details: [...allErrors.details, residentDetails]};

    }, errorsForSection || {details: []});

}

const specialCases = [
    {
        path: ['proposedAddress', 'curfewAddress', 'occupier', 'name'],
        method: removeErrorsIfAllMatch([
            {
                path: ['path', 'proposedAddress', 'curfewAddress', 'occupier', 'name'],
                value: validationMessages.curfewAddress_occupier_name
            },
            {
                path: ['path', 'proposedAddress', 'curfewAddress', 'occupier', 'relationship'],
                value: validationMessages.curfewAddress_occupier_relationship
            }

        ])
    }
];

function updateWithSpecialCases(errorObject) {

    const specialCaseIsInErrorObject = specialCase => errorObject.find(error => getIn(error.path, specialCase.path));
    const specialCaseMethod = specialCase => specialCase.method;

    const methodsToRunOnObject = specialCases
        .filter(specialCaseIsInErrorObject)
        .map(specialCaseMethod);

    if (isEmpty(methodsToRunOnObject)) {
        return errorObject;
    }

    return pipe(...methodsToRunOnObject)(errorObject);
}

function removeErrorsIfAllMatch(pathsToTest) {
    return errors => {
        const errorsListContainsObject = pathsToTest => {
            return errors.find(error => getIn(error, pathsToTest.path) === pathsToTest.value);
        };

        if (all(errorsListContainsObject, pathsToTest)) {
            return errors.filter(error => !pathsToTest.find(path => getIn(error, path.path)));
        }

        return errors;
    };
}
