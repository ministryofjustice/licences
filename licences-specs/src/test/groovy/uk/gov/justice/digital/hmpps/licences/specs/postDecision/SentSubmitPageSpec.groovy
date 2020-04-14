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
class SentSubmitPageSpec extends GebReportingSpec {

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

  def 'Can navigate to the Sent for Reconsideration page'() {

    given: 'An approved licence'
    testData.loadLicence('decision/approved')

    when: 'I view the task list page'
    to TaskListPage, testData.markAndrewsBookingId

    then: 'I click the to Resubmit button'
    resubmit.click()

    then: 'I am taken to the Send for reconsideration page'
    at SendResubmitPage

    when: 'I click the submit button'
    $('#continueBtn').click()

    then: 'I go to the Sent for reconsideration page'
    at SentResubmitPage
  }

  def 'Can navigate to the back to caselist'() {

    given: 'I am at the Sent for reconsideration page'
    at SentResubmitPage

    when: 'I click the Return to Caselist button'
    $('#backBtn').click()

    then: 'I go back to the caselist page'
    at CaselistPage
  }
}