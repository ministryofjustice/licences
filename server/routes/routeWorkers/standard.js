const { getIn, isEmpty, firstItem, lastItem } = require('../../utils/functionalHelpers')
const { getPathFor } = require('../../utils/routes')

module.exports = ({ formConfig, licenceService, sectionName, nomisPushService, config }) => {
  function get(req, res) {
    const { formName, bookingId, action } = req.params
    return formGet(req, res, formName, bookingId, action)
  }

  function formGet(req, res, formName, bookingId, action) {
    const { licenceSection, nextPath, pageDataMap } = formConfig[formName]
    const dataPath = pageDataMap || ['licence', sectionName, licenceSection]

    const rawData = getIn(res.locals.licence, dataPath) || {}
    const data =
      firstItem(req.flash('userInput')) || licenceService.addSplitDateFields(rawData, formConfig[formName].fields)
    const errorObject = firstItem(req.flash('errors')) || {}

    const viewData = { bookingId, data, nextPath, errorObject, action, sectionName, formName }

    res.render(`${sectionName}/${formName}`, viewData)
  }

  async function post(req, res) {
    const { formName, bookingId, action } = req.params
    return formPost(req, res, formName, bookingId, action)
  }

  async function formPost(req, res, formName, bookingId, action) {
    const nextPath = getPathFor({ data: req.body, config: formConfig[formName], action })
    const { targetSection, targetForm } = getTarget(formName)

    const updatedLicence = await licenceService.update({
      bookingId,
      originalLicence: res.locals.licence,
      config: formConfig[formName],
      userInput: req.body,
      licenceSection: targetSection,
      formName: targetForm,
      postRelease: res.locals.postRelease,
    })

    if (formConfig[formName].validate) {
      const errors = validationErrors(updatedLicence, formName, res)
      if (!isEmpty(errors)) {
        req.flash('errors', errors)
        const actionPath = action ? `${action}/` : ''
        return res.redirect(`/hdc/${sectionName}/${formName}/${actionPath}${bookingId}`)
      }
    }

    await pushStatus(updatedLicence, formName, bookingId, req.user.username)
    await pushChecksPassed(updatedLicence, formName, bookingId, req.user.username)

    if (req.body.anchor) {
      return res.redirect(`${nextPath}${bookingId}#${req.body.anchor}`)
    }

    if (req.body.path) {
      return res.redirect(`${nextPath}${req.body.path}/${bookingId}`)
    }

    res.redirect(`${nextPath}${bookingId}`)
  }

  function getTarget(formName) {
    const saveSection = formConfig[formName].saveSection || []
    const targetSection = saveSection[0] || sectionName
    const targetForm = saveSection[1] || formName

    return { targetSection, targetForm }
  }

  function validationErrors(updatedLicence, formName, res) {
    const form = updatedLicence[sectionName][formName]
    // address is in array
    const formToValidate = form && form.addresses ? lastItem(form.addresses) : form
    return licenceService.validateForm({
      formResponse: formToValidate,
      pageConfig: formConfig[formName],
      formType: formName,
      bespokeConditions: {
        postApproval: isPostApproval(res.locals.licence),
        confiscationOrder: res.locals.licenceStatus.decisions.confiscationOrder,
        offenderIsMainOccupier: res.locals.licenceStatus.decisions.offenderIsMainOccupier,
      },
    })
  }

  function isPostApproval(licence) {
    return licence ? ['DECIDED', 'MODIFIED', 'MODIFIED_APPROVAL'].includes(licence.stage) : false
  }

  async function pushStatus(updatedLicence, formName, bookingId, username) {
    const pushConfig = getIn(formConfig, [formName, 'nomisPush'])

    if (getIn(config, ['pushToNomis']) && pushConfig) {
      await nomisPushService.pushStatus(
        bookingId,
        {
          type: formName,
          status: !isEmpty(pushConfig.status) ? getIn(updatedLicence, pushConfig.status) : undefined,
          reason: !isEmpty(pushConfig.reason) ? getIn(updatedLicence, pushConfig.reason) : undefined,
        },
        username
      )
    }
  }

  async function pushChecksPassed(updatedLicence, formName, bookingId, username) {
    if (getIn(config, ['pushToNomis']) && formName === 'suitability') {
      const notExcluded = getIn(updatedLicence, ['eligibility', 'excluded', 'decision']) === 'No'
      const notUnsuitable = getIn(updatedLicence, ['eligibility', 'suitability', 'decision']) === 'No'
      if (notExcluded && notUnsuitable) {
        await nomisPushService.pushChecksPassed(bookingId, username)
      }
    }
  }

  return {
    get,
    post,
    formPost,
  }
}
