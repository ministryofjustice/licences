package uk.gov.justice.digital.hmpps.licences.specs.decision

import geb.spock.GebReportingSpec
import spock.lang.Shared
import spock.lang.Stepwise
import uk.gov.justice.digital.hmpps.licences.pages.TaskListPage
import uk.gov.justice.digital.hmpps.licences.util.Actions
import uk.gov.justice.digital.hmpps.licences.util.TestData
import uk.gov.justice.digital.hmpps.licences.pages.review.ReviewConditionsPage

@Stepwise
class ApprovalTaskListSpec extends GebReportingSpec {

  @Shared
  TestData testData = new TestData()
  @Shared
  Actions actions = new Actions()

  @Shared
  def tasks = [
    address   : 'Proposed curfew address',
    conditions: 'Additional conditions',
    risk      : 'Risk management and victim liaison',
    reporting : 'Reporting instructions',
    returnPca : 'Return to PCA',
    decision  : 'Final decision'
  ]

  def setupSpec() {
    actions.logIn('DM')
  }

  def cleanupSpec() {
    actions.logOut()
  }

  def 'Shows buttons for all tasks with correct label'() {

    given: 'A licence ready for final checks'
    testData.loadLicence('decision/unstarted')

    when: 'I view the page'
    to TaskListPage, testData.markAndrewsBookingId

    then: 'I see the right number of task buttons'
    taskListActions.size() == 9

    and: 'The tasks for reviewing RO and CA input have View buttons'
    taskListActions.take(7).every { it.text() == 'View' }

    and: 'The final decision task has a Continue button'
    taskListAction(tasks.decision).text() == 'Continue'
  }

  def 'Additional conditions are read only'() {
    when: 'I am on the Additional conditions page'
    to ReviewConditionsPage, testData.markAndrewsBookingId

    then: 'The licence conditions details are view only'
    conditions.additional.size() == 2
    conditions.additional.findAll{ it.editControl }.size() == 0
    conditions.additional.findAll{ it.deleteControl }.size() == 0
  }

  def 'When address has been rejected, reduced task set shown'() {

    given: 'The address has been rejected'
    testData.loadLicence('decision/address-rejected')

    when: 'I view the tasklist'
    to TaskListPage, testData.markAndrewsBookingId

    then: 'I see only eligibility, address, Risk Management return to PCA, refuse'
    taskListActions.size() == 5

    and: 'I can only refuse the licence'
    taskListAction(tasks.decision).text() == 'Refuse HDC'
  }

  def 'When CRD time insufficent, reduced task set shown'() {

    given: 'The address has been rejected'
    testData.loadLicence('decision/insufficientTime')

    when: 'I view the tasklist'
    to TaskListPage, testData.markAndrewsBookingId

    then: 'I see only eligibility, refuse'
    taskListActions.size() == 2

    and: 'I can only refuse the licence'
    taskListAction(tasks.decision).text() == 'Refuse HDC'
  }
}
