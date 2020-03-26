package uk.gov.justice.digital.hmpps.licences.pages

import geb.Page
import uk.gov.justice.digital.hmpps.licences.modules.HeaderModule
import uk.gov.justice.digital.hmpps.licences.modules.SubmissionTargetModule

class SendApprovalPage extends Page {

  static url = '/hdc/send/approval'

  static at = {
    browser.currentUrl.contains(url)
  }

  static content = {
    backToPrint {$('#backToPrint')}
  }

}
