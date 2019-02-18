package uk.gov.justice.digital.hmpps.licences.pages

import geb.Page
import uk.gov.justice.digital.hmpps.licences.modules.HeaderModule
import uk.gov.justice.digital.hmpps.licences.modules.SubmissionTargetModule

class SentPage extends Page {

    static url = '/hdc/sent'

    static at = {
        browser.currentUrl.contains(url)
    }

    static content = {
        header { module(HeaderModule) }
        submissionTarget { module(SubmissionTargetModule) }
    }
}
