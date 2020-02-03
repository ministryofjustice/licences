package uk.gov.justice.digital.hmpps.licences.specs.assessment

import geb.spock.GebReportingSpec
import spock.lang.Shared
import spock.lang.Stepwise
import uk.gov.justice.digital.hmpps.licences.pages.assessment.ProposedAddressRejectedPage
import uk.gov.justice.digital.hmpps.licences.pages.assessment.ProposedAddressCurfewAddressPage
import uk.gov.justice.digital.hmpps.licences.pages.assessment.ProposedAddressCurfewAddressChoicePage

import uk.gov.justice.digital.hmpps.licences.util.Actions
import uk.gov.justice.digital.hmpps.licences.util.TestData

@Stepwise
class ProposedAddressRejectedSpec extends GebReportingSpec {

    @Shared
    TestData testData = new TestData()

    @Shared
    Actions actions = new Actions()

    def setupSpec() {
      testData.loadLicence('assessment/unstarted')
      actions.logIn('CA')
    }

    def cleanupSpec() {
      actions.logOut()
    }

    def "Click 'save and continue' without selecting a radio button"() {

        given: 'I am on the ProposedAddressRejectedPage'
        to ProposedAddressRejectedPage, testData.markAndrewsBookingId

        when: 'I select the continue button'
        find('#continueBtn').click()

        then: 'I am redirected to the same page and error messages are displayed'
        at ProposedAddressRejectedPage

        errorSummary.text().contains('There is a problem')
        errorSummaryLinkMessage.text().contains('Select yes or no')
        inlineErrorMessage.text().contains("Select yes or no")
    }

    def "Select the 'Yes' radio then 'save and continue'"() {

        given: 'I am on the ProposedAddressRejectedPage'
        to (ProposedAddressRejectedPage, testData.markAndrewsBookingId)

        when: "I select the Yes radio button"
        alternativeAddressRadios.value('Yes')

        and : 'I select the continue button'
        find('#continueBtn').click()

        then: 'I am taken to the curfew address page'
        at ProposedAddressCurfewAddressPage
    }

    def "Select the 'No' radio then 'save and continue'"() {

        given: 'I am on the ProposedAddressRejectedPage'
        to ProposedAddressRejectedPage, testData.markAndrewsBookingId

        when: "I select the Yes radio button"
        alternativeAddressRadios.value('No')

        and : 'I select the continue button'
        find('#continueBtn').click()

        then: 'I am taken to the curfew address page'
        at ProposedAddressCurfewAddressChoicePage
    }
}

