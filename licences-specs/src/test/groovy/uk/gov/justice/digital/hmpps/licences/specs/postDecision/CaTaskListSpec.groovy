package uk.gov.justice.digital.hmpps.licences.specs.postDecision

import geb.spock.GebReportingSpec
import spock.lang.Shared
import spock.lang.Stepwise
import spock.lang.Unroll
import uk.gov.justice.digital.hmpps.licences.pages.CaselistPage
import uk.gov.justice.digital.hmpps.licences.pages.TaskListPage
import uk.gov.justice.digital.hmpps.licences.pages.assessment.*
import uk.gov.justice.digital.hmpps.licences.pages.SendResubmitPage
import uk.gov.justice.digital.hmpps.licences.pages.eligibility.EligibilityExclusionPage
import uk.gov.justice.digital.hmpps.licences.pages.finalchecks.BassOfferPage
import uk.gov.justice.digital.hmpps.licences.pages.finalchecks.FinalChecksSeriousOffencePage
import uk.gov.justice.digital.hmpps.licences.pages.pdf.LicenceTemplatePage
import uk.gov.justice.digital.hmpps.licences.pages.review.ReviewAddressPage
import uk.gov.justice.digital.hmpps.licences.util.Actions
import uk.gov.justice.digital.hmpps.licences.util.TestData

@Stepwise
class CaTaskListSpec extends GebReportingSpec {

  @Shared
  TestData testData = new TestData()

  @Shared
  Actions actions = new Actions()

  @Shared
  def tasks = [
    eligibility : 'Eligibility and presumed suitability',
    address     : 'Proposed curfew address',
    bass        : 'CAS2 address',
    conditions  : 'Additional conditions',
    risk        : 'Risk management',
    victim      : 'Victim liaison',
    reporting   : 'Reporting instructions',
    curfew      : 'Curfew hours',
    finalChecks : 'Review case',
    postponement: 'Postponement',
    create      : 'Create licence',
    submit      : 'Submit to prison case admin',
    resubmit    : 'Resubmit to DM'
  ]

  def setupSpec() {
    actions.logIn('CA')
  }

  def cleanupSpec() {
    actions.logOut()
  }

  def 'Back link goes back to case list'() {

    given: 'An approved licence'
    testData.loadLicence('decision/approved')

    when: 'I view the task list page'
    to TaskListPage, testData.testBookingId

    and: 'I click the back to dashboard button'
    $('a', text: 'Back to case list').click()

    then: 'I go back to the dashboard'
    at CaselistPage
  }

  def 'Shows correct button labels for tasks when HDC APPROVED'() {

    when: 'I view the task list'
    to TaskListPage, testData.testBookingId

    then: 'I see the task buttons and the submit button'
    taskListActions.size() == 12

    and: 'All editable tasks have View/Edit buttons'
    taskListActions.take(7).every { it.text() == 'View/Edit' }

    and: 'Final checks task is view only'
    taskListAction(tasks.finalChecks).text() == 'Change'

    and: 'Resubmit to Dm is availablee'
    taskListAction(tasks.resubmit).text() == 'Resubmit'

    and: 'create licence is available'
    taskListAction(tasks.create).text() == 'Continue'
  }

  @Unroll
  def '#task button links to page - HDC approved'() {

    given: 'Viewing task list'
    to TaskListPage, testData.testBookingId

    when: 'I start the task'
    taskListAction(task).click()

    then: 'I see the journey page'
    at page

    where:
    task              | page
    tasks.eligibility | EligibilityExclusionPage
    tasks.address     | ReviewAddressPage
    tasks.risk        | RiskManagementV1Page
    tasks.victim      | VictimLiaisonPage
    tasks.curfew      | CurfewHoursPage
    tasks.conditions  | LicenceConditionsStandardPage
    tasks.reporting   | ReportingInstructionsPage
    tasks.finalChecks | FinalChecksSeriousOffencePage
    tasks.create      | LicenceTemplatePage
    tasks.resubmit    | SendResubmitPage

  }

  def 'When address is withdrawn, can only send to DM for refusal'() {

    when: 'I withdraw the address'
    to TaskListPage, testData.testBookingId
    taskListAction(tasks.address).click()
    $('#withdrawConsent').click()

    and: 'I view the taskist'
    to TaskListPage, testData.testBookingId

    then: 'I can only submit for refusal'
    $('h2', text: contains('Submit to decision maker')).closest('div').text().contains('Ready to submit for refusal')
  }

  def 'When address is reinstated, can resume creating licence'() {

    when: 'I reinstate the address'
    to TaskListPage, testData.testBookingId
    taskListAction(tasks.address).click()
    $('#reinstate').click()
    $('#withdrawConsent').click()

    and: 'I view the taskist'
    to TaskListPage, testData.testBookingId

    then: 'I see the full tasklist and the create licence task'
    taskListActions.size() == 12
    taskListAction(tasks.create).text() == 'Continue'
  }

  def 'When address is withdrawn and a new one added, I can only submit to RO'() {

    given: 'Address has been withdrawn and a new one added'
    testData.loadLicence('postDecision/address-withdrawn-new')

    when: 'I view the tasklist'
    to TaskListPage, testData.testBookingId

    then: 'I can only submit to RO'
    $('h2', text: contains('Submit curfew address')).closest('div').text().contains('Ready to submit')
  }

  def 'BASS task shown when BASS referral'() {

    given: 'An approved licence for BASS referral'
    testData.loadLicence('decision/approved-bass')

    when: 'I view the task list page'
    to TaskListPage, testData.testBookingId

    then: 'I see the BASS task'
    taskListAction(tasks.bass).text() == 'Change'

    when: 'I start the task'
    taskListAction(tasks.bass).click()

    then: 'I see the BASS offer page'
    at BassOfferPage
  }



  def 'Shows correct button labels for tasks when HDC REFUSED'() {
    given: 'An refused licence'
    testData.loadLicence('decision/refused')

    when: 'I view the task list'
    to TaskListPage, testData.testBookingId

    then: 'I see the task buttons and the submit button'
    taskListActions.size() == 9

    and: 'All editable tasks have View/Edit buttons'
    taskListActions.take(7).every { it.text() == 'View/Edit' }

    and: 'Final checks task is view only'
    taskListAction(tasks.finalChecks).text() == 'Change'

    and: 'Resubmit to Dm is available'
    taskListAction(tasks.resubmit).text() == 'Resubmit'

    and: 'Postpone/Refuse button is not displayed'
    !postpone.displayed

    and: 'Create Licence is not displayed'
    !createLicence.displayed


  }

  @Unroll
  def '#task button links to page HDC rejected'() {

    given: 'Viewing task list'
    to TaskListPage, testData.testBookingId

    when: 'I start the task'
    taskListAction(task).click()

    then: 'I see the journey page'
    at page

    where:
    task              | page
    tasks.eligibility | EligibilityExclusionPage
    tasks.address     | ReviewAddressPage
    tasks.risk        | RiskManagementV1Page
    tasks.victim      | VictimLiaisonPage
    tasks.curfew      | CurfewHoursPage
    tasks.conditions  | LicenceConditionsStandardPage
    tasks.reporting   | ReportingInstructionsPage
    tasks.finalChecks | FinalChecksSeriousOffencePage
    tasks.resubmit    | SendResubmitPage
  }
}
