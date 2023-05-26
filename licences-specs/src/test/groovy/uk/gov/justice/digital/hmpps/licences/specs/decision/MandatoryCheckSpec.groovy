package uk.gov.justice.digital.hmpps.licences.specs.decision

import geb.spock.GebReportingSpec
import spock.lang.Shared
import spock.lang.Stepwise
import uk.gov.justice.digital.hmpps.licences.pages.TaskListPage
import uk.gov.justice.digital.hmpps.licences.pages.decision.ApprovalMandatoryCheckPage
import uk.gov.justice.digital.hmpps.licences.pages.decision.ApprovalReleasePage
import uk.gov.justice.digital.hmpps.licences.pages.decision.ApprovalConsiderationPage
import uk.gov.justice.digital.hmpps.licences.util.Actions
import uk.gov.justice.digital.hmpps.licences.util.TestData

@Stepwise
class MandatoryCheckSpec extends GebReportingSpec {

  @Shared
  TestData testData = new TestData()
  @Shared
  Actions actions = new Actions()

  def setupSpec() {
    actions.logIn('DM')
  }

  def cleanupSpec() {
    actions.logOut()
  }

  def 'Mandatory check page is displayed when mandatory address checks not completed'() {

    given: 'At tasklist page but mandatory check not complete'
    testData.loadLicence('decision/mandatory-check-required')
    to TaskListPage, testData.markAndrewsBookingId

    when: 'I click the final decision continue button'
    taskListAction('Final decision').click()

    then: 'I see the mandatory checks page'
    at ApprovalMandatoryCheckPage
  }

  def 'Return to the tasklist page from the mandatory check page'() {

    given: 'At mandatory check page'
    testData.loadLicence('decision/mandatory-check-required')
    at ApprovalMandatoryCheckPage

    when: 'I click the return to checklist button'
    $('#returnToChecklistBtn').click()

    then: 'I go to the task list page'
    at TaskListPage
  }

  def 'Mandatory check page is not displayed when mandatory address checks are completed'() {

    given: 'At tasklist page when mandatory check is complete'
    testData.loadLicence('decision/mandatory-check-completed')
    to TaskListPage, testData.markAndrewsBookingId

    when: 'I click the final decision continue button'
    taskListAction('Final decision').click()

    then: 'I do not see the mandatory checks page and I go to the approval consideration page'
    at ApprovalConsiderationPage
  }

}
