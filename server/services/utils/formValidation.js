const baseJoi = require('joi');
const dateExtend = require('joi-date-extensions');
const postcodeExtend = require('joi-postcode');

const {getFieldName, getFieldDetail, getIn, isEmpty} = require('../../utils/functionalHelpers');

const joi = baseJoi.extend(dateExtend).extend(postcodeExtend);

const fieldOptions = {
    requiredString: joi.string().required(),
    optionalString: joi.string().allow('').optional(),
    requiredYesNo: joi.valid(['Yes', 'No']).required(),
    selection: joi.array().min(1).required(),
    requiredTime: joi.date().format('HH:mm').required(),
    requiredDate: joi.date().format('DD/MM/YYYY').min('now').required(),
    requiredPostcode: joi.postcode().required(),
    requiredSelectionIf: (requiredItem = 'decision', requiredAnswer = 'Yes') => joi.when(requiredItem, {
        is: requiredAnswer,
        then: joi.array().min(1).required()
    }),
    requiredYesNoIf: (requiredItem = 'decision', requiredAnswer = 'Yes') => joi.when(requiredItem, {
        is: requiredAnswer,
        then: joi.valid(['Yes', 'No']).required()
    }),
    requiredStringIf: (requiredItem = 'decision', requiredAnswer = 'Yes') => joi.when(requiredItem, {
        is: requiredAnswer,
        then: joi.string().required()
    }),
    optionalStringIf: (requiredItem = 'decision', requiredAnswer = 'Yes') => joi.when(requiredItem, {
        is: requiredAnswer,
        then: joi.string().allow('').optional()
    }),
    requiredPostcodeIf: (requiredItem = 'decision', requiredAnswer = 'Yes') => joi.when(requiredItem, {
        is: requiredAnswer,
        then: joi.postcode().required(),
        otherwise: joi.any().optional()
    }),
    requiredTelephoneIf: (requiredItem = 'decision', requiredAnswer = 'Yes') => joi.when(requiredItem, {
        is: requiredAnswer,
        then: joi.string().regex(/^[0-9+\s]+$/).required(),
        otherwise: joi.any().optional()
    })
};

module.exports = {
    validate(formResponse, pageConfig, bespokeConditions = {}) {
        const formSchema = createSchema(pageConfig, bespokeConditions);
        const joiErrors = joi.validate(formResponse, formSchema, {stripUnknown: true, abortEarly: false});

        if (!(joiErrors.error)) {
            return {};
        }

        // TODO handle nested fields
        return joiErrors.error.details.reduce((errors, error) => {
            // joi returns map to error in path field
            const fieldConfig = pageConfig.fields.find(field => getFieldName(field) === error.path[0]);
            const errorMessage = getIn(fieldConfig, [...error.path, 'validationMessage']) || error.message;

            return {...errors, [error.path[0]]: errorMessage};
        }, {});
    }
};

function createSchema(pageConfig, bespokeData) {
    const formSchema = pageConfig.fields.reduce((schema, field) => {
        const fieldName = getFieldName(field);

        const bespokeRequirements = getFieldDetail(['conditionallyActive'], field);
        const conditionFulfilled = isEmpty(bespokeRequirements) ? true : isFulfilled(bespokeRequirements, bespokeData);
        if (!conditionFulfilled) {
            return schema;
        }

        const fieldConfigResponseType = getFieldDetail(['responseType'], field);
        const [responseType, ...arguments] = fieldConfigResponseType.split('_');

        const joiFieldItem = fieldOptions[responseType];
        const joiFieldSchema = typeof joiFieldItem === 'function' ? joiFieldItem(...arguments) : joiFieldItem;

        return {
            ...schema,
            [fieldName]: joiFieldSchema
        };
    }, {});

    return joi.object().keys(formSchema);
}

function isFulfilled(requirement, data) {
    const requirementName = getFieldName(requirement);
    const requiredAnswer = requirement[requirementName];

    return data[requirementName] === requiredAnswer;
}
