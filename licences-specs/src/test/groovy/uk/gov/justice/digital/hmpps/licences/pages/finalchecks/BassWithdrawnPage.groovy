package uk.gov.justice.digital.hmpps.licences.pages.finalchecks

import geb.Page
import geb.module.RadioButtons
import uk.gov.justice.digital.hmpps.licences.modules.BassRequestModule
import uk.gov.justice.digital.hmpps.licences.modules.HeaderModule

class BassWithdrawnPage extends Page {

  static url = '/hdc/bassReferral/bassWithdrawn'

  static at = {
    browser.currentUrl.contains(url)
  }

  static content = {
    header { module(HeaderModule) }

    decisionRadios { $(name: "decision").module(RadioButtons) }
  }
}
