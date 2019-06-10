package uk.gov.justice.digital.hmpps.licences.pages.assessment

import geb.Page
import geb.module.RadioButtons
import uk.gov.justice.digital.hmpps.licences.modules.HeaderModule

class RiskManagementPage extends Page {

  static url = '/hdc/risk/riskManagement'

  static at = {
    browser.currentUrl.contains(url)
  }

  static content = {
    header { module(HeaderModule) }

    riskManagementRadios { $(name: "planningActions").module(RadioButtons) }
    awaitingInformationRadios { $(name: "awaitingInformation").module(RadioButtons) }
    addressSuitableRadios { $(name: "proposedAddressSuitable").module(RadioButtons) }
    nonDisclosableInformationRadios { $(name: "hasNonDisclosableInformation").module(RadioButtons) }

    riskManagementForm { $("#riskManagementDetails") }
    addressSuitableForm(required: false) { $("#unsuitableReason") }
    nonDisclosableInformationForm (required: false) { $("#nonDisclosableInformation") }
    nonDisclosableInformationView (required: false) { $("#nonDisclosableInformationView") }
  }
}
