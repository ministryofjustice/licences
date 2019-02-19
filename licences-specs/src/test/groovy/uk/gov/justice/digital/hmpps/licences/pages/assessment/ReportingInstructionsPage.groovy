package uk.gov.justice.digital.hmpps.licences.pages.assessment

import geb.Page
import uk.gov.justice.digital.hmpps.licences.modules.HeaderModule

class ReportingInstructionsPage extends Page {

  static url = '/hdc/reporting/reportingInstructions'

  static at = {
    browser.currentUrl.contains(url)
  }

  static content = {
    header { module(HeaderModule) }

    name { $('#name') }
    street { $('#building') }
    town { $('#town') }
    postcode { $('#postcode') }
    telephone { $('#telephone') }
  }
}
