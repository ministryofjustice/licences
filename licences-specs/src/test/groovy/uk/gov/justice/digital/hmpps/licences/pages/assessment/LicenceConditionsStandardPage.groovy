package uk.gov.justice.digital.hmpps.licences.pages.assessment

import geb.Page
import geb.module.RadioButtons
import uk.gov.justice.digital.hmpps.licences.modules.HeaderModule

class LicenceConditionsStandardPage extends Page {

  static url = '/hdc/licenceConditions/standard'

  static at = {
    browser.currentUrl.contains(url)
  }

  static content = {
    header { module(HeaderModule) }

    additionalConditionsRadios { $(name: "additionalConditionsRequired").module(RadioButtons) }

    standardConditionsItems { $("#standardConditions").find('li') }
  }
}
