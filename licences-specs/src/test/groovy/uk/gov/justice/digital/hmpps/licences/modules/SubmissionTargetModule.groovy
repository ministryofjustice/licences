package uk.gov.justice.digital.hmpps.licences.modules

import geb.Module


class SubmissionTargetModule extends Module {

    static content = {

        prison(required: false) { $("#premise") }
        city(required: false) { $("#city") }
        locality(required: false) { $("#locality") }
        postCode(required: false) { $("#postCode") }

        phones(required: false) { $("div", id: startsWith("phone")) }
    }
}
