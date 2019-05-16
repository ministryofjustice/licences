package uk.gov.justice.digital.hmpps.licences.pages.finalchecks

import geb.Page
import geb.module.RadioButtons
import uk.gov.justice.digital.hmpps.licences.modules.ApprovedPremisesModule
import uk.gov.justice.digital.hmpps.licences.modules.BassRequestModule
import uk.gov.justice.digital.hmpps.licences.modules.HeaderModule
import uk.gov.justice.digital.hmpps.licences.modules.OffenderDetailsModule

class ApprovedPremisesChoicePage extends Page {

  static url = '/hdc/curfew/approvedPremisesChoice'

  static at = {
    browser.currentUrl.contains(url)
  }

  static content = {
    header { module(HeaderModule) }

    offender { module(OffenderDetailsModule) }

    approvedPremisesChoiceRadios { $(name: "decision").module(RadioButtons) }
  }
}
