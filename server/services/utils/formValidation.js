const baseJoi = require('joi')
const dateExtend = require('joi-date-extensions')
const postcodeExtend = require('joi-postcode')
const moment = require('moment')

const today = moment().startOf('day').format('MM-DD-YYYY')
const {
  curfewAddressSchema,
  addressReviewSchema,
  addressReviewSchemaOffenderIsOccupier,
} = require('./bespokeAddressSchema')
const additionalConditionsSchema = require('./bespokeConditionsSchema')

const {
  getFieldName,
  getFieldDetail,
  getIn,
  isEmpty,
  mergeWithRight,
  lastItem,
} = require('../../utils/functionalHelpers')

const proposedAddressConfig = require('../../routes/config/proposedAddress')
const riskConfig = require('../../routes/config/risk')
const victimConfig = require('../../routes/config/victim')
const curfewConfig = require('../../routes/config/curfew')
const reportingConfig = require('../../routes/config/reporting')
const bassConfig = require('../../routes/config/bassReferral')
const conditionsConfig = require('../../routes/config/licenceConditions')

const joi = baseJoi.extend(dateExtend).extend(postcodeExtend)

const fieldOptions = {
  requiredString: joi.string().required(),
  optionalString: joi.string().allow('').optional(),
  requiredYesNo: joi.valid(['Yes', 'No']).required(),
  optionalYesNo: joi.valid(['Yes', 'No']).optional(),
  selection: joi.alternatives().try(joi.string(), joi.array().min(1)).required(),
  requiredTime: joi.date().format('HH:mm').required(),
  optionalTime: joi.date().format('HH:mm').optional(),
  requiredDate: joi.date().format('DD/MM/YYYY').min(today).required(),
  optionalList: joi.array().optional(),
  requiredPostcode: joi.postcode().required(),
  optionalPostcode: joi.postcode().allow('').optional(),
  requiredPhone: joi
    .string()
    .regex(/^[0-9+\s]+$/)
    .required(),
  optionalPhone: joi
    .string()
    .regex(/^[0-9+\s]+$/)
    .allow('')
    .optional(),
  optionalAge: joi.number().min(0).max(110).allow('').optional(),
  requiredSelectionIf: (requiredItem = 'decision', requiredAnswer = 'Yes') =>
    joi.when(requiredItem, {
      is: requiredAnswer,
      then: joi.alternatives().try(joi.string(), joi.array().min(1)).required(),
      otherwise: joi.any().optional(),
    }),
  requiredYesNoIf: (requiredItem = 'decision', requiredAnswer = 'Yes') =>
    joi.when(requiredItem, {
      is: requiredAnswer,
      then: joi.valid(['Yes', 'No']).required(),
      otherwise: joi.any().optional(),
    }),
  requiredStringIf: (requiredItem = 'decision', requiredAnswer = 'Yes') =>
    joi.when(requiredItem, {
      is: requiredAnswer,
      then: joi.string().required(),
      otherwise: joi.any().optional(),
    }),
  optionalStringIf: (requiredItem = 'decision', requiredAnswer = 'Yes') =>
    joi.when(requiredItem, {
      is: requiredAnswer,
      then: joi.string().allow('').optional(),
      otherwise: joi.any().optional(),
    }),
  requiredPostcodeIf: (requiredItem = 'decision', requiredAnswer = 'Yes') =>
    joi.when(requiredItem, {
      is: requiredAnswer,
      then: joi.postcode().required(),
      otherwise: joi.any().optional(),
    }),
  requiredTimeIf: (requiredItem = 'decision', requiredAnswer = 'Yes') =>
    joi.when(requiredItem, {
      is: requiredAnswer,
      then: joi.date().format('HH:mm').required(),
      otherwise: joi.any().optional(),
    }),
}

const defaultErrorMessages = {
  requiredPhone: (errorType) =>
    errorType === 'string.regex.base'
      ? 'Enter a telephone number, like 01632 960 001 or 07700 900 982'
      : 'Enter a telephone number',

  requiredDate: (errorType) => {
    if (errorType === 'date.min') return 'The reporting date must be today or in the future'
    if (errorType === 'date.format') return 'Enter a valid date'
    return 'Enter a date'
  },

  requiredTime: (errorType) => (errorType === 'date.format' ? 'Enter a valid time' : 'Enter a time'),
}

