package uk.gov.justice.digital.hmpps.licences.pages.pdf

import geb.Page
import geb.module.RadioButtons

class LicenceTemplatePage extends Page {

  static url = '/hdc/pdf/selectLicenceType'

  static at = {
    browser.currentUrl.contains(url)
  }

  static content = {

    offenceBeforeRadio { $(name: "offenceBeforeCutoff").module(RadioButtons) }
    templateTypes { $(name: "licenceTypeRadio").module(RadioButtons) }
  }
}
