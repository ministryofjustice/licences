package uk.gov.justice.digital.hmpps.licences.specs.assessment

import geb.spock.GebReportingSpec
import spock.lang.Shared
import spock.lang.Stepwise
import uk.gov.justice.digital.hmpps.licences.pages.assessment.RiskManagementV3Page
import uk.gov.justice.digital.hmpps.licences.pages.TaskListPage
import uk.gov.justice.digital.hmpps.licences.util.Actions
import uk.gov.justice.digital.hmpps.licences.util.TestData

@Stepwise
class RiskManagementV3Spec extends GebReportingSpec {

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
    to TaskListPage, testData.testBookingId

    when: 'I start the risk management task'
    taskListAction('Risk management').click()

    then: 'I see the risk management page'
    at RiskManagementV3Page

    and: 'The options are unset'
    hasConsideredChecksRadios.checked == null
    awaitingOtherInformationRadios.checked == null
    addressSuitableRadios.checked == null
    manageInTheCommunityRadios.checked == null
    mentalHealthPlanRadios.checked == null
    pomConsultationRadios.checked == null
    nonDisclosableInformationRadios.checked == null
  }

  def 'Address suitability reasons shown when No'() {

    when: 'At risk management page'
    at RiskManagementV3Page

    then: 'I dont see the reason form'
    !addressSuitableForm.isDisplayed()

    when: 'I select no for address suitability'
    addressSuitableRadios.checked = 'No'

    then: 'I see the reason form'
    addressSuitableForm.isDisplayed()
  }

  def 'EMS Information radios shown when address suitable is Yes'() {

    when: 'At risk management page'
    at RiskManagementV3Page

    then: 'I dont see the EMS information radio buttons'
    !emsInformationForm.isDisplayed()

    when: 'I select Yes for address suitability'
    addressSuitableRadios.checked = 'Yes'

    then: 'I see the EMS Information buttons'
    emsInformationForm.isDisplayed()
  }

  def 'EMS Information text box shown when address suitable is Yes'() {

    when: 'At risk management page'
    at RiskManagementV3Page
    and: 'I select Yes for address suitability'
    addressSuitableRadios.checked = 'Yes'

    then: 'I see the EMS Information buttons'
    emsInformationForm.isDisplayed()
    !emsInformationDetails.isDisplayed()

    when: 'I select No'
    emsInformationRadios.checked = 'No'

    then: 'I do not see the EMS information text box'
    !emsInformationDetails.isDisplayed()

    when: 'I select Yes'
    emsInformationRadios.checked = 'Yes'

    then: 'I see the EMS Information text box'
    emsInformationDetails.isDisplayed()
  }

  def 'Managing offender in the community not possible reasons shown when No'() {

    when: 'At risk management page'
    at RiskManagementV3Page

    then: 'I dont see the reason form'
    !manageInTheCommunityNotPossibleForm.isDisplayed()

    when: 'I select no for managing offender in the community'
    manageInTheCommunityRadios.checked = 'No'

    then: 'I see the reason form'
    manageInTheCommunityNotPossibleForm.isDisplayed()
  }

  def 'Mental health plan question to check consulted with prison healthcare shown when Yes'() {

    when: 'At risk management page'
    at RiskManagementV3Page

    then: 'I dont see the consulted with prison healthcare question'
    !prisonHealthcareConsultationRadios.isDisplayed()

    when: 'I select yes for mental health plan essential on release'
    mentalHealthPlanRadios.checked = 'Yes'

    then: 'I see the reason form'
    prisonHealthcareConsultationRadios.isDisplayed()
  }

  def 'Non-disclosable information shown when Yes'() {

    when: 'At risk management page'
    at RiskManagementV3Page

    then: 'I don\'t see the non-disclosable text box'
    !nonDisclosableInformationForm.isDisplayed()

    when: 'I select yes for non-disclosable information'
    nonDisclosableInformationRadios.checked = 'Yes'

    then: 'I see the non-disclosable information text box'
    nonDisclosableInformationForm.isDisplayed()
  }

  def 'Modified choices are saved after save and continue'() {

    given: 'At risk management page'
    at RiskManagementV3Page

    when: 'I select new options'
    hasConsideredChecksRadios.checked = 'Yes'
    addressSuitableRadios.checked = 'No'
    pomConsultationRadios.checked = 'Yes'

    and: 'I save and continue'
    find('#continueBtn').click()

    and: 'I return to the risk management page'
    to RiskManagementV3Page, testData.testBookingId

    then: 'I see the previously entered values'
    hasConsideredChecksRadios.checked == 'Yes'
    addressSuitableRadios.checked == 'No'
    pomConsultationRadios.checked == 'Yes'
  }
}
