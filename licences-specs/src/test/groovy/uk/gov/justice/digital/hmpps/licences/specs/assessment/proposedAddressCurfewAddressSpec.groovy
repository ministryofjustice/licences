package uk.gov.justice.digital.hmpps.licences.specs.assessment

import geb.spock.GebReportingSpec
import spock.lang.Shared
import spock.lang.Stepwise
import uk.gov.justice.digital.hmpps.licences.pages.assessment.ProposedAddressCurfewAddressPage
import uk.gov.justice.digital.hmpps.licences.pages.assessment.ReviewLicencePage


import uk.gov.justice.digital.hmpps.licences.util.Actions
import uk.gov.justice.digital.hmpps.licences.util.TestData

@Stepwise
class ProposedAddressCurfewAddressSpec extends GebReportingSpec {

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

    def "The Additional Information text area should be empty"() {
        when: 'I am on the Proposed Curfew Address page'
        to ProposedAddressCurfewAddressPage, testData.markAndrewsBookingId
        at ProposedAddressCurfewAddressPage

        then: 'the additional information text area is empty'
        assert additionalInformation == ''
    }

    def "The Additional Information text area accepts input"() {
      given: 'I am on the Proposed Curfew Address page'
      to ProposedAddressCurfewAddressPage, testData.markAndrewsBookingId
      at ProposedAddressCurfewAddressPage

      and: 'I input the following details'
      street = 'High Street'
      town = 'Sheffield'
      postcode = 'AB12 3CD'
      telephone = '1234567'
      occupier 'Mr Smith'
      relation 'dad'
      caution = 'No'
      additionalInformation  =  "Some extra info"

      when: 'I click to continue'
      saveAndContinue.click()

      then: 'the review licence page is displayed'
      at ReviewLicencePage

      when: 'I click the back link'
      backLink.click()

      then: 'the information i previously input data is displayed'
      assert additionalInformation == 'Some extra info'
    }

}

