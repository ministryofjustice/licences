package uk.gov.justice.digital.hmpps.licences.pages.finalchecks

import geb.Page
import geb.module.RadioButtons
import uk.gov.justice.digital.hmpps.licences.modules.BassRequestModule
import uk.gov.justice.digital.hmpps.licences.modules.HeaderModule

class BassOfferPage extends Page {

    static url = '/hdc/bassReferral/bassOffer'

    static at = {
        browser.currentUrl.contains(url)
    }

    static content = {
        header { module(HeaderModule) }

        bass { module(BassRequestModule) }

        bassAcceptedRadios { $(name: "bassAccepted").module(RadioButtons) }

        bassOfferDetails { $('#bassOfferDetails') }

        bassAddressForm(required: false) { $('#bassAddressForm') }
    }
}
