package uk.gov.justice.digital.hmpps.licences.pages

import geb.Page
import uk.gov.justice.digital.hmpps.licences.modules.HeaderModule
import uk.gov.justice.digital.hmpps.licences.modules.OffenderSummaryModule

class CaselistPage extends Page {

    static url = '/caseList'

    static at = {
        browser.currentUrl.contains(url)
    }

    static content = {

        header { module(HeaderModule) }

        offenders { module(OffenderSummaryModule) }

        hdcEligible(required: false) { $('tr.hdcEligible') }
        statusFor {index ->
            $('tr.hdcEligible')[index].find('.status').text()
        }

        viewTaskListFor { nomisId ->
            $('a', href: contains(nomisId)).click()
        }

        searchOffenderControl(required: false){ $('#searchOffenderLink')}

        paginateNext(required: false) {$('#pagination a.next')}
        paginatePrev(required: false) {$('#pagination a.prev')}
        paginationText(required: false) {$('#paginationInfo')}
    }

}
