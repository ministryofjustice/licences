package uk.gov.justice.digital.hmpps.licences.pages.assessment
import geb.Page
import geb.module.RadioButtons

class BassReferralBassRequestPage extends Page {

  static url = '/hdc/bassReferral/bassRequest'

  static at = {
    browser.currentUrl.contains(url)
  }
  static content = {
    specificArea { $("#no").module(RadioButtons) }
    additionalInformation { $(name: "additionalInformation")}
    saveAndContinue { $("#continueBtn")}
  }
}


