package uk.gov.justice.digital.hmpps.licences.pages.assessment

import geb.Page
import geb.module.RadioButtons
import uk.gov.justice.digital.hmpps.licences.modules.CurfewDetailsModule
import uk.gov.justice.digital.hmpps.licences.modules.HeaderModule

class CurfewAddressReviewPageV2 extends Page {

  static url = '/hdc/curfew/curfewAddressReview'

  static at = {
    browser.currentUrl.contains(url)
  }

  static content = {

    header { module(HeaderModule) }

    curfew { module(CurfewDetailsModule) }

    landlordConsentHavingSpokenRadios { $(name: "consentHavingSpoken").module(RadioButtons) }
    electricitySupplyRadios(required: false) { $(name: "electricity").module(RadioButtons) }
    homeVisitRadios(required: false) { $(name: "homeVisitConducted").module(RadioButtons) }

    landlordConsentHavingSpokenForm(required: false) { $("#consentHavingSpokenForm") }
  }
}
