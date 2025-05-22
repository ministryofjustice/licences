package uk.gov.justice.digital.hmpps.licences.specs.review

import geb.spock.GebReportingSpec
import spock.lang.Shared
import spock.lang.Stepwise
import uk.gov.justice.digital.hmpps.licences.pages.assessment.LicenceDetailsPage
import uk.gov.justice.digital.hmpps.licences.pages.review.ReviewAddressPage
import uk.gov.justice.digital.hmpps.licences.pages.review.ReviewConditionsPage
import uk.gov.justice.digital.hmpps.licences.util.Actions
import uk.gov.justice.digital.hmpps.licences.util.TestData

@Stepwise
class ReviewConditionsSpec extends GebReportingSpec {

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

  def 'Shows conditions details entered by RO'() {

    given: 'A licence ready for final checks'
    testData.loadLicence('review/normal')

    when: 'I view the page'
    to ReviewConditionsPage, testData.testBookingId

    then: 'I see the licence conditions details'
    conditions.additional.size() == 3

    conditions.additional[0].number == '1.'
    conditions.additional[0].title == 'Possession, ownership, control or inspection of specified items or documents.'

    conditions.additional[1].number == '2.'
    conditions.additional[1].content == 'First bespoke condition'
    conditions.additional[1].approved == 'Approved'

    conditions.additional[2].number == '3.'
    conditions.additional[2].content == 'Second bespoke condition'
    conditions.additional[2].approved == 'Not approved'

    conditions.justification == 'They were necessary.'
  }

  def 'Shows message when no additional conditions entered by RO'() {

    given: 'A licence ready for final checks'
    testData.loadLicence('review/no-conditions')

    when: 'I view the page'
    to ReviewConditionsPage, testData.testBookingId

    then: 'I see the licence conditions details'
    conditions.message == 'No additional conditions have been selected.'
  }
}
