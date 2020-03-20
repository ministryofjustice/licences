package uk.gov.justice.digital.hmpps.licences.pages.assessment
import geb.Page


class ReviewBassRequestPage extends Page {

  static url = '/hdc/review/bassRequest'

  static at = {
    browser.currentUrl.contains(url)
  }
  static content = {
    specificAreaNo { $("#bassEditLink") }
  }
}


