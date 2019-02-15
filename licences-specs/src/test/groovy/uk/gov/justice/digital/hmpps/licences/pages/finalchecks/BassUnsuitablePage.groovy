package uk.gov.justice.digital.hmpps.licences.pages.finalchecks

import geb.Page
import geb.module.RadioButtons
import uk.gov.justice.digital.hmpps.licences.modules.BassRequestModule
import uk.gov.justice.digital.hmpps.licences.modules.HeaderModule

class BassUnsuitablePage extends Page {

    static url = '/hdc/bassReferral/unsuitable'

    static at = {
        browser.currentUrl.contains(url)
    }

    static content = {
        header { module(HeaderModule) }

        bass { module(BassRequestModule) }

        alternativeAreaRadios { $(name: "enterAlternative").module(RadioButtons) }
    }
}
