package uk.gov.justice.digital.hmpps.licences.specs.finalchecks

import geb.spock.GebReportingSpec
import spock.lang.Shared
import spock.lang.Stepwise
import spock.lang.Unroll
import uk.gov.justice.digital.hmpps.Stage
import uk.gov.justice.digital.hmpps.licences.pages.CaselistPage
import uk.gov.justice.digital.hmpps.licences.pages.SendPage
import uk.gov.justice.digital.hmpps.licences.pages.SentPage
import uk.gov.justice.digital.hmpps.licences.pages.TaskListPage
import uk.gov.justice.digital.hmpps.licences.pages.assessment.CurfewHoursPage
import uk.gov.justice.digital.hmpps.licences.pages.assessment.LicenceConditionsStandardPage
import uk.gov.justice.digital.hmpps.licences.pages.assessment.RiskManagementPage
import uk.gov.justice.digital.hmpps.licences.pages.assessment.VictimLiaisonPage
import uk.gov.justice.digital.hmpps.licences.pages.finalchecks.ApprovedPremisesChoicePage
import uk.gov.justice.digital.hmpps.licences.pages.finalchecks.BassOfferPage
import uk.gov.justice.digital.hmpps.licences.pages.finalchecks.FinalChecksSeriousOffencePage
import uk.gov.justice.digital.hmpps.licences.pages.review.ReviewAddressPage
import uk.gov.justice.digital.hmpps.licences.pages.review.ReviewReportingPage
import uk.gov.justice.digital.hmpps.licences.util.Actions
import uk.gov.justice.digital.hmpps.licences.util.TestData

@Stepwise
class FinalChecksTaskListSpec extends GebReportingSpec {

  @Shared
  TestData testData = new TestData()
  @Shared
  Actions actions = new Actions()

  @Shared
  def tasks = [
    address    : 'Proposed curfew address',
    bass       : 'BASS address',
    curfewHours: 'Curfew hours',
    conditions : 'Additional conditions',
    risk       : 'Risk management',
    victim     : 'Victim liaison',
    reporting  : 'Reporting instructions',
    final      : 'Review case',
    postpone   : 'Postpone or refuse',
    submit     : 'Submit to decision maker'
  ]

  def setupSpec() {
    actions.logIn('CA')
  }

  def cleanupSpec() {
    actions.logOut()
  }

  @Stage
  def 'Shows details of the prisoner (from nomis)'() {

    when: 'I view the task list page'
    to TaskListPage, testData.markAndrewsBookingId

    then: 'I see the expected offender details data'
    offender.details.name == 'Mark Andrews'
    offender.details.nomisId == 'A5001DY'
    offender.details.dob == '22/10/1989'
    offender.details.externalLocation == 'HMP Albany'
    offender.details.offences == "Cause exceed max permitted wt of artic' vehicle - No of axles/configuration (No MOT/Manufacturer's Plate)"
    offender.details.crd == '15/10/2019'
    offender.details.hdced == '23/08/2019'
    offender.details.internalLocation == 'T-T1-001'
    offender.details.sed == '24/05/2020'
    offender.details.led == '02/05/2020'
    offender.details.pssed == '15/10/2020'
  }

  def 'Back link goes back to case list'() {

    when: 'I view the page'
    at TaskListPage

    and: 'I click the back to dashboard button'
    $('a', text: 'Back to case list').click()

    then: 'I go back to the dashboard'
    at CaselistPage
  }

  def 'Shows buttons for all tasks with correct label'() {

    given: 'An licence ready for final checks'
    testData.loadLicence('finalchecks/final-checks')

    when: 'I view the page'
    to TaskListPage, testData.markAndrewsBookingId

    then: 'I see 9 task buttons'
    taskListActions.size() == 9

    and: 'The tasks for reviewing RO input have View buttons'
    taskListActions.take(6)*.text() == ['Change', 'View/Edit', 'View/Edit', 'View/Edit', 'View/Edit', 'View']

    and: 'The final checks task has a Start button'
    taskListAction(tasks.final).text() == 'Start now'

    and: 'The postpone task has a Postpone button'
    taskListAction(tasks.postpone).text() == 'Postpone'
  }

