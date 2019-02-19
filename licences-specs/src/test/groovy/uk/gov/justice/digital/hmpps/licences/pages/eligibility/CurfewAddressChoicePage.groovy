package uk.gov.justice.digital.hmpps.licences.pages.eligibility

import geb.Page
import geb.module.RadioButtons
import uk.gov.justice.digital.hmpps.licences.modules.HeaderModule

class CurfewAddressChoicePage extends Page {

  static url = '/hdc/proposedAddress/curfewAddressChoice'

  static at = {
    browser.currentUrl.contains(url)
  }

  static content = {
    header { module(HeaderModule) }

    decisionRadios { $(name: "decision").module(RadioButtons) }
  }
}
