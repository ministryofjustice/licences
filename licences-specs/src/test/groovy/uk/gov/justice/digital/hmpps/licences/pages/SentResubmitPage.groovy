package uk.gov.justice.digital.hmpps.licences.pages

import geb.Page
import uk.gov.justice.digital.hmpps.licences.modules.HeaderModule
import uk.gov.justice.digital.hmpps.licences.modules.SubmissionTargetModule

class SentResubmitPage extends Page {

  static url = '/hdc/sent/DM/caToDmResubmit'

  static at = {
    browser.currentUrl.contains(url)
  }

  static content = {}
}
