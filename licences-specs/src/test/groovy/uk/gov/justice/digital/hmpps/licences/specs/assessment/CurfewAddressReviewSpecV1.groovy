package uk.gov.justice.digital.hmpps.licences.specs.assessment

import geb.spock.GebReportingSpec
import spock.lang.Shared
import spock.lang.Stepwise
import spock.lang.Retry
import uk.gov.justice.digital.hmpps.licences.pages.assessment.CurfewAddressReviewPageV1
import uk.gov.justice.digital.hmpps.licences.util.Actions
import uk.gov.justice.digital.hmpps.licences.util.TestData

@Stepwise
class CurfewAddressReviewSpecV1 extends GebReportingSpec {

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

  def 'Shows address details'() {

    given: 'A licence record with a proposed curfew address'
    testData.loadLicence('assessment/curfewAddressReview-with-version-1')

    when: 'I go to the address review page'
    to CurfewAddressReviewPageV1, testData.testBookingId

    then: 'I see the address details'
    curfew.address.line1 == 'Street'
    curfew.address.town == 'Town'
    curfew.address.postCode == 'AB1 1AB'
    curfew.address.telephone == '0123 456789'
  }

  def 'Confirmation options initially unselected'() {

    when: 'At address review page'
    at CurfewAddressReviewPageV1

    then: 'Options not set'
    landlordConsentRadios.checked == null
  }

  def 'Further questions not shown when landlord consent is no'() {

    when: 'At address review page'
    at CurfewAddressReviewPageV1

    then: 'I do not see the further questions'
    !landlordConsentForm.isDisplayed()
  }

  def 'Further questions shown when landlord consent is yes'() {

    when: 'At address review page'
    at CurfewAddressReviewPageV1

    and: 'I select yes for consent'
    landlordConsentRadios.checked = 'Yes'

    then: 'I see the further questions'
    landlordConsentForm.isDisplayed()
  }

  @Retry
  def 'Modified choices are saved after save and continue'() {

    given: 'At address review page'
    to CurfewAddressReviewPageV1, testData.testBookingId

    when: 'I select new options'
    landlordConsentRadios.checked = 'Yes'
    electricitySupplyRadios.checked = 'Yes'
    homeVisitRadios.checked = 'No'

    and: 'I save and continue'
    find('#continueBtn').click()

    and: 'I move to the address review page'
    to CurfewAddressReviewPageV1, testData.testBookingId

    sleep(5)

    then: 'I see the previously entered values'
    landlordConsentRadios.checked == 'Yes'
    electricitySupplyRadios.checked == 'Yes'
    homeVisitRadios.checked == 'No'
  }
}
