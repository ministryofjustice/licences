package uk.gov.justice.digital.hmpps.licences.pages.decision

import geb.Page
import uk.gov.justice.digital.hmpps.licences.modules.HeaderModule

class ApprovalMandatoryCheckPage extends Page {

  static url = '/hdc/approval/mandatoryCheck'

  static at = {
    browser.currentUrl.contains(url)
  }

  static content = {

    header { module(HeaderModule) }

  }
}
