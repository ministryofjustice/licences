package uk.gov.justice.digital.hmpps.licences.pages.assessment

import geb.Page
import geb.module.RadioButtons
import uk.gov.justice.digital.hmpps.licences.modules.HeaderModule

class VictimLiaisonPage extends Page {

    static url = '/hdc/victim/victimLiaison'

    static at = {
        browser.currentUrl.contains(url)
    }

    static content = {
        header { module(HeaderModule) }

        victimLiaisonRadios { $(name: "decision").module(RadioButtons) }

        victimLiaisonForm(required: false) { $("#victimLiaisonDetails") }
    }
}
