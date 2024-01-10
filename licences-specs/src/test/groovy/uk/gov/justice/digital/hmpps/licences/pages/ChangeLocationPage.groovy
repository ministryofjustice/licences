package uk.gov.justice.digital.hmpps.licences.pages

import geb.Page
import uk.gov.justice.digital.hmpps.licences.modules.HeaderModule

class ChangeLocationPage extends Page {

  static url = '/user'

  static at = {
    browser.currentUrl.contains(url)
  }

  static content = {

    header { module(HeaderModule) }

    selector { $('#selectCaseLoad') }

    submit { $('#continueBtn') }
  }
}
