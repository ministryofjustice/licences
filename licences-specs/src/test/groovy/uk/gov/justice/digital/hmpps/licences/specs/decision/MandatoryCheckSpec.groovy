package uk.gov.justice.digital.hmpps.licences.specs.decision

import geb.spock.GebReportingSpec
import spock.lang.Shared
import spock.lang.Stepwise
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

  def 'Mandatory check page is displayed before approval release page when Mandatory risk check has not been completed'() {

    given: 'Mandatory check not complete'
    testData.loadLicence('decision/mandatory-check-required')

    when: 'I view the mandatory check page'
    to ApprovalMandatoryCheckPage, testData.markAndrewsBookingId

    and: 'I click the continue button'
    $('#continueBtn').click()

    then: 'I go to the approval release page'
    at ApprovalReleasePage
  }
}
