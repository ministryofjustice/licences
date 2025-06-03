package uk.gov.justice.digital.hmpps.licences.specs.assessment

import geb.spock.GebReportingSpec
import spock.lang.Shared
import spock.lang.Stepwise
import spock.lang.Retry
import uk.gov.justice.digital.hmpps.licences.pages.assessment.ReportingInstructionsPage
import uk.gov.justice.digital.hmpps.licences.pages.TaskListPage
import uk.gov.justice.digital.hmpps.licences.util.Actions
import uk.gov.justice.digital.hmpps.licences.util.TestData

@Stepwise
class ReportingInstructionsSpec extends GebReportingSpec {

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

  def 'Reporting instructions initially blank'() {

    given: 'At task list page'
    to TaskListPage, testData.testBookingId

    when: 'I start the reporting instructions task'
    taskListAction('Reporting instructions').click()

    then: 'I see the reporting instructions page'
    at ReportingInstructionsPage

    and: 'The options are unset'
    name.value() == ''
    organisation.value() == ''
    street.value() == ''
    town.value() == ''
    postcode.value() == ''
    telephone.value() == ''
  }

  def 'Modified Reporting instructions not saved on return to tasklist'() {

    given: 'At reporting instructions page'
    at ReportingInstructionsPage

    when: 'I enter new values'
    name << 'sample name'
    organisation << 'sample organisation'
    street << 'sample street'
    town << 'sample town'
    postcode << 'AB1 1AB'
    telephone << '0123456789'

    and: 'I choose return to tasklist'
    find('.link-back', 0).click()
    at TaskListPage

    and: 'I view the reporting instructions page'
    to ReportingInstructionsPage, testData.testBookingId

    then: 'I see the original values'
    name.value() == ''
    organisation.value() == ''
    street.value() == ''
    town.value() == ''
    postcode.value() == ''
    telephone.value() == ''
  }

  @Retry
  def 'Modified choices are saved after save and continue'() {

    given: 'At reporting instructions page'
    at ReportingInstructionsPage

    when: 'I enter new values'
    name << 'sample name'
    organisation << 'sample organisation'
    street << 'sample street'
    town << 'sample town'
    postcode << 'AB1 1AB'
    telephone << '0123456789'

    and: 'I save and continue'
    find('#continueBtn').click()

    and: 'I return to the reporting instructions page'
    to ReportingInstructionsPage, testData.testBookingId

    sleep(5)

    then: 'I see the previously entered values'
    name.value() == 'sample name'
    organisation.value() == 'sample organisation'
    street.value() == 'sample street'
    town.value() == 'sample town'
    postcode.value() == 'AB1 1AB'
    telephone.value() == '0123456789'

  }
}
