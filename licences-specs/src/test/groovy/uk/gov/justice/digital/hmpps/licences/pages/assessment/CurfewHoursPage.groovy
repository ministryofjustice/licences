package uk.gov.justice.digital.hmpps.licences.pages.assessment

import geb.Page
import org.openqa.selenium.Keys
import uk.gov.justice.digital.hmpps.licences.modules.HeaderModule

class CurfewHoursPage extends Page {

    static url = '/hdc/curfew/curfewHours'

    static at = {
        browser.currentUrl.contains(url)
    }

    static content = {
        header { module(HeaderModule) }
    }
}
