package uk.gov.justice.digital.hmpps.licences.specs

import geb.spock.GebReportingSpec
import spock.lang.Shared
import spock.lang.Stepwise
import spock.lang.Unroll
import uk.gov.justice.digital.hmpps.licences.pages.CaselistPage
import uk.gov.justice.digital.hmpps.licences.pages.TaskListPage
import uk.gov.justice.digital.hmpps.licences.pages.review.ReviewLicencePage
import uk.gov.justice.digital.hmpps.licences.util.Actions
import uk.gov.justice.digital.hmpps.licences.util.TestData

@Stepwise
class TaskListGuardSpec extends GebReportingSpec {

  @Shared
  TestData testData = new TestData()

  @Shared
  Actions actions = new Actions()

  def cleanup() {
    actions.logOut()
  }

  @Unroll
  def 'Case not started. #role views taskList'() {
    given: 'Case not started. User logged in.'
    testData.deleteLicences()
    actions.logIn(role)

    when: 'I view the taskList page'
    via TaskListPage, testData.markAndrewsBookingId

    then: 'Should be on #expectedPage'
    at expectedPage

    where:
    role || expectedPage
    'CA' || TaskListPage
    'RO' || CaselistPage
    'DM' || CaselistPage
  }

  @Unroll
  def 'Case data is #licenceDataFilename. #role views taskList'() {
    given:
    testData.loadLicence(licenceDataFilename)
    actions.logIn(role)

    when: 'I view the taskList page'
    via TaskListPage, testData.markAndrewsBookingId

    then: 'Should be on #expectedPage'
    at expectedPage

    where:
    role | licenceDataFilename              || expectedPage
    'CA' | 'eligibility/unstarted'          || TaskListPage
    'RO' | 'eligibility/unstarted'          || CaselistPage
    'DM' | 'eligibility/unstarted'          || CaselistPage

    'CA' | 'assessment/unstarted'           || ReviewLicencePage
    'RO' | 'assessment/unstarted'           || TaskListPage
    'DM' | 'assessment/unstarted'           || CaselistPage

    'CA' | 'review/normal'                  || TaskListPage
    'RO' | 'review/normal'                  || ReviewLicencePage
    'DM' | 'review/normal'                  || CaselistPage

    'CA' | 'finalchecks/unstarted'          || TaskListPage
    'RO' | 'finalchecks/unstarted'          || ReviewLicencePage
    'DM' | 'finalchecks/unstarted'          || CaselistPage

    'CA' | 'decision/unstarted'             || ReviewLicencePage
    'RO' | 'decision/unstarted'             || ReviewLicencePage
    'DM' | 'decision/unstarted'             || TaskListPage

    'CA' | 'decision/approved'              || TaskListPage
    'RO' | 'decision/approved'              || ReviewLicencePage
    'DM' | 'decision/approved'              || ReviewLicencePage

    'CA' | 'postDecision/address-withdrawn' || TaskListPage
    'RO' | 'postDecision/address-withdrawn' || ReviewLicencePage
    'DM' | 'postDecision/address-withdrawn' || ReviewLicencePage
  }

  @Unroll
  def 'Offender released. #role views taskList'() {
    given:
    testData.deleteLicences()
    actions.logIn(role)

    when: 'I view the taskList page for bookingId 2 (a released offender)'
    via TaskListPage, 2

    then: 'Should be on #expectedPage'
    at expectedPage

    where:
    role || expectedPage
    'CA' || CaselistPage
    'RO' || TaskListPage
    'DM' || CaselistPage
  }
}
