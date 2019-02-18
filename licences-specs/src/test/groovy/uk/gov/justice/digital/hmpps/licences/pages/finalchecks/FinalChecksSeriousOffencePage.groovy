package uk.gov.justice.digital.hmpps.licences.pages.finalchecks

import geb.Page
import geb.module.RadioButtons
import uk.gov.justice.digital.hmpps.licences.modules.HeaderModule

class FinalChecksSeriousOffencePage extends Page {

    static url = '/hdc/finalChecks/seriousOffence'

    static at = {
        browser.currentUrl.contains(url)
    }

    static content = {

        header { module(HeaderModule) }

        seriousOffenceRadios  { $(name: "decision").module(RadioButtons) }
    }
}
