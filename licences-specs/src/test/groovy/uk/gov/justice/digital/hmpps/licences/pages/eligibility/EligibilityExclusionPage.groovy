package uk.gov.justice.digital.hmpps.licences.pages.eligibility

import geb.Page
import geb.module.Checkbox
import geb.module.RadioButtons
import uk.gov.justice.digital.hmpps.licences.modules.HeaderModule

class EligibilityExclusionPage extends Page {

  static url = '/hdc/eligibility/excluded'

  static at = {
    browser.currentUrl.contains(url)
  }

  static content = {
    header { module(HeaderModule) }

    excludedRadios { $(name: "decision").module(RadioButtons) }

    excludedReasonsForm(required: false) { $("#excludedForm") }

    excludedReasons(required: false) { $(name: "reason[]") }

    excludedReasonsItem { int number ->
      $("input", number, name: "reason[]").module(Checkbox)
    }

    continueBtn(wait:true, required:true) { $('#continueBtn')}
  }
}
