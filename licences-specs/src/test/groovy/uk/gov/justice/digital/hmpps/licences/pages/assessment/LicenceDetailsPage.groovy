package uk.gov.justice.digital.hmpps.licences.pages.assessment

import geb.Page
import uk.gov.justice.digital.hmpps.licences.modules.BassRequestModule
import uk.gov.justice.digital.hmpps.licences.modules.ConditionsSummaryModule
import uk.gov.justice.digital.hmpps.licences.modules.CurfewDetailsModule
import uk.gov.justice.digital.hmpps.licences.modules.HeaderModule
import uk.gov.justice.digital.hmpps.licences.modules.OccupierDetailsModule
import uk.gov.justice.digital.hmpps.licences.modules.OffenderDetailsModule
import uk.gov.justice.digital.hmpps.licences.modules.ReportingDetailsModule
import uk.gov.justice.digital.hmpps.licences.modules.RiskDetailsModule

class LicenceDetailsPage extends Page {

  static url = '/hdc/review/licenceDetails'

  static at = {
    browser.currentUrl.contains(url)
  }

  static content = {
    header { module(HeaderModule) }

    offender { module(OffenderDetailsModule) }

    conditions { module(ConditionsSummaryModule) }

    curfew { module(CurfewDetailsModule) }

    risk { module(RiskDetailsModule) }

    reporting { module(ReportingDetailsModule) }

    bass { module(BassRequestModule) }

    changeDetailsLink { section ->
      $("#${section}EditLink")
    }
  }

}
