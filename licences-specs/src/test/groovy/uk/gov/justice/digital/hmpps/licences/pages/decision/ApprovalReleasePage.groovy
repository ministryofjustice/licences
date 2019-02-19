package uk.gov.justice.digital.hmpps.licences.pages.decision

import geb.Page
import geb.module.RadioButtons
import uk.gov.justice.digital.hmpps.licences.modules.HeaderModule

class ApprovalReleasePage extends Page {

  static url = '/hdc/approval/release'

  static at = {
    browser.currentUrl.contains(url)
  }

  static content = {

    header { module(HeaderModule) }

    releaseRadios { $(name: "decision").module(RadioButtons) }

    reasonsForm(required: false) { $("#releaseForm") }

    reasons(required: false) { $(name: "reason") }
  }
}
