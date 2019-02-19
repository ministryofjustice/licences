package uk.gov.justice.digital.hmpps.licences.pages.eligibility

import geb.Page
import geb.module.RadioButtons
import uk.gov.justice.digital.hmpps.licences.modules.HeaderModule

class BassRequestPage extends Page {

  static url = '/hdc/bassReferral/bassRequest'

  static at = {
    browser.currentUrl.contains(url)
  }

  static content = {
    header { module(HeaderModule) }

    specificAreaRadios { $(name: "specificArea").module(RadioButtons) }

    proposedTownInput(required: false) { $("#proposedTown") }

    proposedCountyInput(required: false) { $("#proposedCounty") }
  }
}
