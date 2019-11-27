package uk.gov.justice.digital.hmpps.licences.pages.assessment

import geb.Page

class ApprovedPremisesAddressPageBassReferral extends Page {

  static url = '/hdc/bassReferral/approvedPremisesAddress'

  static at = {
    browser.currentUrl.contains(url)
  }

  static content = {}
}
