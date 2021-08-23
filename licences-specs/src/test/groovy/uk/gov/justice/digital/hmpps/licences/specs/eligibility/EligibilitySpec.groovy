package uk.gov.justice.digital.hmpps.licences.specs.eligibility

import geb.spock.GebReportingSpec
import spock.lang.Shared
import spock.lang.Stepwise
import uk.gov.justice.digital.hmpps.licences.pages.TaskListPage
import uk.gov.justice.digital.hmpps.licences.pages.eligibility.EligibilityExceptionalCircumstancesPage
import uk.gov.justice.digital.hmpps.licences.pages.eligibility.EligibilityExclusionPage
import uk.gov.justice.digital.hmpps.licences.pages.eligibility.EligibilitySuitabilityPage
import uk.gov.justice.digital.hmpps.licences.pages.eligibility.EligibilityTimeCheckPage
import uk.gov.justice.digital.hmpps.licences.util.Actions
import uk.gov.justice.digital.hmpps.licences.util.TestData

@Stepwise
class EligibilitySpec extends GebReportingSpec {
  private static final int EXCLUDED_REASON_COUNT = 10

  @Shared
  TestData testData = new TestData()
  @Shared
  Actions actions = new Actions()

  def setupSpec() {
    testData.loadLicence('eligibility/unstarted')
    actions.logIn('CA')
  }

  def cleanupSpec() {
    actions.logOut()
  }

  def 'Starts with nothing selected because there is no default'() {

    when: 'I view the eligibility checks page'
    to EligibilityExclusionPage, testData.markAndrewsBookingId

    then: 'Neither radio option is selected'
    excludedRadios.checked == null
  }

  def 'Reasons not shown when option is no'() {

    when: 'I view the eligibility checks page'
    at EligibilityExclusionPage

    then: 'I do not see reason options'
    !excludedReasonsForm.isDisplayed()
  }

  def 'Reasons are shown when option is yes'() {

    when: 'I view the eligibility checks page'
    at EligibilityExclusionPage

    and: 'I select yes for excluded'
    excludedRadios.checked = 'Yes'

    then: 'I see 8 reason options'
    excludedReasonsForm.isDisplayed()
    excludedReasons.size() == EXCLUDED_REASON_COUNT
  }

  def 'Shows previously saved values'() {

    given: 'Eligibility checks already done'
    testData.loadLicence('eligibility/unsuitable')

    when: 'I view the eligibility checks page'
    to EligibilityExclusionPage, testData.markAndrewsBookingId

    then: 'I see the previous values'
    excludedRadios.checked == 'No'
  }

  def 'Modified choices are not saved after return to tasklist'() {

    given: 'On the eligibility checks page'
    at EligibilityExclusionPage

    when: 'I select new options'
    excludedRadios.checked = 'Yes'
    excludedReasonsItem(0).check()
    excludedReasonsItem(1).check()
    excludedReasonsItem(EXCLUDED_REASON_COUNT-1).check()

    then: 'Those options are selected'
    excludedReasonsItem(0).checked
    excludedReasonsItem(1).checked
    excludedReasonsItem(EXCLUDED_REASON_COUNT-1).checked

    when: 'I choose return to tasklist'
    find('#backBtn').click()
    at TaskListPage

    and: 'I view the eligibility checks page'
    to EligibilityExclusionPage, testData.markAndrewsBookingId

    then: 'I see the original values'
    excludedRadios.checked == 'No'
    excludedReasonsItem(0).unchecked
    excludedReasonsItem(1).unchecked
    excludedReasonsItem(EXCLUDED_REASON_COUNT-1).unchecked
  }

  def 'All selections are saved and shown on the task list'() {

    given: 'On the eligibility checks page'
    to EligibilityExclusionPage, testData.markAndrewsBookingId

    when: 'I select new exclusion options and save'
    excludedRadios.checked = 'No'
    waitFor { continueBtn.present }
    continueBtn.click()
    at EligibilitySuitabilityPage

    and: 'I select new suitability options and save'
    unsuitableRadios.checked = 'No'
    find('#continueBtn').click()
    at EligibilityTimeCheckPage

    and: 'I select new remaining time options and save'
    crdTimeRadios.checked = 'No'
    find('#continueBtn').click()

    then: 'I return to the task list page'
    at TaskListPage

    and: 'I can see my saved answers'
    excludedAnswer.text() == 'No'
    unsuitableAnswer.text() == 'No'
    crdTimeAnswer.text() == 'No'
  }

  def 'Returns to task list when excluded'() {

    given: 'On the eligibility checks page'
    to EligibilityExclusionPage, testData.markAndrewsBookingId

    when: 'I choose excluded'
    excludedRadios.checked = 'Yes'
    excludedReasonsItem(0).check()
    find('#continueBtn').click()

    then: 'I am taken to the task list'
    at TaskListPage

    and: 'Subsequent answers are NA'
    excludedAnswer.text() == 'Yes'
    unsuitableAnswer.text() == 'N/A'
    crdTimeAnswer.text() == 'N/A'
  }

  def 'Returns to task list when unsuitable'() {

    given: 'On the eligibility checks page'
    to EligibilityExclusionPage, testData.markAndrewsBookingId

    when: 'I choose not excluded'
    excludedRadios.checked = 'No'
    find('#continueBtn').click()

    and: 'I choose unsuitable'
    at EligibilitySuitabilityPage
    unsuitableRadios.checked = 'Yes'
    unsuitableReasonsItem(0).check()
    find('#continueBtn').click()

    then: 'I see the exceptional circumstances page'
    at EligibilityExceptionalCircumstancesPage

    when: 'I choose an answer'
    exceptionalCircumstancesRadios.checked = 'Yes'
    find('#continueBtn').click()

    then: 'I am taken to the crd time page'
    at EligibilityTimeCheckPage

    when: 'I choose an answer'
    crdTimeRadios.checked = 'No'
    find('#continueBtn').click()

    then: 'I am taken to the task list'
    at TaskListPage

    and: 'Subsequent answers are as answered'
    excludedAnswer.text() == 'No'
    unsuitableAnswer.text() == 'Yes'
    exceptionalCircumstanceAnswer.text() == 'Yes'
    crdTimeAnswer.text() == 'No'
  }
}
