package uk.gov.justice.digital.hmpps.licences.specs.review

import geb.spock.GebReportingSpec
import spock.lang.Shared
import spock.lang.Stepwise
import uk.gov.justice.digital.hmpps.licences.pages.review.ReviewRiskPage
import uk.gov.justice.digital.hmpps.licences.util.Actions
import uk.gov.justice.digital.hmpps.licences.util.TestData

@Stepwise
class ReviewRiskSpec extends GebReportingSpec {

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

  def 'Shows risk answers entered by RO'() {

    given: 'A licence ready for final checks'
    testData.loadLicence('review/normal')

    when: 'I view the page'
    to ReviewRiskPage, testData.markAndrewsBookingId

    then: 'I see the risk management answers'
    risk.answers.planningActions == 'No'
    risk.answers.information == 'No'
    risk.answers.addressSuitable == 'Yes'
  }

  def 'Also shows risk details entered by RO when there are risk issues'() {

    given: 'A licence ready for final checks'
    testData.loadLicence('review/risks')

    when: 'I view the page'
    to ReviewRiskPage, testData.markAndrewsBookingId

    then: 'I see the risk management details'
    risk.answers.riskManagementDetail == 'Information details'
    risk.answers.unsuitableReason == 'Reason'
  }

  def 'Also shows non-disclosable informaton'() {

    given: 'A licence ready for final checks having non-diclosable information'
    testData.loadLicence('review/risks-nonDisclosable')

    when: 'I view the page'
    to ReviewRiskPage, testData.markAndrewsBookingId

    then: 'I see the non-disclosable information'
    risk.answers.nonDisclosableInformationView == 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
  }
}
