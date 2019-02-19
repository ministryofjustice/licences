package uk.gov.justice.digital.hmpps.licences.pages.review

import geb.Page
import uk.gov.justice.digital.hmpps.licences.modules.CurfewDetailsModule
import uk.gov.justice.digital.hmpps.licences.modules.HeaderModule

class ReviewAddressPage extends Page {

  static url = '/hdc/review/address'

  static at = {
    browser.currentUrl.contains(url)
  }

  static content = {
    header { module(HeaderModule) }

    curfew { module(CurfewDetailsModule) }

    withdrawConsent(required: false) { $('#withdrawConsent') }
    withdrawAddress(required: false) { $('#withdrawAddress') }

    errorSummary(required: false) { $('#error-summary-heading') }
  }
}
