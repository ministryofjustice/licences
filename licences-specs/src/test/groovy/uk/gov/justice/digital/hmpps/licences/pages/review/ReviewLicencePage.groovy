package uk.gov.justice.digital.hmpps.licences.pages.review

import geb.Page
import uk.gov.justice.digital.hmpps.licences.modules.BassRequestModule
import uk.gov.justice.digital.hmpps.licences.modules.ConditionsSummaryModule
import uk.gov.justice.digital.hmpps.licences.modules.CurfewDetailsModule
import uk.gov.justice.digital.hmpps.licences.modules.HeaderModule
import uk.gov.justice.digital.hmpps.licences.modules.OffenderDetailsModule
import uk.gov.justice.digital.hmpps.licences.modules.ReportingDetailsModule
import uk.gov.justice.digital.hmpps.licences.modules.RiskDetailsModule

class ReviewLicencePage extends Page {

  static url = '/hdc/review/licence'

  static at = {
    browser.currentUrl.contains(url)
  }

  static content = {

    header { module(HeaderModule) }

    offender { module(OffenderDetailsModule) }

    curfew { module(CurfewDetailsModule) }

    conditions { module(ConditionsSummaryModule) }

    risk { module(RiskDetailsModule) }

    reporting { module(ReportingDetailsModule) }

    bass { module(BassRequestModule) }

    createLicenceControl(required: false) { $('#createPdf') }

    saveAndContinue(required: false){ $('#continueBtn')}
    
    backLink {$('.link-back')}
  }
}
