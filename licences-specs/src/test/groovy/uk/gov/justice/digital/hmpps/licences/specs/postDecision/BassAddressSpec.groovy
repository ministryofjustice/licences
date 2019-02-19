package uk.gov.justice.digital.hmpps.licences.specs.postDecision

import spock.lang.Shared
import uk.gov.justice.digital.hmpps.licences.pages.TaskListPage
import uk.gov.justice.digital.hmpps.licences.pages.finalchecks.BassOfferPage
import uk.gov.justice.digital.hmpps.licences.pages.finalchecks.BassWithdrawnPage
import uk.gov.justice.digital.hmpps.licences.util.Actions
import uk.gov.justice.digital.hmpps.licences.util.TestData


class BassAddressSpec {

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

  def 'Shows previous inputs'() {

    given: 'An approved bass request case'
    testData.loadLicence('postDecision/bassAddress-unstarted')

    when: 'I view the bass offer page'
    to BassOfferPage, testData.markAndrewsBookingId

    then: 'I see the previous inputs'
    bass.proposed.town == 'BASS Town'
    bass.proposed.county == 'BASS County'
    bass.area.bassAreaReason == 'Reason'
  }

  def 'Address form shown when option is yes'() {

    when: 'I select yes for offer outcome'
    bassAcceptedRadios.checked = 'Yes'

    then: 'I see the BASS address form'
    bassAddressForm.isDisplayed()

    when: 'I select Unsuitable for offer outcome'
    bassAcceptedRadios.checked = 'Unsuitable'

    then: 'I do not see the BASS address form'
    !bassAddressForm.isDisplayed()
  }

  def 'BASS can be withdrawn and reinstated'() {

    when: 'I withdraw cosent'
    find('#withdrawBassOffer').click()

    then: 'I see the withdrawn page'
    at BassWithdrawnPage

    when: 'I choose reinstate'
    find('#reinstate').click()

    then: 'I see the withdrawn page'
    at BassWithdrawnPage

    and: 'I see the offer withdrawn message'
    $('#error-summary-heading').isDisplayed()

    when: 'I reinstate'
    find('#reinstateBass').click()

    then: 'I see the tasklist'
    at TaskListPage
  }
}
