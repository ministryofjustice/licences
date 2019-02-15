package uk.gov.justice.digital.hmpps.licences.pages.review

import geb.Page
import uk.gov.justice.digital.hmpps.licences.modules.HeaderModule
import uk.gov.justice.digital.hmpps.licences.modules.RiskDetailsModule

class ReviewRiskPage extends Page {

    static url = '/hdc/review/risk'

    static at = {
        browser.currentUrl.contains(url)
    }

    static content = {

        header { module(HeaderModule) }

        risk { module(RiskDetailsModule) }
    }
}
