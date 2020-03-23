package uk.gov.justice.digital.hmpps.licences.specs.assessment
import geb.spock.GebReportingSpec
import spock.lang.Shared
import spock.lang.Stepwise
import uk.gov.justice.digital.hmpps.licences.pages.TaskListPage
import uk.gov.justice.digital.hmpps.licences.pages.assessment.BassReferralBassRequestPage
import uk.gov.justice.digital.hmpps.licences.pages.assessment.ProposedAddressCurfewAddressChoicePage
import uk.gov.justice.digital.hmpps.licences.util.Actions
import uk.gov.justice.digital.hmpps.licences.util.TestData

@Stepwise
class BassReferralBassRequestSpec extends GebReportingSpec {

    @Shared
    TestData testData = new TestData()

    @Shared
    Actions actions = new Actions()

  def cleanupSpec() {
    actions.logOut()
  }


    def "The Additional Information text area should be empty"() {
      testData.loadLicence('assessment/unstarted')
      actions.logIn('CA')

      to BassReferralBassRequestPage, testData.markAndrewsBookingId

      given: 'I am on the Preferred Bass areas page'
      at BassReferralBassRequestPage

      and: 'The additional info text area should be blank'
      additionalInformation == ''

      and: 'then I Logout'
      cleanupSpec()
    }

   def "The Additional Information text area accepts input"() {
     testData.loadLicence('assessment/BassArea-CA')
     actions.logIn('CA')

     to BassReferralBassRequestPage, testData.markAndrewsBookingId

     given: 'I am on the Preferred Bass area'
     at BassReferralBassRequestPage

     and: 'I input some information'
     additionalInformation = "Some additional info"

     and: 'I select the NO radio button'
     specificArea.click()

     when: 'click continue'
     saveAndContinue.click()

     then: 'I am taken to the tasklist page'
     at TaskListPage

     when: 'I select the back link'
     to ProposedAddressCurfewAddressChoicePage, testData.markAndrewsBookingId

     then: 'Im at the Address Choice page'
     at ProposedAddressCurfewAddressChoicePage

     when: 'I click the Bass radio button'
     bass.click()

     and: "Save and continue"
     saveAndContinue.click()

     then: 'Im back at the bass request page'
     at BassReferralBassRequestPage

     and: 'The previosuly entered info should be displayed'
     additionalInformation == "Some additional info"

    and: 'then I Logout'
    cleanupSpec()

  }
}
