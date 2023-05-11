package uk.gov.justice.digital.hmpps.licences.pages.finalchecks

import geb.Page
import geb.module.RadioButtons
import uk.gov.justice.digital.hmpps.licences.modules.HeaderModule

class FinalChecksSegregationPage extends Page {

  static url = '/hdc/finalChecks/segregation'

  static at = {
    browser.currentUrl.contains(url)
  }

  static content = {

    header { module(HeaderModule) }

    segregationRadios { $(name: "decision").module(RadioButtons) }
  }
}
