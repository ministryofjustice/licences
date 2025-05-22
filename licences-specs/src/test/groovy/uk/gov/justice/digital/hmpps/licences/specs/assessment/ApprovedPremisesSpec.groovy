package uk.gov.justice.digital.hmpps.licences.specs.assessment

import geb.spock.GebReportingSpec
import spock.lang.Shared
import spock.lang.Stepwise
import uk.gov.justice.digital.hmpps.licences.pages.TaskListPage
import uk.gov.justice.digital.hmpps.licences.pages.assessment.ApprovedPremisesAddressPage
import uk.gov.justice.digital.hmpps.licences.pages.assessment.ApprovedPremisesPage
import uk.gov.justice.digital.hmpps.licences.pages.assessment.CurfewAddressReviewPageV1
import uk.gov.justice.digital.hmpps.licences.util.Actions
import uk.gov.justice.digital.hmpps.licences.util.TestData

@Stepwise
class ApprovedPremisesSpec extends GebReportingSpec {

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

  def 'Starts with nothing selected'() {

    when: 'I view the approved premises page'
    to ApprovedPremisesPage, testData.testBookingId

    then: 'No radio option is selected'
    approvedPremisesRadios.checked == null
  }

  def 'Shows previous values'() {

    given: 'AP chosed'
    testData.loadLicence('assessment/approved-premises')

    when: 'I view the AP page'
    to ApprovedPremisesPage, testData.testBookingId

    then: 'I see the previous values'
    approvedPremisesRadios.checked == 'Yes'
  }

  def 'The curfew address review is shown next if decision is No'() {

    given: 'On AP page'
    to ApprovedPremisesPage, testData.testBookingId

    when: 'I select No'
    approvedPremisesRadios.checked = 'No'
    find('#continueBtn').click()

    then: 'I see the curfew address review page'
    at CurfewAddressReviewPageV1
  }

  def 'The AP address page is shown next if decision is Yes'() {

    given: 'On AP page'
    to ApprovedPremisesPage, testData.testBookingId

    when: 'I select Yes'
    approvedPremisesRadios.checked = 'Yes'
    find('#continueBtn').click()

    then: 'I see the AP address page'
    at ApprovedPremisesAddressPage
  }

  def 'Entered values are saved after save and continue'() {

    when: 'First viewing AP Address page'
    to ApprovedPremisesAddressPage, testData.testBookingId

    then: 'The form is empty'
    approvedPremises.addressForm.line1.value() == ''
    approvedPremises.addressForm.line2.value() == ''
    approvedPremises.addressForm.town.value() == ''
    approvedPremises.addressForm.postCode.value() == ''
    approvedPremises.addressForm.telephone.value() == ''

    when: 'I fill in the form and save'
    approvedPremises.addressForm.line1 << '1'
    approvedPremises.addressForm.line2 << '2'
    approvedPremises.addressForm.town << 'town'
    approvedPremises.addressForm.postCode << 'AP11AP'
    approvedPremises.addressForm.telephone << '111'

    find('#continueBtn').click()

    then: 'I see the task list'
    at TaskListPage

    when: 'I return to the AP address page'
    to ApprovedPremisesAddressPage, testData.testBookingId

    then: 'I see the entered values'
    approvedPremises.addressForm.line1.value() == '1'
    approvedPremises.addressForm.line2.value() == '2'
    approvedPremises.addressForm.town.value() == 'town'
    approvedPremises.addressForm.postCode.value() == 'AP11AP'
    approvedPremises.addressForm.telephone.value() == '111'
  }
}