const validationProcedures = {
  standard: {
    getSchema: createSchemaFromConfig,
    getErrorMessage: (fieldConfig, errorPath) => getIn(fieldConfig, [...errorPath, 'validationMessage']),
  },
  curfewAddress: {
    getSchema: () => curfewAddressSchema,
    getErrorMessage: (fieldConfig, errorPath) => {
      const fieldName = getFieldName(fieldConfig)
      const fieldsWithInnerContents = ['residents', 'occupier']
      if (!fieldsWithInnerContents.includes(fieldName)) {
        return getIn(fieldConfig, [...errorPath, 'validationMessage'])
      }

      const innerFieldName = lastItem(errorPath)
      const innerFieldConfig = fieldConfig[fieldName].contains.find((item) => getFieldName(item) === innerFieldName)
      return innerFieldConfig[innerFieldName].validationMessage
    },
  },
  curfewAddressReview: {
    getSchema: (pageConfig, { offenderIsMainOccupier }) => {
      if (offenderIsMainOccupier) {
        return addressReviewSchemaOffenderIsOccupier
      }
      return addressReviewSchema
    },
    getErrorMessage: (fieldConfig, errorPath) => getIn(fieldConfig, [...errorPath, 'validationMessage']),
  },
  additional: {
    getSchema: () => additionalConditionsSchema,
    getErrorMessage: (fieldConfig, errorPath) => {
      const fieldName = getFieldName(fieldConfig)
      const innerFieldName = lastItem(errorPath)
      const innerFieldConfig = fieldConfig[fieldName].contains.find((item) => getFieldName(item) === innerFieldName)
      return innerFieldConfig[innerFieldName].validationMessage
    },
  },
}

module.exports = {
  validate,
  validateGroup,
}

function validate({ formResponse, pageConfig, formType = 'standard', bespokeConditions = {} }) {
  const procedure = validationProcedures[formType] || validationProcedures.standard
  const fieldsConfig = getIn(pageConfig, ['fields'])
  const formSchema = procedure.getSchema(pageConfig, bespokeConditions)

  const joiErrors = joi.validate(formResponse, formSchema, { stripUnknown: false, abortEarly: false })
  if (!joiErrors.error) {
    return {}
  }

  return joiErrors.error.details.reduce((errors, error) => {
    // joi returns map to error in path field
    const fieldConfig = fieldsConfig.find((field) => getFieldName(field) === error.path[0])
    const errorMessage = getErrorMessage(fieldConfig, error, procedure.getErrorMessage)

    // empty telephone regex test will fail for multiple reasons, don't want to overwrite the first
    if (getIn(errors, error.path)) {
      return errors
    }

    const errorObject = error.path.reduceRight((errorObj, key) => ({ [key]: errorObj }), errorMessage)
    return mergeWithRight(errors, errorObject)
  }, {})
}

function getErrorMessage(fieldConfig, error, errorMethod) {
  if (error.type === 'date.min') {
    return 'The reporting date must be today or in the future'
  }

  const defaultForType = (config, joiError) => {
    const fieldConfigResponseType = getFieldDetail(['responseType'], config)
    return defaultErrorMessages[fieldConfigResponseType] && defaultErrorMessages[fieldConfigResponseType](joiError.type)
  }

  return errorMethod(fieldConfig, error.path) || defaultForType(fieldConfig, error) || error.message
}