  def 'Shows submit button when all tasks done'() {

    given: 'An licence ready for final checks'
    testData.loadLicence('finalchecks/final-checks-done')

    when: 'I view the page'
    to TaskListPage, testData.markAndrewsBookingId

    then: 'I see 10 task buttons'
    taskListActions.size() == 10

    and: 'The submit task has a Continue button'
    taskListAction(tasks.submit).text() == 'Continue'
  }

  @Unroll
  def '#label button links to #page'() {

    given: 'Viewing task list'
    to TaskListPage, testData.markAndrewsBookingId

    when: 'I start the task'
    taskListAction(task).click()

    then: 'I see the journey page'
    at page

    when: 'I click back'
    find('#backBtn').click()

    then: 'I return to the tasklist'
    at TaskListPage

    where:
    label          | task              | page
    'address'      | tasks.address     | ReviewAddressPage
    'curfew'       | tasks.curfewHours | CurfewHoursPage
    'conditions'   | tasks.conditions  | LicenceConditionsStandardPage
    'risk'         | tasks.risk        | RiskManagementPage
    'victim'       | tasks.victim      | VictimLiaisonPage
    'reporting'    | tasks.reporting   | ReviewReportingPage
    'final checks' | tasks.final       | FinalChecksSeriousOffencePage
    'submit'       | tasks.submit      | SendPage
  }

  def 'I can submit the licence to the DM'() {

    given: 'At task list'
    to TaskListPage, testData.markAndrewsBookingId

    when: 'I press submit to decision maker'
    taskListAction(tasks.submit).click()

    then: 'I see the submit to DM page'
    at SendPage

    and: 'I can click to submit'
    find('#continueBtn').click()

    then: 'I see the confirmation page'
    at SentPage

    when: 'I click return to case list'
    find('#backBtn').click()

    then: 'I return to the case list'
    at CaselistPage
  }

  def 'When address has been rejected other licence review tasks not shown'() {

    given: 'The address has been rejected'
    testData.loadLicence('finalchecks/address-rejected')

    when: 'I view the tasklist'
    to TaskListPage, testData.markAndrewsBookingId

    then: 'I see only address, submit'
    taskListActions.size() == 3
  }

  def 'BASS task button links to bass offer page'() {

    given: 'BASS has been requested'
    testData.loadLicence('finalchecks/bassOffer-unstarted')

    when: 'I view the task list'
    to TaskListPage, testData.markAndrewsBookingId

    then: 'I see the start now button for bass address'
    taskListAction(tasks.bass).text() == 'Start now'

    when: 'I start the task'
    taskListAction(tasks.bass).click()

    then: 'I see the BASS offer page'
    at BassOfferPage
  }

  def 'When BASS is rejected, can submit to DM for refusal'() {

    given: 'BASS offer is rejected'
    testData.loadLicence('finalchecks/bassOffer-unavailable')

    when: 'I view the task list'
    to TaskListPage, testData.markAndrewsBookingId

    then: 'I see only bass, refuse, submit'
    taskListActions.size() == 3

    and: 'I can only submit for refusal'
    $('h2', text: contains('Submit to decision maker')).closest('div').text().contains('Ready to submit for refusal')
  }

  def 'When Approved Premises required, does not show risk task'() {

    given: 'approved premises required'
    testData.loadLicence('finalchecks/approved-premises')

    when: 'I view the tasklist'
    to TaskListPage, testData.markAndrewsBookingId

    then: 'The risk task is not shown'
    taskListActions.size() == 8

    when: 'I view the curfew address task'
    taskListAction(tasks.address).click()

    then: 'I see the AP choice page'
    at ApprovedPremisesChoicePage
  }
}
