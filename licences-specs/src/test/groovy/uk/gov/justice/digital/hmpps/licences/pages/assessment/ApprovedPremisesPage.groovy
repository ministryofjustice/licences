package uk.gov.justice.digital.hmpps.licences.pages.assessment

import geb.Page
import geb.module.RadioButtons
import uk.gov.justice.digital.hmpps.licences.modules.CurfewDetailsModule
import uk.gov.justice.digital.hmpps.licences.modules.HeaderModule
import uk.gov.justice.digital.hmpps.licences.modules.OffenderDetailsModule

class ApprovedPremisesPage extends Page {

  static url = '/hdc/curfew/approvedPremises'

  static at = {
    browser.currentUrl.contains(url)
  }

  static content = {

    header { module(HeaderModule) }

    offender { module(OffenderDetailsModule) }

    curfew { module(CurfewDetailsModule) }

    approvedPremisesRadios { $(name: "required").module(RadioButtons) }
  }
}
