package uk.gov.justice.digital.hmpps.licences.pages.finalchecks

import geb.Page
import geb.module.RadioButtons
import uk.gov.justice.digital.hmpps.licences.modules.HeaderModule

class FinalChecksConfiscationOrderPage extends Page {

    static url = '/hdc/finalChecks/confiscationOrder'

    static at = {
        browser.currentUrl.contains(url)
    }

    static content = {

        header { module(HeaderModule) }

        confiscationOrderRadios  { $(name: "decision").module(RadioButtons) }
        consultedRadios(required: false)  { $(name: "confiscationUnitConsulted").module(RadioButtons) }
        commentsTextArea(required: false)  { $('#comments') }
    }
}
