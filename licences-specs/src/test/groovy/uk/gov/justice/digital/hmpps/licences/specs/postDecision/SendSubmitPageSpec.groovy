package uk.gov.justice.digital.hmpps.licences.specs.postDecision

import geb.spock.GebReportingSpec
import spock.lang.Shared
import spock.lang.Stepwise
import uk.gov.justice.digital.hmpps.licences.pages.CaselistPage
import uk.gov.justice.digital.hmpps.licences.pages.TaskListPage
import uk.gov.justice.digital.hmpps.licences.pages.SendResubmitPage
import uk.gov.justice.digital.hmpps.licences.pages.SentResubmitPage
import uk.gov.justice.digital.hmpps.licences.util.Actions
import uk.gov.justice.digital.hmpps.licences.util.TestData

@Stepwise
class SendSubmitPageSpec extends GebReportingSpec {

  @Shared
  TestData testData = new TestData()

  @Shared
  Actions actions = new Actions()

  def setupSpec() {
    actions.logIn('CA')
  }

  def cleanupSpec() {
    actions.logOut()
  }

  def 'Can navigate to the Send for Reconsideration page and back to tasklist'() {

    given: 'An approved licence'
    testData.loadLicence('decision/approved')

    when: 'I view the task list page'
    to TaskListPage, testData.testBookingId

    then: 'I click the back to Resubmit button'
    resubmit.click()

    then: 'I am taken to the Send for reconsideration page'
    at SendResubmitPage

    when: 'I click the return button'
    $('#backBtn').click()

    then: 'I go back to the tasklist page'
    at TaskListPage

  }

   def 'Can navigate to the Sent for Reconsideration page'() {

    given: 'An approved licence'
    testData.loadLicence('decision/approved')

    when: 'I view the task list page'
    to TaskListPage, testData.testBookingId

    then: 'I click the to Resubmit button'
    resubmit.click()

    then: 'I am taken to the Send for reconsideration page'
    at SendResubmitPage

    when: 'I click the submit button'
    $('#continueBtn').click()

    then: 'I go to the Sent for reconsideration page'
    at SentResubmitPage

  }
}