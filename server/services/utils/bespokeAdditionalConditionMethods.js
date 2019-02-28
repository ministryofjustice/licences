/* eslint-disable camelcase */
const { isEmpty } = require('../../utils/functionalHelpers')

const combineSocialServicesAnswers = (servicesChosen, servicesName) => {
  const startText = servicesChosen ? 'and/or ' : ''
  const combinedText = `${startText}${servicesName}`

  return servicesName ? combinedText : null
}

module.exports = {
  unsupervisedContactInput: (userInput, errors) => {
    const combineFields = object => {
      if (isEmpty(object)) return {}

      const {
        do_not_unsupervised_contact,
        do_not_unsupervised_social_services_dept,
        do_not_unsupervised_social_services_dept_name,
      } = object

      return {
        do_not_unsupervised_contact,
        do_not_unsupervised_social_services_dept: combineSocialServicesAnswers(
          do_not_unsupervised_social_services_dept,
          do_not_unsupervised_social_services_dept_name
        ),
      }
    }

    return {
      userContent: combineFields(userInput),
      errors: combineFields(errors),
    }
  },

  victimContactInput: (userInput, errors) => {
    const combineFields = object => {
      if (isEmpty(object)) return {}

      const {
        do_not_contact_victim_name,
        do_not_contact_victim_social_services_dept,
        do_not_contact_victim_social_services_dept_name,
      } = object

      return {
        do_not_contact_victim_name,
        do_not_contact_victim_social_services_dept: combineSocialServicesAnswers(
          do_not_contact_victim_social_services_dept,
          do_not_contact_victim_social_services_dept_name
        ),
      }
    }

    return {
      userContent: combineFields(userInput),
      errors: combineFields(errors),
    }
  },
}
