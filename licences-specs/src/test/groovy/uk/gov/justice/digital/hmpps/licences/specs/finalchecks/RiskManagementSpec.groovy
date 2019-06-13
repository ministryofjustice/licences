package uk.gov.justice.digital.hmpps.licences.specs.finalchecks

import geb.spock.GebReportingSpec
import spock.lang.Shared
import spock.lang.Stepwise
import uk.gov.justice.digital.hmpps.licences.pages.TaskListPage
import uk.gov.justice.digital.hmpps.licences.pages.assessment.RiskManagementPage
import uk.gov.justice.digital.hmpps.licences.util.Actions
import uk.gov.justice.digital.hmpps.licences.util.TestData

@Stepwise
class RiskManagementSpec extends GebReportingSpec {

  @Shared
  TestData testData = new TestData()

  @Shared
  Actions actions = new Actions()

  def setupSpec() {
    testData.loadLicence('assessment/risks-nonDisclosableInformation')
    actions.logIn('CA')
  }

  def cleanupSpec() {
    actions.logOut()
  }


  def 'Non-disclosable information shown when Yes'() {

    given: 'At task list page'
    to TaskListPage, testData.markAndrewsBookingId

    when: 'I start the risk management task'
    taskListAction('Risk management').click()

    then: 'I see the risk management page'
    at RiskManagementPage

    then: 'I see the non-disclosable information text box'
    nonDisclosableInformationView.isDisplayed()
  }
}
