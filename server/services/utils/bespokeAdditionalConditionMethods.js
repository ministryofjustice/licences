/* eslint-disable camelcase */
const { isEmpty } = require('../../utils/functionalHelpers')

module.exports = {
  unsupervisedContactInput: (userInput, errors) => {
    const combineFields = object => {
      if (isEmpty(object)) return {}

      const {
        do_not_unsupervised_contact,
        do_not_unsupervised_social_services_dept,
        do_not_unsupervised_social_services_dept_name,
      } = object

      const combinedFields = `${
        do_not_unsupervised_social_services_dept === 'yes' ? 'and/or ' : ''
      }${do_not_unsupervised_social_services_dept_name}`

      const socialServicesText = do_not_unsupervised_social_services_dept_name ? combinedFields : null

      return {
        do_not_unsupervised_contact,
        do_not_unsupervised_social_services_dept: socialServicesText,
      }
    }

    return {
      userContent: combineFields(userInput),
      errors: combineFields(errors),
    }
  },
}
