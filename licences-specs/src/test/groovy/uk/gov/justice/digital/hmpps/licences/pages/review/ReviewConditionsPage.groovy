package uk.gov.justice.digital.hmpps.licences.pages.review

import geb.Page
import uk.gov.justice.digital.hmpps.licences.modules.ConditionsSummaryModule
import uk.gov.justice.digital.hmpps.licences.modules.HeaderModule

class ReviewConditionsPage extends Page {

  static url = '/hdc/review/conditions'

  static at = {
    browser.currentUrl.contains(url)
  }

  static content = {

    header { module(HeaderModule) }

    conditions { module(ConditionsSummaryModule) }
  }


}
