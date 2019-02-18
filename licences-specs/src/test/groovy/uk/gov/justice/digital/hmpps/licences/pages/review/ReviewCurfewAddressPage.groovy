package uk.gov.justice.digital.hmpps.licences.pages.review

import geb.Page
import uk.gov.justice.digital.hmpps.licences.modules.CurfewDetailsModule
import uk.gov.justice.digital.hmpps.licences.modules.ErrorModule
import uk.gov.justice.digital.hmpps.licences.modules.HeaderModule

class ReviewCurfewAddressPage extends Page {

    static url = '/hdc/review/curfewAddress'

    static at = {
        browser.currentUrl.contains(url)
    }

    static content = {
        header { module(HeaderModule) }
        errors { module(ErrorModule) }

        curfew { module(CurfewDetailsModule) }

        correctAddressLink(required: false) { $("#correctAddressLink") }
    }
}
