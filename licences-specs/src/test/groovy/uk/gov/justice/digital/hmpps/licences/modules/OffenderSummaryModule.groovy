package uk.gov.justice.digital.hmpps.licences.modules

import geb.Module


class OffenderSummaryModule extends Module {

    static content = {

        summary {
            $('tr.hdcEligible').collect { offender ->
                [
                        name    : offender.find('.name').text(),
                        nomisId : offender.find('.offenderNo').text(),
                        location: offender.find('.location').text(),
                        hdced   : offender.find('.hdced').text(),
                        crdArd     : offender.find('.crd').text(),
                        status  : offender.find('.status').text(),
                ]
            }
        }
    }
}