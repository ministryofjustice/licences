package uk.gov.justice.digital.hmpps.licences.pages.decision

import geb.Page
import geb.module.Checkbox
import geb.module.RadioButtons
import uk.gov.justice.digital.hmpps.licences.modules.HeaderModule

class ApprovalRefusePage extends Page {

  static url = '/hdc/approval/refuseReason'

  static at = {
    browser.currentUrl.contains(url)
  }

  static content = {

    header { module(HeaderModule) }

    reasonsForm(required: false) { $("#releaseForm") }

    reasonsItem { value ->
      $("input", value: value, name: "reason").module(Checkbox)
    }
  }
}
