package uk.gov.justice.digital.hmpps.licences.specs.eligibility

import geb.spock.GebReportingSpec
import spock.lang.Shared
import spock.lang.Stepwise
import spock.lang.Unroll
import uk.gov.justice.digital.hmpps.licences.pages.CaselistPage
import uk.gov.justice.digital.hmpps.licences.pages.SentPage
import uk.gov.justice.digital.hmpps.licences.pages.TaskListPage
import uk.gov.justice.digital.hmpps.licences.pages.eligibility.BassRejectedPage
import uk.gov.justice.digital.hmpps.licences.pages.eligibility.BassRequestPage
import uk.gov.justice.digital.hmpps.licences.pages.eligibility.CurfewAddressChoicePage
import uk.gov.justice.digital.hmpps.licences.pages.review.ReviewBassRequestPage
import uk.gov.justice.digital.hmpps.licences.util.Actions
import uk.gov.justice.digital.hmpps.licences.util.TestData

@Stepwise
class BassRequestSpec extends GebReportingSpec {

  @Shared
  TestData testData = new TestData()
  @Shared
  Actions actions = new Actions()

  def setupSpec() {
    testData.loadLicence('eligibility/bassRequest-unstarted')
    actions.logIn('CA')
  }

  def cleanupSpec() {
    actions.logOut()
  }

  def 'Choosing no preferred area returns to tasklist'() {

    when: 'Starting BASS request'
    to BassRequestPage, testData.testBookingId

    then: 'nothing is selected'
    specificAreaRadios.checked == null

    when: 'I choose no specific area'
    specificAreaRadios.checked = 'No'
    find('#continueBtn').click()

    then: 'I see the tasklist'
    at TaskListPage
  }

  def 'Choosing a preferred area shows area form'() {

    when: 'Starting BASS request'
    to BassRequestPage, testData.testBookingId

    and: 'I select Yes'
    specificAreaRadios.checked = 'Yes'

    then: 'The area details form is shown'
    proposedTownInput.isDisplayed()
    proposedCountyInput.isDisplayed()

    when: 'I select No'
    specificAreaRadios.checked = 'No'

    then: 'The details form is not shown'
    !proposedTownInput.isDisplayed()
    !proposedCountyInput.isDisplayed()

    when: 'I choose yes and save'
    specificAreaRadios.checked = 'Yes'
    find('#continueBtn').click()

    then: 'I see validation errors'
    at BassRequestPage

    when: 'I enter values and save'
    proposedTownInput << 'town'
    proposedCountyInput << 'county'
    find('#continueBtn').click()

    then: 'I see the tasklist'
    at TaskListPage
  }

  def 'I can submit a BASS request to the RO'() {

    given: 'A BASS request'
    testData.enableLdu("ABC", "ABC124")
    testData.loadLicence('eligibility/bassRequest-specificArea')

    when: 'I view the task list page'
    to TaskListPage, testData.testBookingId

    and: 'I click to continue to submission'
    taskListAction('Send for CAS2 area checks').click()

    then: 'I see the review BASS request page'
    at ReviewBassRequestPage

    and: 'The proposed BASS details are shown'
    bass.proposed.town == 'BASS Town'
    bass.proposed.county == 'BASS County'

    and: 'The change link is shown'
    changeBassLink.isDisplayed()

    when: 'I click to continue'
    find('#continueBtn').click()

    then: 'I see the sent confirmation page'
    at SentPage

    when: 'I click return to case list'
    find('#backBtn').click()

    then: 'I return to the case list'
    at CaselistPage
  }

  def 'When area is rejected, reason is shown'() {

    given: 'Rejected bass area'
    testData.loadLicence('eligibility/bassArea-rejected')

    when: 'on tasklist'
    to TaskListPage, testData.testBookingId

    and: 'I do the bass task'
    taskListAction('Curfew address').click()

    then: 'BASS task links to rejected page'
    at BassRejectedPage

    and: 'I see the rejection reason'
    bass.area.bassAreaReason == 'Reason'
  }

  @Unroll
  def 'On rejected BASS, #choice leads to #page'() {

    given: 'Rejected bass area'
    testData.loadLicence('eligibility/bassArea-rejected')
    to BassRejectedPage, testData.testBookingId

    when: 'I choose the option and proceed'
    alternativeAreaRadios.checked = choice
    find('#continueBtn').click()

    then: 'I see the page'
    at page

    where:
    choice | page
    'No'   | CurfewAddressChoicePage
    'Yes'  | BassRequestPage
  }
}
