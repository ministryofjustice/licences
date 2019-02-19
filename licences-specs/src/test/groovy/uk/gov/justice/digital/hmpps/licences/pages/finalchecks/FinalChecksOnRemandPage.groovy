package uk.gov.justice.digital.hmpps.licences.pages.finalchecks

import geb.Page
import geb.module.RadioButtons
import uk.gov.justice.digital.hmpps.licences.modules.HeaderModule

class FinalChecksOnRemandPage extends Page {

  static url = '/hdc/finalChecks/onRemand'

  static at = {
    browser.currentUrl.contains(url)
  }

  static content = {

    header { module(HeaderModule) }

    onRemandRadios { $(name: "decision").module(RadioButtons) }
  }
}
