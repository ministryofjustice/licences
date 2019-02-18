package uk.gov.justice.digital.hmpps.licences.pages.finalchecks

import geb.Page
import geb.module.RadioButtons
import uk.gov.justice.digital.hmpps.licences.modules.HeaderModule

class FinalChecksAddressWithdrawnPage extends Page {

    static url = '/hdc/curfew/addressWithdrawn'

    static at = {
        browser.currentUrl.contains(url)
    }

    static content = {
        header { module(HeaderModule) }

        addAddressRadios { $(name: "enterNewAddress").module(RadioButtons) }
    }
}
