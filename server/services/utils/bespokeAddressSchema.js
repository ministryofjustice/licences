const baseJoi = require('joi')
const dateExtend = require('joi-date-extensions')
const postcodeExtend = require('joi-postcode')

const joi = baseJoi.extend(dateExtend).extend(postcodeExtend)

module.exports = {
  curfewAddressSchema: joi
    .object()
    .keys({
      addressLine1: joi.string().required(),
      addressLine2: joi
        .string()
        .allow('')
        .optional(),
      addressTown: joi.string().required(),
      postCode: joi.postcode().required(),
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
      residents: joi.array().items(
        joi.object().keys({
          name: joi.string().required(),
          relationship: joi.string().required(),
          age: joi
            .number()
            .min(0)
            .max(110)
            .allow('')
            .optional(),
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
        isOffender: joi.valid(['Yes', 'No']).optional(),
      }),
      cautionedAgainstResident: joi.valid(['Yes', 'No']).required(),
      residentOffenceDetails: joi.when('cautionedAgainstResident', {
        is: 'Yes',
        then: joi.string().required(),
        otherwise: joi.any().optional(),
      }),
    })
    .required(),

  // complex structure due to cascading requirements
  addressReviewSchema: joi.object().keys({
    consent: joi.valid(['Yes', 'No']).required(),

    electricity: joi.when('consent', {
      is: 'Yes',
      then: joi.valid(['Yes', 'No']).required(),
      otherwise: joi.any().optional(),
    }),

    homeVisitConducted: joi.when('consent', {
      is: 'Yes',
      then: joi.when('electricity', {
        is: 'Yes',
        then: joi.valid(['Yes', 'No']).required(),
        otherwise: joi.any().optional(),
      }),
      otherwise: joi.any().optional(),
    }),

    addressReviewComments: joi
      .string()
      .allow('')
      .optional(),
  }),

  addressReviewSchemaOffenderIsOccupier: joi.object().keys({
    consent: joi.valid(['Yes', 'No']).optional(),

    electricity: joi.valid(['Yes', 'No']).required(),

    homeVisitConducted: joi.when('electricity', {
      is: 'Yes',
      then: joi.valid(['Yes', 'No']).required(),
      otherwise: joi.any().optional(),
    }),

    addressReviewComments: joi
      .string()
      .allow('')
      .optional(),
  }),
}