function validateGroup({ licence, group, bespokeConditions }) {
  const groups = {
    ELIGIBILITY: [
      {
        formResponse: getIn(licence, ['proposedAddress', 'curfewAddress']),
        formType: 'curfewAddress',
        pageConfig: proposedAddressConfig.curfewAddress,
        section: 'proposedAddress',
        missingMessage: 'Please provide a curfew address',
      },
    ],
    PROCESSING_RO: [
      {
        formResponse: getIn(licence, ['curfew', 'curfewAddressReview']),
        formType: 'curfewAddressReview',
        pageConfig: curfewConfig.curfewAddressReview,
        section: 'curfew',
        missingMessage: 'Enter the curfew address review details',
      },
      {
        formResponse: getIn(licence, ['licenceConditions', 'standard']),
        formType: 'standard',
        pageConfig: conditionsConfig.standard,
        section: 'licenceConditions',
        missingMessage: 'standard conditions error message',
      },
      {
        formResponse: getIn(licence, ['licenceConditions', 'additional']),
        conditionallyActive:
          getIn(licence, ['licenceConditions', 'standard', 'additionalConditionsRequired']) === 'Yes',
        formType: 'additional',
        pageConfig: conditionsConfig.additional,
        section: 'licenceConditions',
        missingMessage: 'Enter one or more additional conditions',
      },
      {
        formResponse: getIn(licence, ['risk', 'riskManagement']),
        formType: 'riskManagement',
        pageConfig: riskConfig.riskManagement,
        section: 'risk',
        missingMessage: 'Enter the risk management details',
      },
      {
        formResponse: getIn(licence, ['victim', 'victimLiaison']),
        formType: 'victimLiaison',
        pageConfig: victimConfig.victimLiaison,
        section: 'victim',
        missingMessage: 'Enter the victim liaison details',
      },
      {
        formResponse: getIn(licence, ['curfew', 'curfewHours']),
        formType: 'curfewHours',
        pageConfig: curfewConfig.curfewHours,
        section: 'curfew',
        missingMessage: 'Enter the proposed curfew hours',
      },
      {
        formResponse: getIn(licence, ['reporting', 'reportingInstructions']),
        formType: 'reportingInstructions',
        pageConfig: reportingConfig.reportingInstructions,
        section: 'reporting',
        missingMessage: 'Enter the reporting instructions',
      },
    ],
    PROCESSING_RO_APPROVED_PREMISES: [
      approvedAddressValidationConfig(licence),
      {
        formResponse: getIn(licence, ['licenceConditions', 'standard']),
        formType: 'standard',
        pageConfig: conditionsConfig.standard,
        section: 'licenceConditions',
        missingMessage: 'standard conditions error message',
      },
      {
        formResponse: getIn(licence, ['licenceConditions', 'additional']),
        conditionallyActive:
          getIn(licence, ['licenceConditions', 'standard', 'additionalConditionsRequired']) === 'Yes',
        formType: 'additional',
        pageConfig: conditionsConfig.additional,
        section: 'licenceConditions',
        missingMessage: 'Enter one or more additional conditions',
      },
      {
        formResponse: getIn(licence, ['curfew', 'curfewHours']),
        formType: 'curfewHours',
        pageConfig: curfewConfig.curfewHours,
        section: 'curfew',
        missingMessage: 'Enter the proposed curfew hours',
      },
      {
        formResponse: getIn(licence, ['reporting', 'reportingInstructions']),
        formType: 'reportingInstructions',
        pageConfig: reportingConfig.reportingInstructions,
        section: 'reporting',
        missingMessage: 'Enter the reporting instructions',
      },
    ],
    PROCESSING_RO_ADDRESS_REVIEW_REJECTED: [
      {
        formResponse: getIn(licence, ['curfew', 'curfewAddressReview']),
        formType: 'curfewAddressReview',
        pageConfig: curfewConfig.curfewAddressReview,
        section: 'curfew',
        missingMessage: 'Enter the curfew address review details',
      },
    ],
    PROCESSING_RO_RISK_REJECTED: [
      {
        formResponse: getIn(licence, ['curfew', 'curfewAddressReview']),
        formType: 'curfewAddressReview',
        pageConfig: curfewConfig.curfewAddressReview,
        section: 'curfew',
        missingMessage: 'Enter the curfew address review details',
      },
      {
        formResponse: getIn(licence, ['risk', 'riskManagement']),
        formType: 'riskManagement',
        pageConfig: riskConfig.riskManagement,
        section: 'risk',
        missingMessage: 'Enter the risk management details',
      },
    ],
    BASS_AREA: [
      {
        formResponse: getIn(licence, ['bassReferral', 'bassRequest']),
        formType: 'bassRequest',
        pageConfig: bassConfig.bassRequest,
        section: 'bassReferral',
        missingMessage: 'Enter the bass referral details',
      },
      {
        formResponse: getIn(licence, ['bassReferral', 'bassAreaCheck']),
        formType: 'bassAreaCheck',
        pageConfig: bassConfig.bassAreaCheck,
        section: 'bassReferral',
        missingMessage: 'Enter the bass area check details',
      },
    ],
    BASS_REQUEST: [
      {
        formResponse: getIn(licence, ['bassReferral', 'bassRequest']),
        formType: 'bassRequest',
        pageConfig: bassConfig.bassRequest,
        section: 'bassReferral',
        missingMessage: 'Enter the bass referral details',
      },
    ],
    PROCESSING_RO_BASS_REQUESTED: [
      {
        formResponse: getIn(licence, ['bassReferral', 'bassRequest']),
        formType: 'bassRequest',
        pageConfig: bassConfig.bassRequest,
        section: 'bassReferral',
        missingMessage: 'Enter the bass referral details',
      },
      {
        formResponse: getIn(licence, ['bassReferral', 'bassAreaCheck']),
        formType: 'bassReferral',
        pageConfig: bassConfig.bassAreaCheck,
        section: 'bassAreaCheck',
        missingMessage: 'Enter the bass area check details',
      },
      {
        formResponse: getIn(licence, ['licenceConditions', 'standard']),
        formType: 'standard',
        pageConfig: conditionsConfig.standard,
        section: 'licenceConditions',
        missingMessage: 'standard conditions error message',
      },
      {
        formResponse: getIn(licence, ['licenceConditions', 'additional']),
        conditionallyActive:
          getIn(licence, ['licenceConditions', 'standard', 'additionalConditionsRequired']) === 'Yes',
        formType: 'additional',
        pageConfig: conditionsConfig.additional,
        section: 'licenceConditions',
        missingMessage: 'Enter one or more additional conditions',
      },
      {
        formResponse: getIn(licence, ['risk', 'riskManagement']),
        formType: 'riskManagement',
        pageConfig: riskConfig.riskManagement,
        section: 'risk',
        missingMessage: 'Enter the risk management details',
      },
      {
        formResponse: getIn(licence, ['victim', 'victimLiaison']),
        formType: 'victimLiaison',
        pageConfig: victimConfig.victimLiaison,
        section: 'victim',
        missingMessage: 'Enter the victim liaison details',
      },
      {
        formResponse: getIn(licence, ['curfew', 'curfewHours']),
        formType: 'curfewHours',
        pageConfig: curfewConfig.curfewHours,
        section: 'curfew',
        missingMessage: 'Enter the proposed curfew hours',
      },
      {
        formResponse: getIn(licence, ['reporting', 'reportingInstructions']),
        formType: 'reportingInstructions',
        pageConfig: reportingConfig.reportingInstructions,
        section: 'reporting',
        missingMessage: 'Enter the reporting instructions',
      },
    ],
  }

  if (!groups[group]) {
    return {}
  }

  return groups[group].reduce((errorObject, formInfo) => {
    const { section, formType, formResponse, missingMessage, conditionallyActive } = formInfo
    if (conditionallyActive !== undefined && !conditionallyActive) {
      return errorObject
    }

    const formErrors = formResponse ? validate({ ...formInfo, bespokeConditions }) : missingMessage
    if (isEmpty(formErrors)) {
      return errorObject
    }

    return mergeWithRight(errorObject, {
      [section]: {
        [formType]: formErrors,
      },
    })
  }, {})
}

