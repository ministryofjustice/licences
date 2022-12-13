package uk.gov.justice.digital.hmpps.licences.specs.decision

import geb.spock.GebReportingSpec
import spock.lang.Shared
import spock.lang.Stepwise
import uk.gov.justice.digital.hmpps.licences.pages.TaskListPage
import uk.gov.justice.digital.hmpps.licences.pages.decision.ApprovalMandatoryCheckPage
import uk.gov.justice.digital.hmpps.licences.pages.decision.ApprovalReleasePage
import uk.gov.justice.digital.hmpps.licences.util.Actions
import uk.gov.justice.digital.hmpps.licences.util.TestData

@Stepwise
class MandatoryCheckSpec extends GebReportingSpec {

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

  def 'Incomplete mandatory checks - continue journey'() {

    given: 'Mandatory check not complete'
    testData.loadLicence('decision/mandatory-check-required')

    when: 'I view the mandatory check page'
    to ApprovalMandatoryCheckPage, testData.markAndrewsBookingId

    and: 'I click the continue button'
    find('#continueBtn').click()

    then: 'I go to the approval release page'
    at ApprovalReleasePage
  }

  def 'Incomplete mandatory checks - return to task list journey'() {

    given: 'Mandatory check not complete'
    testData.loadLicence('decision/mandatory-check-required')

    when: 'I view the mandatory check page'
    to ApprovalMandatoryCheckPage, testData.markAndrewsBookingId

    and: 'I click the Return to task list button'
    $('#backBtn',1).click()

    then: 'I go to the task list page'
    at TaskListPage
  }
}
