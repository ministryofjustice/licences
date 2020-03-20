package uk.gov.justice.digital.hmpps.licences.pages.assessment

import geb.Page
import geb.module.RadioButtons
import uk.gov.justice.digital.hmpps.licences.modules.HeaderModule

class TaskListPage extends Page {

  static url = '/hdc/taskList'

  static at = {
    browser.currentUrl.contains(url)
  }


  static content = { }

  
}
