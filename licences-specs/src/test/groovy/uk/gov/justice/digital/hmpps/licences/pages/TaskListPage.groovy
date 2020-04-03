package uk.gov.justice.digital.hmpps.licences.pages

import geb.Page
import uk.gov.justice.digital.hmpps.licences.modules.HeaderModule
import uk.gov.justice.digital.hmpps.licences.modules.OffenderDetailsModule

class TaskListPage extends Page {

  static url = '/hdc/taskList'

  static at = {
    browser.currentUrl.contains(url)
  }

  static content = {
    header { module(HeaderModule) }

    offender { module(OffenderDetailsModule) }

    eligibilityCheckStartButton(required: false) { $('#eligibilityCheckStart') }
    eligibilityCheckUpdateLink(required: false) { $('#eligibilityCheckUpdate') }

    excludedAnswer(required: false) { $('#excludedAnswer') }
    unsuitableAnswer(required: false) { $('#unsuitableAnswer') }
    crdTimeAnswer(required: false) { $('#crdTimeAnswer') }
    exceptionalCircumstanceAnswer(required: false) { $('#exceptionalCircumstances') }

    printEligibilityFormButton(required: false) { $('#eligibilityFormPrint') }
    eligibilityFormPrintStatusText(required: false) { $('#eligibilityFormPrintStatusText') }
    eligibilityFormPrintStatusIcon(required: false) { $('#eligibilityFormPrintStatusIcon') }

    printAddressFormButton(required: false) { $('#addressFormPrint') }
    addressFormPrintStatusText(required: false) { $('#addressFormPrintStatusText') }
    addressFormPrintStatusIcon(required: false) { $('#addressFormPrintStatusIcon') }

    taskListActions(required: false) { $('.taskListAction') }

    taskListAction(required: false) { taskName ->
      $('h2', text: contains(taskName)).closest('div').next().find('.taskListAction')
    }

    eligibilityTaskListAction(required: false) {
      $('h2', text: contains('Check eligibility')).closest('div').find('.taskListAction')
    }

    errorSummary(required: false) { $('#error-summary-heading') }
    errorBanner(required: false) { $('.error-banner') }

    warnings(required: false) { find('.warning')*.text() }

    formsLink(required: false) { $('a.forms-link') }

    postpone(required: false) {$("a[data-qa='postpone']")}

    resubmit(required: false) {$("a[data-qa='resubmit']")}

    createLicence(required: false) {$("a[data-qa='continue']")}

  }
}
