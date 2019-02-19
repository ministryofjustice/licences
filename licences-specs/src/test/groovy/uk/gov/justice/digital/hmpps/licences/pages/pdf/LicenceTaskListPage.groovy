package uk.gov.justice.digital.hmpps.licences.pages.pdf

import geb.Page
import geb.module.Select

class LicenceTaskListPage extends Page {

  static url = '/hdc/pdf/taskList'

  static at = {
    browser.currentUrl.contains(url)
  }

  static content = {

  }
}
