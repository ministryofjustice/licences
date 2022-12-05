package uk.gov.justice.digital.hmpps.licences.specs.assessment

import geb.spock.GebReportingSpec
import spock.lang.Shared
import spock.lang.Stepwise
import uk.gov.justice.digital.hmpps.licences.pages.TaskListPage
import uk.gov.justice.digital.hmpps.licences.pages.assessment.LicenceConditionsAdditionalPage
import uk.gov.justice.digital.hmpps.licences.pages.assessment.LicenceConditionsStandardPage
import uk.gov.justice.digital.hmpps.licences.pages.assessment.LicenceConditionsSummaryPage
import uk.gov.justice.digital.hmpps.licences.util.Actions
import uk.gov.justice.digital.hmpps.licences.util.TestData

@Stepwise
class StandardConditionsVersionsSpec extends GebReportingSpec {

  @Shared
  TestData testData = new TestData()

  @Shared
  Actions actions = new Actions()

  def setupSpec() {
    actions.logIn('RO')
  }

  def cleanupSpec() {
    actions.logOut()
  }

  def 'Standard Conditions Version Undefined '() {
    given: 'Licence exists with no standard condition version'
    testData.loadLicence('assessment/standard-conditions-undefined')

    when: 'I start the additional conditions task'
    to (TaskListPage, testData.markAndrewsBookingId)
    taskListAction('Additional conditions').click()

    then: 'I see the standard conditions page with V1 standard conditions'
    at LicenceConditionsStandardPage
    standardConditionsItems.size() == 7
  }

  def 'Standard Conditions Version V1 '() {
    given: 'Licence exists with no standard condition version'
    testData.loadLicence('assessment/standard-conditions-v1')

    when: 'I start the additional conditions task'
    to (TaskListPage, testData.markAndrewsBookingId)
    taskListAction('Additional conditions').click()

    then: 'I see the standard conditions page with V1 standard conditions'
    at LicenceConditionsStandardPage
    standardConditionsItems.size() == 7
  }

  def 'Standard Conditions Version V2 '() {
    given: 'Licence exists with no standard condition version'
    testData.loadLicence('assessment/standard-conditions-v2')

    when: 'I start the additional conditions task'
    to (TaskListPage, testData.markAndrewsBookingId)
    taskListAction('Additional conditions').click()

    then: 'I see the standard conditions page with V2 standard conditions'
    at LicenceConditionsStandardPage
    standardConditionsItems.size() == 9
  }
}
