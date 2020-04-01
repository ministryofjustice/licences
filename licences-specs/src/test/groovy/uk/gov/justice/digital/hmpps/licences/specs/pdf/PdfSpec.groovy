package uk.gov.justice.digital.hmpps.licences.specs.pdf

import geb.spock.GebReportingSpec
import spock.lang.Shared
import spock.lang.Stepwise
import uk.gov.justice.digital.hmpps.licences.pages.TaskListPage
import uk.gov.justice.digital.hmpps.licences.pages.pdf.LicenceTaskListPage
import uk.gov.justice.digital.hmpps.licences.pages.pdf.LicenceTemplatePage
import uk.gov.justice.digital.hmpps.licences.pages.review.ReviewLicencePage
import uk.gov.justice.digital.hmpps.licences.util.Actions
import uk.gov.justice.digital.hmpps.licences.util.TestData

@Stepwise
class PdfSpec extends GebReportingSpec {

  @Shared
  TestData testData = new TestData()
  @Shared
  Actions actions = new Actions()

  def setupSpec() {

  }

  def cleanupSpec() {
    actions.logOut()
  }

  def 'No option to create PDF if not CA user'() {

    given: 'An approved licence'
    testData.loadLicence('decision/approved')

    when: 'I log in and view the tasklist'
    actions.logIn(user)
    via TaskListPage, testData.markAndrewsBookingId
    at ReviewLicencePage

    then: 'There is no option to create PDF'
    at ReviewLicencePage

    actions.logOut()

    where:
    user << ['RO', 'DM']
  }

  def 'No option to create PDF if not approved licence'() {

    given: 'A refused licence'
    actions.logIn('CA')
    testData.loadLicence('decision/refused')

    when: 'I view the tasklist'
    to TaskListPage, testData.markAndrewsBookingId

    then: 'There is no option to create PDF'
    !taskListAction('Create licence').isDisplayed()
  }

  def 'Option to create PDF for CA and approved licence'() {

    given: 'An approved licence'
    testData.loadLicence('decision/approved')

    when: 'I view the tasklist'
    to TaskListPage, testData.markAndrewsBookingId

    then: 'There is an option to create PDF'
    taskListAction('Create licence').isDisplayed()
    taskListAction('Create licence').text() == 'Continue'
  }

  def 'Create licence task leads to template selection'() {

    given: 'An approved licence'
    testData.loadLicence('decision/approved')

    when: 'I begin licence creation'
    to TaskListPage, testData.markAndrewsBookingId
    taskListAction('Create licence').click()

    and: 'I choose a offence before'
    at LicenceTemplatePage
    offenceBeforeRadio.checked = 'Yes'

    and: 'I choose a template'
    at LicenceTemplatePage
    templateTypes.checked = 'hdc_ap'
    find('#continueButton').click()

    then: 'I see the create licence tasklist'
    at LicenceTaskListPage
  }

  def 'Reporting values are not mandatory'() {

    given: 'An approved licence with some fields missing'
    testData.loadLicence('decision/approved-missing')

    when: 'I begin creating the PDF licence'
    to LicenceTaskListPage, testData.markAndrewsBookingId

    then: 'Reporting and tagging company details are not complete'
    !driver.getPageSource().contains('Not complete')
  }
}
