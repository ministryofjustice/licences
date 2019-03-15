package uk.gov.justice.digital.hmpps.licences.specs.common

import geb.spock.GebReportingSpec
import spock.lang.Ignore
import spock.lang.Shared
import spock.lang.Stepwise
import spock.lang.Unroll
import uk.gov.justice.digital.hmpps.Stage
import uk.gov.justice.digital.hmpps.licences.pages.CaselistPage
import uk.gov.justice.digital.hmpps.licences.util.Actions
import uk.gov.justice.digital.hmpps.licences.util.TestData

class CommonCaselistSpec extends GebReportingSpec {

  @Shared
  TestData testData = new TestData()

  @Shared
  Actions actions = new Actions()

  def setup() {
    testData.deleteLicences()
  }

  def cleanup() {
    actions.logOut()
  }

  @Unroll
  @Stage
  def 'Shows the caseload of HDC eligible prisoners for #user'() {

    given: 'No licences started'
    actions.logIn(user)
    testData.loadLicence(sample)

    when: 'I view the caselist'
    via CaselistPage

    then: 'I see one HDC eligible prisoner'
    hdcEligible.size() == 1

    where:
    user | sample
    'CA' | 'eligibility/unstarted'
    'RO' | 'assessment/unstarted'
    'DM' | 'decision/unstarted'
  }

  @Unroll
  @Stage
  def 'Shows licence case summary details (from nomis) for #user'() {

    when: 'I view the case list'
    actions.logIn(user)
    testData.loadLicence(sample)
    via CaselistPage

    then: 'I see the expected data for the prisoner'
    offenders.summary[0].name == 'Mark Andrews'
    offenders.summary[0].nomisId == 'A5001DY'
//        offenders.summary[0].location == 'T-T1-001 - HMP Albany'
//        offenders.summary[0].hdced == '23/08/2019'

    where:
    user | sample
    'CA' | 'eligibility/unstarted'
    'RO' | 'assessment/unstarted'
    'DM' | 'decision/unstarted'
  }

  def 'Inactive cases are displayed under inactive tab'() {

    given: 'a licence exists in an inactive state'
    testData.loadLicence('eligibility/excluded')

    when: 'I view the caselist with the inactive tab'
    actions.logIn('CA')
    to CaselistPage, 'inactive'

    then: 'The inactive case is shown with correct status'
    statusFor(0) == 'Not eligible'
  }

  def 'Search for offenders is available for RO'() {

    when: 'I view the case list as an RO'
    actions.logIn('RO')
    via CaselistPage

    then: 'I see the search for an offender option'
    searchOffenderControl.isDisplayed()
  }

  def 'Search for offenders is not available when not RO'() {

    when: 'I view the case list and I am not an RO'
    actions.logIn(user)
    via CaselistPage

    then: 'I do not see the search for an offender option'
    !searchOffenderControl.isDisplayed()

    where:
    user << ['CA', 'DM']
  }
}
