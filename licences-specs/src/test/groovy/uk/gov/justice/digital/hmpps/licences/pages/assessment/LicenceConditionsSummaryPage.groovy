package uk.gov.justice.digital.hmpps.licences.pages.assessment

import geb.Page
import geb.module.Checkbox
import uk.gov.justice.digital.hmpps.licences.modules.ConditionsSummaryModule
import uk.gov.justice.digital.hmpps.licences.modules.HeaderModule

class LicenceConditionsSummaryPage extends Page {

  static url = '/hdc/licenceConditions/conditionsSummary'

  static at = {
    browser.currentUrl.contains(url)
  }

  static content = {

    header { module(HeaderModule) }

    conditions { module(ConditionsSummaryModule) }

  }
}
