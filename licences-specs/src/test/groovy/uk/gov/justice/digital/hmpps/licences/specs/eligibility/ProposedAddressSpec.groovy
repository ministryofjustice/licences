package uk.gov.justice.digital.hmpps.licences.specs.eligibility

import geb.spock.GebReportingSpec
import spock.lang.Shared
import spock.lang.Stepwise
import uk.gov.justice.digital.hmpps.licences.pages.CaselistPage
import uk.gov.justice.digital.hmpps.licences.pages.eligibility.ProposedAddressCurfewAddressPage
import uk.gov.justice.digital.hmpps.licences.pages.SentPage
import uk.gov.justice.digital.hmpps.licences.pages.eligibility.CurfewAddressChoicePage
import uk.gov.justice.digital.hmpps.licences.pages.eligibility.BassRequestPage
import uk.gov.justice.digital.hmpps.licences.pages.TaskListPage
import uk.gov.justice.digital.hmpps.licences.pages.review.ReviewCurfewAddressPage
import uk.gov.justice.digital.hmpps.licences.util.Actions
import uk.gov.justice.digital.hmpps.licences.util.TestData

@Stepwise
class ProposedAddressSpec extends GebReportingSpec {

  @Shared
  TestData testData = new TestData()
  @Shared
  Actions actions = new Actions()

  def setupSpec() {
    testData.loadLicence('eligibility/unstarted')
    actions.logIn('CA')
  }

  def cleanupSpec() {
    actions.logOut()
  }

  def 'Starts with nothing selected'() {

    when: 'I view the choice page'
    to CurfewAddressChoicePage, testData.markAndrewsBookingId

    then: 'No radio option is selected'
    decisionRadios.checked == null
  }

  def 'Shows previous values'() {

    given: 'Opt out form already done'
    testData.loadLicence('eligibility/optedOut')

    when: 'I view the choice page'
    to CurfewAddressChoicePage, testData.markAndrewsBookingId

    then: 'I see the previous values'
    decisionRadios.checked == 'OptOut'
  }

  def 'The task list is shown next if decision is OptOut'() {

    given: 'On choice page'
    to CurfewAddressChoicePage, testData.markAndrewsBookingId

    when: 'I select to opt out'
    decisionRadios.checked = 'OptOut'
    find('#continueBtn').click()

    then: 'I see the task list'
    at TaskListPage
  }

  def 'The BASS referral page is shown next if decision is Bass'() {

    given: 'On choice page'
    to CurfewAddressChoicePage, testData.markAndrewsBookingId

    when: 'I select bass'
    decisionRadios.checked = 'Bass'
    find('#continueBtn').click()

    then: 'I see the address page'
    at BassRequestPage
  }

  def 'The address proposed question page is shown next if decision is Address'() {

    given: 'On choice page'
    to CurfewAddressChoicePage, testData.markAndrewsBookingId

    when: 'I select address'
    decisionRadios.checked = 'Address'
    find('#continueBtn').click()

    then: 'I see the address page'
    at ProposedAddressCurfewAddressPage
  }

  def 'Entered values are saved after save and continue'() {

    given: 'On Curfew Address page'
    to ProposedAddressCurfewAddressPage, testData.markAndrewsBookingId

    when: 'I fill in the form and save'

    address.preferred.line1.value('Address 1')
    address.preferred.line2.value('Address 2')
    address.preferred.town.value('Town')
    address.preferred.postCode.value('S1 4JQ')
    address.preferred.telephone.value('001')

    occupier.preferred.name.value('Name')
    occupier.preferred.relationship.value('Relation')

    cautionedRadios.checked = 'No'

    find('#continueBtn').click()

    then: 'I see the task list'
    at TaskListPage
  }

  def 'I can enter extra residents to addresses'() {

    given: 'I am on the proposed curfew address page'
    to ProposedAddressCurfewAddressPage, testData.markAndrewsBookingId

    when: 'I click to add another resident'
    addResidentLink.click()

    then: 'Another resident is added to the list'
    $(name: '[residents][3][name]').isDisplayed()

    when: 'I set values'
    $('input', name: '[residents][3][name]').value('Name')
    $('input', name: '[residents][3][age]').value('11')
    $('input', name: '[residents][3][relationship]').value('Relation')

    and: 'I click to save and continue'
    find('#continueBtn').click()

    then: 'I see the task list'
    at TaskListPage
  }


  def 'I can submit the address to the RO'() {

    given: 'On the task list page'
    to TaskListPage, testData.markAndrewsBookingId

    when: 'I click to continue to submission'
    taskListAction('Submit curfew address').click()

    then: 'I see the review page'
    at ReviewCurfewAddressPage

    when: 'I click to continue'
    find('#continueBtn').click()

    then: 'I see the sent confirmation page'
    at SentPage

    when: 'I click return to case list'
    find('#backBtn').click()

    then: 'I return to the case list'
    at CaselistPage
  }
}
