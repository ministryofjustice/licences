package uk.gov.justice.digital.hmpps.licences.pages.assessment
import geb.Page
import uk.gov.justice.digital.hmpps.licences.modules.HeaderModule
import geb.module.RadioButtons

class ProposedAddressRejectedPage extends Page {

  static url = '/hdc/proposedAddress/rejected'

  static at = {
    browser.currentUrl.contains(url)
  }

  static content = {

    header { module(HeaderModule) }

    errorSummary(required: false) { $('#error-summary-heading') }
    errorSummaryLinkMessage ( required: false ) { $('.error-summary-list').$('li') }
    inlineErrorMessage (required: false) {$('#enterAlternativeForm')}
    alternativeAddressRadios { $(name: "enterAlternative").module(RadioButtons) }
  }
}
