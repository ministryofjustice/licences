package uk.gov.justice.digital.hmpps.licences.specs.finalchecks

import geb.spock.GebReportingSpec
import spock.lang.Shared
import spock.lang.Stepwise
import spock.lang.Unroll
import uk.gov.justice.digital.hmpps.licences.pages.TaskListPage
import uk.gov.justice.digital.hmpps.licences.pages.eligibility.BassRejectedPage
import uk.gov.justice.digital.hmpps.licences.pages.eligibility.BassRequestPage
import uk.gov.justice.digital.hmpps.licences.pages.eligibility.CurfewAddressChoicePage
import uk.gov.justice.digital.hmpps.licences.pages.eligibility.EligibilityExclusionPage
import uk.gov.justice.digital.hmpps.licences.pages.finalchecks.BassOfferPage
import uk.gov.justice.digital.hmpps.licences.pages.finalchecks.BassUnsuitablePage
import uk.gov.justice.digital.hmpps.licences.pages.finalchecks.BassWithdrawnPage
import uk.gov.justice.digital.hmpps.licences.pages.finalchecks.FinalChecksConfiscationOrderPage
import uk.gov.justice.digital.hmpps.licences.pages.finalchecks.FinalChecksOnRemandPage
import uk.gov.justice.digital.hmpps.licences.pages.finalchecks.FinalChecksSeriousOffencePage
import uk.gov.justice.digital.hmpps.licences.util.Actions
import uk.gov.justice.digital.hmpps.licences.util.TestData

@Stepwise
class BassOfferSpec extends GebReportingSpec {

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

  def 'BASS offer starts with nothing selected'() {

    given: 'A licence ready for final checks'
    testData.loadLicence('finalchecks/bassOffer-unstarted')

    when: 'I view the BASS offer page'
    to BassOfferPage, testData.markAndrewsBookingId

    then: 'No radio option is selected'
    bassAcceptedRadios.checked == null

    and: ' The address form is not shown'
    !bassAddressForm.isDisplayed()

    and: 'The details input is always shown'
    bassOfferDetails.isDisplayed()
  }

  def 'Shows previously saved values'() {

    given: 'BASS offer in progress'
    testData.loadLicence('finalchecks/bassOffer-unsuitable')

    when: 'I view the serious offence page'
    to BassOfferPage, testData.markAndrewsBookingId

    then: 'I see the previous values'
    bassAcceptedRadios.checked == 'Unsuitable'
    bass.proposed.town == 'BASS Town'
    bass.proposed.county == 'BASS County'
  }

  @Unroll
  def 'BASS offer #choice leads to #page'() {

    given: 'A licence ready for final checks'
    testData.loadLicence('finalchecks/bassOffer-unstarted')
    to BassOfferPage, testData.markAndrewsBookingId

    when: 'I choose the option and proceed'
    bassAcceptedRadios.checked = choice
    find('#continueBtn').click()

    then: 'I see the page'
    at page

    where:
    choice        | page
    'Yes'         | TaskListPage
    'Unsuitable'  | BassUnsuitablePage
    'Unavailable' | TaskListPage
  }

  def 'BASS can be withdrawn and reinstated'() {

    given: 'A licence ready for final checks'
    testData.loadLicence('finalchecks/bassOffer-unstarted')
    to BassOfferPage, testData.markAndrewsBookingId

    when: 'I withdraw cosent'
    find('#withdrawBassOffer').click()

    then: 'I see the withdrawn page'
    at BassWithdrawnPage

    when: 'I choose reinstate'
    find('#reinstate').click()

    then: 'I see the bass offer page'
    at BassOfferPage

    and: 'I see the offer withdrawn message'
    $('#error-summary-heading').isDisplayed()

    when: 'I reinstate'
    find('#reinstateBass').click()

    then: 'I see the tasklist'
    at TaskListPage
  }

  @Unroll
  def 'After BASS withdrawn #choice leads to #page'() {

    given: 'A withdrawn BASS request'
    testData.loadLicence('finalchecks/bassOffer-withdrawn')
    to BassWithdrawnPage, testData.markAndrewsBookingId

    when: 'I choose the option'
    decisionRadios.checked = choice
    find('#continueBtn').click()

    then: 'I see the page'
    at page

    where:
    choice | page
    'Yes'  | BassRequestPage
    'No'   | CurfewAddressChoicePage
  }
}
