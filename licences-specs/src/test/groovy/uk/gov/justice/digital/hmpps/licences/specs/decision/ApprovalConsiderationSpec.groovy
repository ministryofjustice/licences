package uk.gov.justice.digital.hmpps.licences.specs.decision

import geb.spock.GebReportingSpec
import spock.lang.Shared
import spock.lang.Stepwise
import spock.lang.Retry
import uk.gov.justice.digital.hmpps.licences.pages.TaskListPage
import uk.gov.justice.digital.hmpps.licences.pages.decision.ApprovalConsiderationPage
import uk.gov.justice.digital.hmpps.licences.pages.decision.ApprovalReleasePage
import uk.gov.justice.digital.hmpps.licences.util.Actions
import uk.gov.justice.digital.hmpps.licences.util.TestData

@Stepwise
@Retry
class ApprovalConsiderationSpec extends GebReportingSpec {

  @Shared
  TestData testData = new TestData()
  @Shared
  Actions actions = new Actions()

  def setupSpec() {
    testData.loadLicence('decision/unstarted')
    actions.logIn('DM')
  }

  def cleanupSpec() {
    actions.logOut()
  }

  def 'Starts with nothing selected'() {

    when: 'I view the consideration page'
    to ApprovalConsiderationPage, testData.testBookingId

    then: 'Neither radio option is selected'
    considerationRadios.checked == null
  }

  def 'Shows previously saved values'() {

    given: 'already selected Yes to considered'
    testData.loadLicence('decision/consideration')

    when: 'I view the DM consideration page'
    to ApprovalConsiderationPage, testData.testBookingId

    then: 'I see the previous values'
    considerationRadios.checked == 'Yes'
  }

  def 'Returns to task list if No selected'() {
    testData.loadLicence('decision/unstarted')

    when: 'I view the consideration page'
    to ApprovalConsiderationPage, testData.testBookingId

    and: 'I select No and continue'
    considerationRadios.checked = 'No'
    saveAndContinue.click()

    then: 'I am returned to the task list'
    at TaskListPage

    and: 'I see the correct label'
    taskListLabel('Final decision', "Consider changes to offender's circumstances") == true
  }

  def 'Selecting Yes retains the Not Started task list label'() {

    when: 'I view the consideration page'
    to ApprovalConsiderationPage, testData.testBookingId

    and: 'I select Yes and continue'
    considerationRadios.checked = 'Yes'
    saveAndContinue.click()

    then: 'I navigate to the tasklist'
    to TaskListPage , testData.testBookingId

    and: 'I see the correct label'
    taskListLabel('Final decision', "Not started") == true
  }

  def 'Continues to approval if Yes selected'() {

    when: 'I view the consideration page'
    to ApprovalConsiderationPage, testData.testBookingId

    considerationRadios.checked = 'Yes'
    saveAndContinue.click()

    then: 'I am returned to the Approval Release page'
    at ApprovalReleasePage
  }
}
