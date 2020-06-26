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
    role     || expectedPage
    'PRISON' || CaselistPage
    'CA'     || TaskListPage
    'RO'     || TaskListPage
    'DM'     || CaselistPage
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
    role     | licenceDataFilename              || expectedPage
    'PRISON' | 'eligibility/unstarted'          || ReviewLicencePage
    'CA'     | 'eligibility/unstarted'          || TaskListPage
    'RO'     | 'eligibility/unstarted'          || ReviewLicencePage
    'DM'     | 'eligibility/unstarted'          || CaselistPage

    'PRISON' | 'assessment/unstarted'           || ReviewLicencePage
    'CA'     | 'assessment/unstarted'           || ReviewLicencePage
    'RO'     | 'assessment/unstarted'           || TaskListPage
    'DM'     | 'assessment/unstarted'           || CaselistPage

    'PRISON' |'review/normal'                   || ReviewLicencePage
    'CA'     | 'review/normal'                  || TaskListPage
    'RO'     | 'review/normal'                  || ReviewLicencePage
    'DM'     | 'review/normal'                  || CaselistPage

    'PRISON' | 'finalchecks/unstarted'           || ReviewLicencePage
    'CA'     | 'finalchecks/unstarted'          || TaskListPage
    'RO'     | 'finalchecks/unstarted'          || ReviewLicencePage
    'DM'     | 'finalchecks/unstarted'          || CaselistPage

    'PRISON' | 'decision/unstarted'             || ReviewLicencePage
    'CA'     | 'decision/unstarted'             || ReviewLicencePage
    'RO'     | 'decision/unstarted'             || ReviewLicencePage
    'DM'     | 'decision/unstarted'             || TaskListPage

    'PRISON' | 'decision/approved'              || ReviewLicencePage
    'CA'     | 'decision/approved'              || TaskListPage
    'RO'     | 'decision/approved'              || ReviewLicencePage
    'DM'     | 'decision/approved'              || ReviewLicencePage

    'PRISON' | 'postDecision/address-withdrawn' || ReviewLicencePage
    'CA'     | 'postDecision/address-withdrawn' || TaskListPage
    'RO'     | 'postDecision/address-withdrawn' || ReviewLicencePage
    'DM'     | 'postDecision/address-withdrawn' || ReviewLicencePage
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
    'PRISON' || CaselistPage
    'CA'     || CaselistPage
    'RO'     || TaskListPage
    'DM'     || CaselistPage
  }
}
