const baseJoi = require('joi');
const dateExtend = require('joi-date-extensions');
const postcodeExtend = require('joi-postcode');

const {getFieldName, getFieldDetail, getIn} = require('../../utils/functionalHelpers');

const joi = baseJoi.extend(dateExtend).extend(postcodeExtend);

const fieldOptions = {
    requiredString: joi.string().required(),
    optionalString: joi.string().allow('').optional(),
    requiredYesNo: joi.valid(['Yes', 'No']).required(),
    selection: joi.array().min(1).required(),
    requiredSelectionIfYes: joi.when('decision', {
        is: 'Yes',
        then: joi.array().min(1).required()
    }),
    requiredYesNoIfYes: joi.when('decision', {
        is: 'Yes',
        then: joi.valid(['Yes', 'No']).required()
    })

};

module.exports = {
    validate(formResponse, pageConfig) {
        const formSchema = createSchema(pageConfig);
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

function createSchema(pageConfig) {
    const formSchema = pageConfig.fields.reduce((schema, field) => {
        const fieldName = getFieldName(field);
        const requiredResponseType = getFieldDetail(['responseType'], field);

        return {
            ...schema,
            [fieldName]: fieldOptions[requiredResponseType]
        };
    }, {});

    return joi.object().keys(formSchema);
}
