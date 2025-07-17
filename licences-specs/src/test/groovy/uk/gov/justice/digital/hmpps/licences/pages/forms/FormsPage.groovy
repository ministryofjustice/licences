package uk.gov.justice.digital.hmpps.licences.pages.forms

import geb.Page
import uk.gov.justice.digital.hmpps.licences.modules.HeaderModule
import uk.gov.justice.digital.hmpps.licences.modules.OffenderDetailsModule

class FormsPage extends Page {
  static url = '/hdc/forms'

  static at = {
    browser.currentUrl.contains(url)
  }

  static content = {

    header { module(HeaderModule) }

    offender { module(OffenderDetailsModule) }

    formLinks { $("#printableForms li a")}

    emoServiceLink { $("#electronicMonitoringOrder")}
  }
}
