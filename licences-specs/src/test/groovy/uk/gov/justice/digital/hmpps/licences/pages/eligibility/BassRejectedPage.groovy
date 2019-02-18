package uk.gov.justice.digital.hmpps.licences.pages.eligibility

import geb.Page
import geb.module.RadioButtons
import uk.gov.justice.digital.hmpps.licences.modules.BassRequestModule
import uk.gov.justice.digital.hmpps.licences.modules.HeaderModule

class BassRejectedPage extends Page {

    static url = '/hdc/bassReferral/rejected'

    static at = {
        browser.currentUrl.contains(url)
    }

    static content = {
        header { module(HeaderModule) }

        bass { module(BassRequestModule) }

        alternativeAreaRadios { $(name: "enterAlternative").module(RadioButtons) }
    }
}
