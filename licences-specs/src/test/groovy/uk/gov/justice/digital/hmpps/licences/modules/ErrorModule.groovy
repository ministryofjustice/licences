package uk.gov.justice.digital.hmpps.licences.modules

import geb.Module


class ErrorModule extends Module {

  static content = {
    heading(required: false) { $('#error-summary-heading') }
  }
}
