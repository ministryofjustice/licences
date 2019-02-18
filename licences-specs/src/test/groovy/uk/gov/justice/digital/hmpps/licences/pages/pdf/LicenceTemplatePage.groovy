package uk.gov.justice.digital.hmpps.licences.pages.pdf

import geb.Page
import geb.module.Select
import uk.gov.justice.digital.hmpps.licences.modules.HeaderModule
import uk.gov.justice.digital.hmpps.licences.modules.OffenderDetailsModule

class LicenceTemplatePage extends Page {

    static url = '/hdc/pdf/select'

    static at = {
        browser.currentUrl.contains(url)
    }

    static content = {

        templateTypes { $(name: "decision").module(Select) }
    }
}
