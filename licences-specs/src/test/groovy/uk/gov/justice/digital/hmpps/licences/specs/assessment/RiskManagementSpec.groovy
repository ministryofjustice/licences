package uk.gov.justice.digital.hmpps.licences.specs.assessment

import geb.spock.GebReportingSpec
import spock.lang.Shared
import spock.lang.Stepwise
import uk.gov.justice.digital.hmpps.licences.pages.assessment.RiskManagementPage
import uk.gov.justice.digital.hmpps.licences.pages.TaskListPage
import uk.gov.justice.digital.hmpps.licences.util.Actions
import uk.gov.justice.digital.hmpps.licences.util.TestData

@Stepwise
class RiskManagementSpec extends GebReportingSpec {

  @Shared
  TestData testData = new TestData()

  @Shared
  Actions actions = new Actions()

  def setupSpec() {
    testData.loadLicence('assessment/unstarted')
    actions.logIn('RO')
  }

  def cleanupSpec() {
    actions.logOut()
  }

  def 'Options initially blank'() {

    given: 'At task list page'
    to TaskListPage, testData.markAndrewsBookingId

    when: 'I start the risk management task'
    taskListAction('Risk management').click()

    then: 'I see the risk management page'
    at RiskManagementPage

    and: 'The options are unset'
    riskManagementRadios.checked == null
    awaitingInformationRadios.checked == null
    addressSuitableRadios.checked == null
    nonDisclosableInformationRadios.checked == null
  }

  def 'Address suitability reasons shown when No'() {

    when: 'At risk management page'
    at RiskManagementPage

    then: 'I dont see the reason form'
    !addressSuitableForm.isDisplayed()

    when: 'I select no for address suitability'
    addressSuitableRadios.checked = 'No'

    then: 'I see the reason form'
    addressSuitableForm.isDisplayed()
  }

  def 'Non-disclosable information shown when Yes'() {

    when: 'At risk management page'
    at RiskManagementPage

    then: 'I dont see the non-disclosable text box'
    !nonDisclosableInformationForm.isDisplayed()

    when: 'I select yes for non-disclosable information'
    nonDisclosableInformationRadios.checked = 'Yes'

    then: 'I see the non-disclosable information text box'
    nonDisclosableInformationForm.isDisplayed()
  }



  def 'Modified choices are saved after save and continue'() {

    given: 'At risk management page'
    at RiskManagementPage

    when: 'I select new options'
    riskManagementRadios.checked = 'Yes'
    addressSuitableRadios.checked = 'No'

    and: 'I save and continue'
    find('#continueBtn').click()

    and: 'I return to the risk management page'
    to RiskManagementPage, testData.markAndrewsBookingId

    then: 'I see the previously entered values'
    riskManagementRadios.checked == 'Yes'
    addressSuitableRadios.checked == 'No'
  }
}
