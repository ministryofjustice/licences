const baseJoi = require('joi').extend(require('@hapi/joi-date'))

const joi = baseJoi

module.exports = {
  curfewAddressSchema: joi
    .object()
    .keys({
      addressLine1: joi.string().required(),
      addressLine2: joi.string().allow('').optional(),
      addressTown: joi.string().required(),
      postCode: joi
        .string()
        .regex(/^[a-z]{1,2}\d[a-z\d]?\s*\d[a-z]{2}$/i)
        .description('postcode')
        .required(),
      telephone: joi.when('occupier.isOffender', {
        is: joi.not('Yes'),
        then: joi
          .string()
          .regex(/^[0-9+\s]+$/)
          .required(),
        otherwise: joi
          .string()
          .regex(/^[0-9+\s]+$/)
          .allow('')
          .optional(),
      }),
      additionalInformation: joi.string().allow('').optional(),
      residents: joi.array().items(
        joi.object().keys({
          name: joi.string().required(),
          relationship: joi.string().required(),
          age: joi.number().min(0).max(110).allow('').optional(),
        })
      ),
      occupier: joi.object().keys({
        name: joi.when('isOffender', {
          is: joi.not('Yes'),
          then: joi.string().required(),
          otherwise: joi.any().optional(),
        }),
        relationship: joi.when('isOffender', {
          is: joi.not('Yes'),
          then: joi.string().required(),
          otherwise: joi.any().optional(),
        }),
        isOffender: joi.valid('Yes', 'No').optional(),
      }),
      cautionedAgainstResident: joi.valid('Yes', 'No').required(),
      residentOffenceDetails: joi.when('cautionedAgainstResident', {
        is: 'Yes',
        then: joi.string().required(),
        otherwise: joi.any().optional(),
      }),
    })
    .required(),

  // complex structure due to cascading requirements
  addressReviewSchema: joi.object().keys({
    consent: joi.valid('Yes', 'No').required(),

    electricity: joi.when('consent', {
      is: 'Yes',
      then: joi.valid('Yes', 'No').required(),
      otherwise: joi.any().optional(),
    }),

    homeVisitConducted: joi.when('consent', {
      is: 'Yes',
      then: joi.when('electricity', {
        is: 'Yes',
        then: joi.valid('Yes', 'No').required(),
        otherwise: joi.any().optional(),
      }),
      otherwise: joi.any().optional(),
    }),

    addressReviewComments: joi.string().allow('').optional(),
    version: joi.string().allow('').optional(),
  }),

  addressReviewSchemaOffenderIsOccupier: joi.object().keys({
    consent: joi.valid('Yes', 'No').optional(),

    electricity: joi.valid('Yes', 'No').required(),

    homeVisitConducted: joi.when('electricity', {
      is: 'Yes',
      then: joi.valid('Yes', 'No').required(),
      otherwise: joi.any().optional(),
    }),

    addressReviewComments: joi.string().allow('').optional(),
  }),
}
