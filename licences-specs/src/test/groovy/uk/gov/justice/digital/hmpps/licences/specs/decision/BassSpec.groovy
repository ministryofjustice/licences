package uk.gov.justice.digital.hmpps.licences.specs.decision

import geb.spock.GebReportingSpec
import spock.lang.Shared
import spock.lang.Stepwise
import uk.gov.justice.digital.hmpps.licences.pages.decision.ApprovalReleasePage
import uk.gov.justice.digital.hmpps.licences.pages.review.ReviewBassOfferPage
import uk.gov.justice.digital.hmpps.licences.util.Actions
import uk.gov.justice.digital.hmpps.licences.util.TestData

@Stepwise
class BassSpec extends GebReportingSpec {

  @Shared
  TestData testData = new TestData()
  @Shared
  Actions actions = new Actions()

  def setupSpec() {
    testData.loadLicence('decision/bassRequest-unstarted')
    actions.logIn('DM')
  }

  def cleanupSpec() {
    actions.logOut()
  }

  def 'Shows bass area and offer details'() {

    when: 'I view the bass offer review page'
    to ReviewBassOfferPage, testData.testBookingId

    then: 'I see the previous entered values'
    bass.proposed.town == 'BASS Town'
    bass.proposed.county == 'BASS County'

    bass.offer.outcome == 'Offer made and property available'
    bass.offer.details == 'Offer details'
  }

}
