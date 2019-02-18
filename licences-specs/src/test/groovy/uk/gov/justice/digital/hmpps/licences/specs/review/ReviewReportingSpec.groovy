package uk.gov.justice.digital.hmpps.licences.specs.review

import geb.spock.GebReportingSpec
import spock.lang.Shared
import spock.lang.Stepwise
import uk.gov.justice.digital.hmpps.licences.pages.review.ReviewConditionsPage
import uk.gov.justice.digital.hmpps.licences.pages.review.ReviewReportingPage
import uk.gov.justice.digital.hmpps.licences.util.Actions
import uk.gov.justice.digital.hmpps.licences.util.TestData

@Stepwise
class ReviewReportingSpec extends GebReportingSpec {

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

    def 'Shows reporting details entered by RO'() {

        given: 'A licence ready for final checks'
        testData.loadLicence('review/normal')

        when: 'I view the page'
        to ReviewReportingPage, testData.markAndrewsBookingId

        then: 'I see the reporting details'

        reporting.name == 'Reporting Name'

        reporting.address.line1 == 'Street'
        reporting.address.town == 'Town'
        reporting.address.postCode == 'AB1 1AB'

        reporting.address.telephone == '0123 456789'
    }

}
