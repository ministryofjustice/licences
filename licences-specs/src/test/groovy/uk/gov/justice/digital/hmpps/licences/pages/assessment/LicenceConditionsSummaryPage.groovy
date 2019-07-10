package uk.gov.justice.digital.hmpps.licences.pages.assessment

import geb.Page
import uk.gov.justice.digital.hmpps.licences.modules.ConditionsSummaryModule
import uk.gov.justice.digital.hmpps.licences.modules.HeaderModule
import uk.gov.justice.digital.hmpps.licences.modules.ErrorModule

class LicenceConditionsSummaryPage extends Page {

  static url = '/hdc/licenceConditions/conditionsSummary'

  static at = {
    browser.currentUrl.contains(url)
  }

  static content = {

    header { module(HeaderModule) }

    conditions { module(ConditionsSummaryModule) }

    errorMessages ( required: false ) { $('.error-summary-list').$('li')*.text() }

    submitButton( required: false ) { $('#continueBtn') }

    justificationText { $('#additionalConditionsJustification') }
  }
}
