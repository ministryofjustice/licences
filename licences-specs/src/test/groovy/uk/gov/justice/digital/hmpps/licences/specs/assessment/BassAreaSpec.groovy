package uk.gov.justice.digital.hmpps.licences.specs.assessment

import geb.spock.GebReportingSpec
import spock.lang.Shared
import spock.lang.Stepwise
import uk.gov.justice.digital.hmpps.licences.pages.TaskListPage
import uk.gov.justice.digital.hmpps.licences.pages.assessment.BassAreaCheckPage
import uk.gov.justice.digital.hmpps.licences.util.Actions
import uk.gov.justice.digital.hmpps.licences.util.TestData

@Stepwise
class BassAreaSpec extends GebReportingSpec {

  @Shared
  TestData testData = new TestData()

  @Shared
  Actions actions = new Actions()

  def setupSpec() {
    testData.loadLicence('assessment/bassArea-unstarted')
    actions.logIn('RO')
  }

  def cleanupSpec() {
    actions.logOut()
  }

    def 'The question "Does the offender need to be sent to approved premises?" is displayed on page load'(){

    given: 'At task list page'
    to TaskListPage, testData.markAndrewsBookingId

    when: 'I start the BASS area task'
    taskListAction('BASS area check').click()

    then: 'I see the bass area page'
    at BassAreaCheckPage

    and: 'The question "Does the offender need to be sent to approved premises?" is displayed'
    approvedAddressRequired.isDisplayed()

    }

    def 'The radio buttons for the Approved Premises question  are not selected on page load'(){

      given: 'At task list page'
      to TaskListPage, testData.markAndrewsBookingId

      when: 'I start the BASS area task'
      taskListAction('BASS area check').click()

      then: 'I see the bass area page'
      at BassAreaCheckPage

      and: 'The radios for approved premises are displayed'
      approvedRadios.checked == null

    }

    def 'The question "Is the area suitable for the offender to live in?" is hidden until Approved Premises radio is clicked for No'() {

      given: 'At task list page'
      to TaskListPage, testData.markAndrewsBookingId

      when: 'I start the BASS area task'
      taskListAction('BASS area check').click()

      then: 'I see the bass area page'
      at BassAreaCheckPage

      and: 'The options are unset'
      areaRadios.checked == null

      and: "The Area Suitable question and text are hidden"
      !areaReasons.isDisplayed()

      then: 'I select No to Approved Premises required'
      approvedRadios.value('No')

      and: 'The reason input is displayed'
      areaReasons.isDisplayed()

      and: 'The requested area is shown'
      bass.proposed.town == 'BASS Town'
      bass.proposed.county == 'BASS County'
  }

  def 'The question "Is the area suitable for the offender to live in?" is hidden again if the Approved Premises radio is clicked for Yes'() {

    given: 'At task list page'
    to TaskListPage, testData.markAndrewsBookingId

    when: 'I start the BASS area task'
    taskListAction('BASS area check').click()

    then: 'I see the bass area page'
    at BassAreaCheckPage

    then: 'I select No to Approved Premises required'
    approvedRadios.value('No')

    and: 'The reason input is displayed'
    areaReasons.isDisplayed()

    then: 'I select No to Approved Premises required'
    approvedRadios.value('Yes')

    and: 'The reason input is displayed'
    !areaReasons.isDisplayed()
  }

  def 'Shows previously saved values'() {

    given: 'Bass area rejected'
    testData.loadLicence('assessment/bassArea-rejected')

    when: 'I view the bass area page'
    to BassAreaCheckPage, testData.markAndrewsBookingId

    then: 'I select No to Approved Premises required'
    approvedRadios.value('No')

    then: 'I see the previous values'
    areaRadios.checked == 'No'
    areaReasons.text() == 'Reason'
  }

  def 'Choices are not saved if return to tasklist without selecting Save and Continue'() {

    given: 'At task list page'
    to TaskListPage, testData.markAndrewsBookingId

    when: 'I start the BASS area task'
    taskListAction('BASS area check').click()

    then: 'I see the bass area page'
    at BassAreaCheckPage

    when: 'I select new options'
    approvedRadios.value('Yes')

    and: 'I choose return to tasklist'
    $('#backLink').click()
    at TaskListPage

    and: 'I go back to the bass area page'
    to BassAreaCheckPage, testData.markAndrewsBookingId

    then: 'Then the Approved Premises radios are not checked'
    approvedRadios.checked == null
  }

   def 'If the prisoner has not requested a specific Bass area then the "Suitable area" radios are not displayed but the text box is displayed'() {

    given: 'No specific area requested'
    testData.loadLicence('assessment/bassArea-unstarted-no-area')

    when: 'I view the bass area page'
    to BassAreaCheckPage, testData.markAndrewsBookingId
    then: 'I select Approved Address No option'
    approvedRadios.value('No')

    and: 'The radios are not shown'
    !areaRadios.isDisplayed()

    and: 'The reason input is always shown'
    areaReasons.isDisplayed()

    and: 'No preferred area message is shown'
    $('#noSpecificAreaMessage').isDisplayed()
  }

   def 'If the Approved premises YES radio is selected followed by the SAVE AND CONTINUE button, the user is taken to the Approved premises address input page'() {

    given: 'No specific area requested'
    testData.loadLicence('assessment/bassArea-unstarted-no-area')

    when: 'I view the bass area page'
    to BassAreaCheckPage, testData.markAndrewsBookingId
    then: 'I select Approved Address YES option'
    approvedRadios.value('Yes')

    and: 'Then I select SAVE AND CONTINUE'
    saveAndContinue.click()

    then: 'The Approved premises address page is presented'
    currentUrl.contains "/hdc/bassReferral/approvedPremisesAddress"
  }

  def 'If the Approved premises NO radio is selected followed by the SAVE AND CONTINUE button, the user is taken to the Tasklist page'() {

    given: 'No specific area requested'
    testData.loadLicence('assessment/bassArea-unstarted-no-area')

    when: 'I view the bass area page'
    to BassAreaCheckPage, testData.markAndrewsBookingId
    then: 'I select Approved Address NO option'
    approvedRadios.value('No')

    and: 'Then I select SAVE AND CONTINUE'
    saveAndContinue.click()

    then: 'The Approved premises address page is presented'
    currentUrl.contains "/hdc/taskList/"
  }
}
