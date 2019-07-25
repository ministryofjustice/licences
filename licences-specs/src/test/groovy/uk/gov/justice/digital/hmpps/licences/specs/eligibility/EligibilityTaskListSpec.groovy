package uk.gov.justice.digital.hmpps.licences.specs.eligibility

import geb.spock.GebReportingSpec
import spock.lang.Shared
import spock.lang.Stepwise
import uk.gov.justice.digital.hmpps.licences.pages.CaselistPage
import uk.gov.justice.digital.hmpps.licences.pages.TaskListPage
import uk.gov.justice.digital.hmpps.licences.pages.eligibility.BassRejectedPage
import uk.gov.justice.digital.hmpps.licences.pages.eligibility.EligibilityExclusionPage
import uk.gov.justice.digital.hmpps.licences.util.Actions
import uk.gov.justice.digital.hmpps.licences.util.TestData

@Stepwise
class EligibilityTaskListSpec extends GebReportingSpec {

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

  def 'Shows details of the prisoner (from nomis)'() {

    when: 'I view the task list page'
    to TaskListPage, testData.markAndrewsBookingId

    then: 'I see the expected offender details data'
    offender.details.name == 'Mark Andrews'
    offender.details.nomisId == 'A5001DY'
    offender.details.dob == '22/10/1989'
    //offender.details.roName == 'Ryan Orton'
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
    $('a', text: 'Back to case list', 0).click()

    then: 'I go back to the dashboard'
    at CaselistPage
  }

  def 'Initially shows eligibility check task'() {

    given: 'An unstarted licence'
    testData.loadLicence('eligibility/unstarted')

    when: 'I view the page'
    to TaskListPage, testData.markAndrewsBookingId

    then: 'I see a start button for the eligibility check'
    eligibilityCheckStartButton.value() == 'Start now'
  }

  def 'Start eligibility check button goes to eligibility check page'() {

    given: 'Viewing the task page'
    at TaskListPage

    when: 'I click to start eligibility check'
    eligibilityCheckStartButton.click()

    then: 'I see the eligibility check page'
    at EligibilityExclusionPage
  }

  def 'Change answers link shown when eligibility check done'() {

    given: 'Eligibility checks already done'
    testData.loadLicence('eligibility/done')

    when: 'I view the tasklist page'
    to TaskListPage, testData.markAndrewsBookingId

    then: 'I see the change answers link'
    eligibilityCheckUpdateLink.text() == 'Change'
  }

  def 'Eligibility answers shown after eligibility check done'() {

    given: 'Eligibility checks already done'
    // follow on from previous

    when: 'Viewing the task page'
    at TaskListPage

    then: 'I see the eligibility answers'
    excludedAnswer.text() == 'No'
    unsuitableAnswer.text() == 'No'
    crdTimeAnswer.text() == 'No'
  }

  def 'Does not show Inform Offender task when eligibility task not complete'() {

    when: 'Viewing the tasklist'
    testData.loadLicence("eligibility/started")
    to TaskListPage, testData.markAndrewsBookingId

    then: 'The inform offender task is shown'
    !taskListAction('Inform the offender').isDisplayed()
  }

  def 'Shows Inform Offender task when not eligible'() {

    when: 'Viewing the tasklist'
    testData.loadLicence("eligibility/excluded")
    to TaskListPage, testData.markAndrewsBookingId

    then: 'The inform offender task is shown'
    taskListAction('Inform the offender').isDisplayed()
  }

  def 'Shows Inform Offender task when eligibility task complete'() {

    when: 'Viewing the tasklist'
    testData.loadLicence("eligibility/eligible")
    to TaskListPage, testData.markAndrewsBookingId

    then: 'The inform offender task is shown'
    taskListAction('Inform the offender').isDisplayed()
  }

  def 'Address check task is not shown when offender is #condition'() {

    when: 'Viewing the tasklist'
    testData.loadLicence("eligibility/${condition}")
    to TaskListPage, testData.markAndrewsBookingId

    then: 'The address check task is not shown'
    !taskListAction('Curfew address').isDisplayed()

    where:
    condition << ['unstarted', 'excluded', 'unsuitable', 'insufficientTime']
  }

  def 'Address check task is shown when elgibile'() {

    when: 'Viewing the tasklist'
    testData.loadLicence("eligibility/eligible")
    to TaskListPage, testData.markAndrewsBookingId

    then: 'The address check task is shown'
    taskListAction('Curfew address').isDisplayed()
  }

  def 'Submit task shown once address task is started'() {

    when: 'Viewing the tasklist'
    testData.loadLicence("eligibility/optedOutNo")
    to TaskListPage, testData.markAndrewsBookingId

    then: 'The submit task is shown'
    $('h2', text: contains('Submit curfew address')).isDisplayed()
  }

  def 'Inform offender task is hidden once address task is started'() {

    when: 'Viewing the tasklist'
    testData.loadLicence("eligibility/optedOutNo")
    to TaskListPage, testData.markAndrewsBookingId

    then: 'The submit task is shown'
    !taskListAction('Inform the offender').isDisplayed()
  }

  def 'BASS submit task shown when BASS requested'() {

    when: 'Viewing the tasklist'
    testData.loadLicence("eligibility/bassRequest-unstarted")
    to TaskListPage, testData.markAndrewsBookingId

    then: 'The submit task is shown'
    $('h2', text: contains('Send for BASS area checks')).isDisplayed()
  }

  def 'When BASS is rejected, BASS task shows rejection page'() {

    given: 'BASS has been requested'
    testData.loadLicence('eligibility/bassArea-rejected')

    when: 'I view the task list'
    to TaskListPage, testData.markAndrewsBookingId

    and: 'I start the task'
    taskListAction('Curfew address').click()

    then: 'I see the BASS rejection page'
    at BassRejectedPage
  }
}
