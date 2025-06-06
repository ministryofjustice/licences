package uk.gov.justice.digital.hmpps.licences.specs.common

import geb.spock.GebReportingSpec
import spock.lang.Shared
import spock.lang.Unroll
import uk.gov.justice.digital.hmpps.licences.pages.CaselistPage
import uk.gov.justice.digital.hmpps.licences.pages.ChangeLocationPage
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
  def 'Shows licence case summary details from nomis for #user'() {

    when: 'I view the case list'
    actions.logIn(user)
    testData.loadLicence(sample)
    via CaselistPage

    then: 'I see the expected data for the prisoner'
    offenders.summary[0].name == 'Osiss Helkarci'
    offenders.summary[0].nomisId == 'A5001DY'

    where:
    user | sample
    'CA' | 'eligibility/unstarted'
    'DM' | 'decision/unstarted'
  }

  @Unroll
  def 'Shows only licence case summary details from nomis for latest booking for RO'() {

    when: 'I view the case list'
    actions.logIn(user)
    testData.loadLicence(sample)
    via CaselistPage

    then: 'I see the expected data for the prisoner'
    offenders.summary[0].name == 'Osiss Helkarci'
    offenders.summary[0].nomisId == 'A5001DY'

    then: 'I do not see data for the prisoner`s previous booking'
    offenders.summary.size() == 1

    where:
    user | sample
    'RO' | 'assessment/unstarted'
  }

  @Unroll
  def 'Shows feedback survey banner for #user'() {

    when: 'I view the case list'
    actions.logIn(user)
    via CaselistPage

    then: 'I see the feedback survey banner'
    feedbackBanner.text().contains('Give feedback on this service')
    feedbackBanner.attr('href').contains('https://eu.surveymonkey.com/r/GYB8Y9Q?source=localhost/caseList/active')

    where:
    user << ['CA', 'DM', 'RO']
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

  def 'Change location link and location are visible'() {

    when: 'I go to the case list page'
    actions.logIn(user)
    via CaselistPage

    then: 'I can see the Change location link'
    changeLocationLink.text() == 'Change your location'

    and: 'I can see the active location'
    activeLocation.text() == 'Belmarsh'

    where:
    user << ['CA', 'DM', 'RO_USER']
  }

  def 'Change location page is presented'() {

    when: 'I go to the case list page'
    actions.logIn(user)

    via CaselistPage
    then: 'And I click Change location link'
    changeLocationLink.click()

    and: 'I am taken to the Change location page'
    at ChangeLocationPage
    $('h2').text() == 'Change location'

    where:
    user << ['CA', 'DM', 'RO_USER']
  }

  def 'Change location link works - user has multiple roles'() {

    when: 'I go to the case list page'
    actions.logIn('CA_RO_DM')
    via CaselistPage

    then: 'I can see the Change location link'
    changeLocationLink.text() == 'Change your role or location'

    when: 'I change location'
    changeLocationLink.click()
    at ChangeLocationPage
    selector.value('Askham Grange')
    submit.click()

    then: 'I am taken back to the case list page'
    at CaselistPage
  }
}
