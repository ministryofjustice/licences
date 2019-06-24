package uk.gov.justice.digital.hmpps.licences.pages.assessment

import geb.Page
import uk.gov.justice.digital.hmpps.licences.modules.ApprovedPremisesModule
import uk.gov.justice.digital.hmpps.licences.modules.BassRequestModule
import uk.gov.justice.digital.hmpps.licences.modules.ConditionsSummaryModule
import uk.gov.justice.digital.hmpps.licences.modules.CurfewDetailsModule
import uk.gov.justice.digital.hmpps.licences.modules.HeaderModule
import uk.gov.justice.digital.hmpps.licences.modules.OffenderDetailsModule
import uk.gov.justice.digital.hmpps.licences.modules.ReportingDetailsModule
import uk.gov.justice.digital.hmpps.licences.modules.RiskDetailsModule
import uk.gov.justice.digital.hmpps.licences.modules.AddressDetailsModule

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

    approvedPremises { module(ApprovedPremisesModule) }

    addressDetails { module(AddressDetailsModule) }

    changeDetailsLink { section ->
      $("#${section}EditLink")
    }

    proposedAddressError(required: false) { $('#proposed-address-error').text() }
    riskError(required: false) { $('#risk-error').text() }
    victimLiaisonError(required: false) { $('#victim-error').text() }
    curfewHoursError(required: false) { $('#curfew-hours-error').text() }
    additionalConditionsError(required: false) { $('#noConditionsError').text() }
    reportingInstructionsError(required: false) { $('#reporting-error').text() }
  }
}
