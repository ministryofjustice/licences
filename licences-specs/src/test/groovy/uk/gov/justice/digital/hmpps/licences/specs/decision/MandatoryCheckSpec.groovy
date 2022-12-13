package uk.gov.justice.digital.hmpps.licences.specs.decision

import geb.spock.GebReportingSpec
import spock.lang.Shared
import spock.lang.Stepwise
import uk.gov.justice.digital.hmpps.licences.pages.TaskListPage
import uk.gov.justice.digital.hmpps.licences.pages.decision.ApprovalMandatoryCheckPage
import uk.gov.justice.digital.hmpps.licences.pages.decision.ApprovalRefusePage
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

  def 'Mandatory Check warning shown when mandatory risk check had not been completed '() {

    given: 'Mandatory check not complete'
    testData.loadLicence('decision/mandatory-check-required')

    when: 'I view the mandatory check page'
    at ApprovalMandatoryCheckPage, testData.markAndrewsBookingId

    and: 'I click the return button'
    $('#backBtn').click()

    then: 'I go back to the tasklist page'
    at TaskListPage
  }
}
