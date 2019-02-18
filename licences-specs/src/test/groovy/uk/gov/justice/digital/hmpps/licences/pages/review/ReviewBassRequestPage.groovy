package uk.gov.justice.digital.hmpps.licences.pages.review

import geb.Page
import uk.gov.justice.digital.hmpps.licences.modules.BassRequestModule
import uk.gov.justice.digital.hmpps.licences.modules.CurfewDetailsModule
import uk.gov.justice.digital.hmpps.licences.modules.ErrorModule
import uk.gov.justice.digital.hmpps.licences.modules.HeaderModule

class ReviewBassRequestPage extends Page {

    static url = '/hdc/review/bassRequest'

    static at = {
        browser.currentUrl.contains(url)
    }

    static content = {
        header { module(HeaderModule) }
        errors { module(ErrorModule) }

        bass { module(BassRequestModule) }

        changeBassLink(required: false) { $("#bassEditLink") }
    }
}
