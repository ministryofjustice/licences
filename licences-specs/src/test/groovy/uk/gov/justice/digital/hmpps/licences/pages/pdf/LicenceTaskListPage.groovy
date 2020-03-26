package uk.gov.justice.digital.hmpps.licences.pages.pdf

import geb.Page
import geb.module.RadioButtons

class LicenceTaskListPage extends Page {

  static url = '/hdc/pdf/taskList'

  static at = {
    browser.currentUrl.contains(url)
  }

  static content = {
    backToDm {$('#backToDm')}
  }
}