function createSchemaFromConfig(pageConfig, bespokeData) {
  const formSchema = pageConfig.fields.reduce((schema, field) => {
    const fieldName = getFieldName(field)

    const bespokeRequirements = getFieldDetail(['conditionallyActive'], field)
    const conditionFulfilled = isEmpty(bespokeRequirements) ? true : isFulfilled(bespokeRequirements, bespokeData)
    if (!conditionFulfilled) {
      return mergeWithRight(schema, { [fieldName]: joi.any().optional() })
    }

    const fieldConfigResponseType = getFieldDetail(['responseType'], field)
    const [responseType, ...dynamicFieldArguments] = fieldConfigResponseType.split('_')

    const joiFieldItem = fieldOptions[responseType]
    const joiFieldSchema = typeof joiFieldItem === 'function' ? joiFieldItem(...dynamicFieldArguments) : joiFieldItem

    return mergeWithRight(schema, { [fieldName]: joiFieldSchema })
  }, {})

  return joi.object().keys(formSchema)
}

function isFulfilled(requirement, data) {
  const requirementName = getFieldName(requirement)
  const requiredAnswer = requirement[requirementName]

  return data[requirementName] === requiredAnswer
}

function approvedAddressValidationConfig(licence) {
  if (getIn(licence, ['curfew', 'approvedPremises', 'required']) === 'Yes') {
    return {
      formResponse: getIn(licence, ['curfew', 'approvedPremisesAddress']),
      formType: 'approvedPremisesAddress',
      pageConfig: curfewConfig.approvedPremisesAddress,
      section: 'curfew',
      missingMessage: 'Enter the approved premises address details',
    }
  }
  if (getIn(licence, ['bassReferral', 'bassAreaCheck', 'approvedPremisesRequiredYesNo']) === 'Yes') {
    return {
      formResponse: getIn(licence, ['bassReferral', 'approvedPremisesAddress']),
      formType: 'approvedPremisesAddress',
      pageConfig: bassConfig.approvedPremisesAddress,
      section: 'bassReferral',
      missingMessage: 'Enter the approved premises address details',
    }
  }
}
