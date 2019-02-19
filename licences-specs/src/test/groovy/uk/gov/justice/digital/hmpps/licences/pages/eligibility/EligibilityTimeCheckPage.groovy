package uk.gov.justice.digital.hmpps.licences.pages.eligibility

import geb.Page
import geb.module.RadioButtons
import uk.gov.justice.digital.hmpps.licences.modules.HeaderModule

class EligibilityTimeCheckPage extends Page {

  static url = '/hdc/eligibility/crdTime'

  static at = {
    browser.currentUrl.contains(url)
  }

  static content = {
    header { module(HeaderModule) }

    crdTimeRadios { $(name: "decision").module(RadioButtons) }

  }
}
