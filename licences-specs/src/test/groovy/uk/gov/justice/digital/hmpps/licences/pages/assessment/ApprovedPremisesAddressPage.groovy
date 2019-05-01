package uk.gov.justice.digital.hmpps.licences.pages.assessment

import geb.Page
import geb.module.RadioButtons
import uk.gov.justice.digital.hmpps.licences.modules.ApprovedPremisesModule
import uk.gov.justice.digital.hmpps.licences.modules.CurfewDetailsModule
import uk.gov.justice.digital.hmpps.licences.modules.HeaderModule
import uk.gov.justice.digital.hmpps.licences.modules.OffenderDetailsModule

class ApprovedPremisesAddressPage extends Page {

  static url = '/hdc/curfew/approvedPremisesAddress'

  static at = {
    browser.currentUrl.contains(url)
  }

  static content = {

    header { module(HeaderModule) }

    offender { module(OffenderDetailsModule) }

    approvedPremises { module(ApprovedPremisesModule) }
  }
}
