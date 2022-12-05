package uk.gov.justice.digital.hmpps.licences.pages.assessment

import geb.Page
import geb.module.RadioButtons
import uk.gov.justice.digital.hmpps.licences.modules.HeaderModule

class RiskManagementV2Page extends Page {

  static url = '/hdc/risk/riskManagement'

  static at = {
    browser.currentUrl.contains(url)
  }

  static content = {
    header { module(HeaderModule) }

    hasConsideredChecksRadios { $(name: "hasConsideredChecks").module(RadioButtons) }
    awaitingOtherInformationRadios { $(name: "awaitingOtherInformation").module(RadioButtons) }

    addressSuitableRadios { $(name: "proposedAddressSuitable").module(RadioButtons) }
    emsInformationRadios(required: false) { $(name: "emsInformation").module(RadioButtons) }
    nonDisclosableInformationRadios { $(name: "nonDisclosableInformation").module(RadioButtons) }

    riskManagementForm { $("#riskManagementDetails") }
    addressSuitableForm(required: false) { $("#unsuitableReason") }
    emsInformationForm(required: false) { $("#emsInformationForm") }
    emsInformationDetails(required: false) { $("#emsInformationDetails") }
    nonDisclosableInformationForm (required: false) { $("#nonDisclosableInformationDetails") }
    nonDisclosableInformationView (required: false) { $("#nonDisclosableInformationDetailsView") }
  }
}
