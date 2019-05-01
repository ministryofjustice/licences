package uk.gov.justice.digital.hmpps.licences.specs.finalchecks

import geb.spock.GebReportingSpec
import spock.lang.Shared
import spock.lang.Stepwise
import spock.lang.Unroll
import uk.gov.justice.digital.hmpps.licences.modules.ApprovedPremisesModule
import uk.gov.justice.digital.hmpps.licences.pages.TaskListPage
import uk.gov.justice.digital.hmpps.licences.pages.assessment.ApprovedPremisesAddressPage
import uk.gov.justice.digital.hmpps.licences.pages.eligibility.BassRequestPage
import uk.gov.justice.digital.hmpps.licences.pages.eligibility.CurfewAddressChoicePage
import uk.gov.justice.digital.hmpps.licences.pages.finalchecks.ApprovedPremisesChoicePage
import uk.gov.justice.digital.hmpps.licences.pages.finalchecks.BassOfferPage
import uk.gov.justice.digital.hmpps.licences.pages.finalchecks.BassUnsuitablePage
import uk.gov.justice.digital.hmpps.licences.pages.finalchecks.BassWithdrawnPage
import uk.gov.justice.digital.hmpps.licences.util.Actions
import uk.gov.justice.digital.hmpps.licences.util.TestData

@Stepwise
class ApprovedPremisesSpec extends GebReportingSpec {

  @Shared
  TestData testData = new TestData()
  @Shared
  Actions actions = new Actions()

  def addressTask = 'Proposed curfew address'

  def setupSpec() {
    actions.logIn('CA')
  }

  def cleanupSpec() {
    actions.logOut()
  }

  def 'Shows approved premises address'() {

    given: 'A licence ready for final checks with approved premises'
    testData.loadLicence('finalchecks/approved-premises')

    when: 'I view the curfew address task'
    to TaskListPage, testData.markAndrewsBookingId
    taskListAction(addressTask).click()

    then: 'I see the AP choice page'
    at ApprovedPremisesChoicePage

    and: 'The AP required radio option is selected'
    approvedPremisesChoiceRadios.checked == 'ApprovedPremises'

    when: 'I continue'
    find('#continueBtn').click()

    then: 'I see the address details'
    at ApprovedPremisesAddressPage
    approvedPremises.addressForm.line1.value() == 'AP1'
    approvedPremises.addressForm.line2.value() == 'AP2'
    approvedPremises.addressForm.town.value() == 'APtown'
    approvedPremises.addressForm.postCode.value() == 'AP11AP'
    approvedPremises.addressForm.telephone.value() == '111'
  }

  def 'Opt out returns to tasklist in opted out state'() {

    given: 'On the AP choice page'
    to ApprovedPremisesChoicePage, testData.markAndrewsBookingId

    when: 'I select opt out and continue'
    approvedPremisesChoiceRadios.checked = 'OptOut'
    find('#continueBtn').click()

    then: 'I see the tasklist page'
    at TaskListPage

    and: 'The status is opted out'
    errorBanner.text().contains('opted out')
  }

}
