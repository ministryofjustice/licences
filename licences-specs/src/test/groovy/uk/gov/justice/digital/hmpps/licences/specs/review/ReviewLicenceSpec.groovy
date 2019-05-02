package uk.gov.justice.digital.hmpps.licences.specs.review

import geb.spock.GebReportingSpec
import spock.lang.Shared
import spock.lang.Stepwise
import uk.gov.justice.digital.hmpps.licences.pages.review.ReviewLicencePage
import uk.gov.justice.digital.hmpps.licences.util.Actions
import uk.gov.justice.digital.hmpps.licences.util.TestData

@Stepwise
class ReviewLicenceSpec extends GebReportingSpec {

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

  def 'Does not show change details links when user is RO but processing stage is not with RO'() {

    given: 'A licence ready for final checks'
    testData.loadLicence('finalchecks/final-checks-done')

    when: 'I view the page'
    to ReviewLicencePage, testData.markAndrewsBookingId

    then: 'I do not see change details links'
    $('a', id: contains('EditLink')).size() == 0
  }

  def 'Does not show other sections when address is rejected'() {

    given: 'A licence with rejected address'
    testData.loadLicence('review/address-rejected')

    when: 'I view the page'
    to ReviewLicencePage, testData.markAndrewsBookingId

    then: 'I see the address detail'
    $('#curfewAddressDetails').isDisplayed()

    and: 'I do not see the other sections'
    !$('#riskDetails').isDisplayed()
    !$('#curfewHoursDetails').isDisplayed()
    !$('#conditionsDetails').isDisplayed()
    !$('#reportingDetails').isDisplayed()
  }
}
