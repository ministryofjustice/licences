const joi = require('joi');

const optionalString = joi.string().allow('').optional();
const requiredString = joi.string().required();
const requiredYesNo = joi.valid(['Yes', 'No']).required();
const requiredIf = (field, answer) => {
    return joi.when(field, {is: answer, then: joi.string().required(), otherwise: joi.string().forbidden()});
};

const excluded = joi.object().keys({
    decision: requiredYesNo,
    reason: requiredIf('decision', 'Yes')
});

const suitability = joi.object().keys({
    decision: requiredYesNo,
    reason: requiredIf('decision', 'Yes')
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
    addresses: joi.array().items(joi.object().keys({
        addressLine1: requiredString,
        addressLine2: optionalString,
        addressTown: requiredString,
        postCode: requiredString,
        telephone: requiredString,
        occupier: joi.object().required().keys({
            name: requiredString,
            age: optionalString,
            relation: requiredString
        }),
        residents: joi.array().items(joi.object().keys({
            name: requiredString,
            age: optionalString,
            relation: requiredString
        })),
        cautionedAgainstResident: requiredYesNo
    }))
});

const schema = {
    eligibility: {excluded, suitability, crdTime},
    proposedAddress: {optOut, addressProposed, bassReferral, curfewAddress}
};

module.exports = function(licence) {
    return section => joi.validate(licence[section], schema[section], {abortEarly: false}).error;
};
