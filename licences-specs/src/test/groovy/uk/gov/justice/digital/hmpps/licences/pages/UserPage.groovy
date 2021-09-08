package uk.gov.justice.digital.hmpps.licences.pages

import geb.Page
import uk.gov.justice.digital.hmpps.licences.modules.HeaderModule
import uk.gov.justice.digital.hmpps.licences.modules.OffenderSummaryModule

class UserPage extends Page {

  static url = '/user'

  static at = {
    browser.currentUrl.contains(url)
  }

  static content = {
    pageTitle(required: true) { $('h2').text() }
    caseloadSelector(required: false) { $('#selectCaseLoad') }
    roleSelector(required: false) { $('#selectRole') }
  }

}
