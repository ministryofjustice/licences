package uk.gov.justice.digital.hmpps.licences.pages.assessment
import geb.Page

class ProposedAddressCurfewAddressPage extends Page {

  static url = '/hdc/proposedAddress/curfewAddress'

  static at = {
    browser.currentUrl.contains(url)
  }
  static content = {}
}
