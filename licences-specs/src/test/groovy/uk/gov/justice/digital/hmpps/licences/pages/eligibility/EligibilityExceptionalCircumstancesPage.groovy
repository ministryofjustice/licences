package uk.gov.justice.digital.hmpps.licences.pages.eligibility

import geb.Page
import geb.module.Checkbox
import geb.module.RadioButtons
import uk.gov.justice.digital.hmpps.licences.modules.HeaderModule

class EligibilityExceptionalCircumstancesPage extends Page {

  static url = '/hdc/eligibility/exceptionalCircumstances'

  static at = {
    browser.currentUrl.contains(url)
  }

  static content = {
    header { module(HeaderModule) }

    exceptionalCircumstancesRadios { $(name: "decision").module(RadioButtons) }
  }
}
