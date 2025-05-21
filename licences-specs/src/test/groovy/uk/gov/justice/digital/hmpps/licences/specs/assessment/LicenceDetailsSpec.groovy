package uk.gov.justice.digital.hmpps.licences.specs.assessment

import geb.spock.GebReportingSpec
import spock.lang.Shared
import spock.lang.Stepwise
import spock.lang.Unroll
import uk.gov.justice.digital.hmpps.licences.pages.assessment.*
import uk.gov.justice.digital.hmpps.licences.util.Actions
import uk.gov.justice.digital.hmpps.licences.util.TestData

@Stepwise
class LicenceDetailsSpec extends GebReportingSpec {

  @Shared
  TestData testData = new TestData()

  @Shared
  Actions actions = new Actions()

  def setupSpec() {
    testData.loadLicence('assessment/reporting')
    actions.logIn('RO')
    to LicenceDetailsPage, testData.testBookingId
  }

  def cleanupSpec() {
    actions.logOut()
  }

  def 'Shows offender details'() {

    when: 'I view the licence details summary page for the licence record'
    at LicenceDetailsPage

    then: 'I see the expected offender details data'
    offender.details.name == 'Osiss Helkarci'
    offender.details.nomisId == 'A5001DY'
    offender.details.dob == '22/10/1989'
  }

  def 'Shows address details'() {

    when: 'I view the licence details summary page for the licence record'
    at LicenceDetailsPage

    then: 'I see the address details'
    curfew.address.line1 == 'Street'
    curfew.address.town == 'Town'
    curfew.address.postCode == 'AB1 1AB'
    curfew.address.telephone == '0123456789'

    and: 'I see the occupier details'
    curfew.occupier.name == 'Main Occupier'
    curfew.occupier.relationship == 'Brother'

    and: 'I see the other residents details'
    curfew.residents.size() == 2

    curfew.residents[0].name == 'Other Resident'
    curfew.residents[0].age == '10'
    curfew.residents[0].relationship == 'Son'

    curfew.residents[1].name == 'Yet Another'
    curfew.residents[1].age == '20'
    curfew.residents[1].relationship == 'Wife'

    and: 'I see the review details'
    curfew.reviewAnswers.cautioned == 'No'
    curfew.reviewAnswers.consent == 'Yes'
    curfew.reviewAnswers.homeVisit == 'Yes'
    curfew.reviewAnswers.electricity == 'Yes'
  }

  def 'Shows curfew hours details'() {

    when: 'I view the licence details summary page for the licence record'
    at LicenceDetailsPage

    then: 'I see the curfew hours details'
    curfew.curfewHours('Monday From') == '21:22'
    curfew.curfewHours('Monday Until') == '08:09'
    curfew.curfewHours('Tuesday From') == '19:00'
    curfew.curfewHours('Tuesday Until') == '07:00'
    curfew.curfewHours('Wednesday From') == '19:00'
    curfew.curfewHours('Wednesday Until') == '07:00'
    curfew.curfewHours('Thursday From') == '19:00'
    curfew.curfewHours('Thursday Until') == '07:00'
    curfew.curfewHours('Friday From') == '19:00'
    curfew.curfewHours('Friday Until') == '07:00'
    curfew.curfewHours('Saturday From') == '19:00'
    curfew.curfewHours('Saturday Until') == '07:00'
    curfew.curfewHours('Sunday From') == '18:19'
    curfew.curfewHours('Sunday Until') == '06:07'
  }

  def 'Shows conditions details'() {

    when: 'I view the licence details summary page for the licence record'
    at LicenceDetailsPage

    then: 'I see the licence conditions details'
    conditions.additional.size() == 2

    conditions.additional[0].number == '1.'
    conditions.additional[0].title == 'Possession, ownership, control or inspection of specified items or documents.'

    conditions.additional[1].number == '2.'
    conditions.additional[1].content == 'First bespoke condition'

    conditions.justification == 'They were necessary.'
  }

  def 'Shows risk management details'() {

    when: 'I view the licence details summary page for the licence record'
    at LicenceDetailsPage

    then: 'I see the risk management details'
    risk.answers.planningActions == 'No'
    risk.answers.information == 'No'
  }

  def 'Shows reporting details'() {

    when: 'I view the licence details summary page for the licence record'
    at LicenceDetailsPage

    then: 'I see the reporting details'

    reporting.name == 'Reporting Name'
    reporting.organisation == 'Reporting Organisation'

    reporting.address.line1 == 'Street'
    reporting.address.town == 'Town'
    reporting.address.postCode == 'AB1 1AB'

    reporting.address.telephone == '0123456789'
  }

  @Unroll
  def 'Shows link to change #section details'() {

    given: 'Viewing licence details summary'
    to LicenceDetailsPage, testData.testBookingId

    when: 'I click the change details link for a section'
    changeDetailsLink(section).click()

    then: 'I see the corresponding section page'
    at page

    where:
    section       | page
    'address'     | ApprovedPremisesPage
    'curfewHours' | CurfewHoursPage
    'conditions'  | LicenceConditionsStandardPage
    'risk'        | RiskManagementV1Page
    'victim'      | VictimLiaisonPage
    'reporting'   | ReportingInstructionsPage
  }

  def 'Does not show other sections when address is rejected'() {

    given: 'A licence with rejected address'
    testData.loadLicence('assessment/address-rejected')

    when: 'I view the page'
    to LicenceDetailsPage, testData.testBookingId

    then: 'I see the address detail'
    $('#curfewAddressDetails').isDisplayed()

    and: 'I do not see the other sections'
    !$('#riskDetails').isDisplayed()
    !$('#curfewHoursDetails').isDisplayed()
    !$('#conditionsDetails').isDisplayed()
    !$('#reportingDetails').isDisplayed()
    !$('#victimDetails').isDisplayed()
  }

  @Unroll
  def 'Does not show subsequent questions when rejected for #reason'() {

    given: 'Address rejected for a reason'
    testData.loadLicence(sample)

    when: 'I view the page'
    to LicenceDetailsPage, testData.testBookingId

    then: 'I see the review questions up to the point of rejection'
    curfew.reviewAnswers == answers

    where:
    reason           | sample                                    | answers
    'no consent'     | 'assessment/address-rejected'             | [consent: 'No', electricity: null, homeVisit: null, cautioned: 'No']
    'no electricity' | 'assessment/address-rejected-electricity' | [consent: 'Yes', electricity: 'No', homeVisit: null, cautioned: 'No']
  }

  def 'Shows BASS details when BASS referral'() {

    given: 'A BASS request'
    testData.loadLicence('assessment/bassArea-rejected')

    when: 'I view the licence details summary page for the licence record'
    to LicenceDetailsPage, testData.testBookingId

    then: 'I see the bass details'
    bass.proposed.county == 'BASS County'
    bass.proposed.town == 'BASS Town'
    bass.area.bassAreaSuitable == 'No'
    bass.area.bassAreaReason == 'Reason'
  }

  def 'Shows approved premises details when approved premises required'() {

    given: 'Approved premises required'
    testData.loadLicence('assessment/approved-premises-done')

    when: 'I view the licence details summary page for the licence record'
    to LicenceDetailsPage, testData.testBookingId

    then: 'I see the approved premises address details'
    $('#approvedPremisesDetails').isDisplayed()
    approvedPremises.address.line1 == 'AP1'
    approvedPremises.address.line2 == 'AP2'
    approvedPremises.address.town == 'APtown'
    approvedPremises.address.postCode == 'AP11AP'
    approvedPremises.address.telephone == '111'

    and: 'I do not see the risk section'
    !$('#riskDetails').isDisplayed()
  }

  def 'Shows approved premises address error message when no address provided'() {

    given: 'Approved premises section started'
    testData.loadLicence('assessment/approved-premises')

    when: 'I view the licence details summary page for the licence record'
    to LicenceDetailsPage, testData.testBookingId

    then: 'I see the a warning message'
    $('#approvedPremisesAddress-error').text() == 'Enter the approved premises address details'
  }

  def 'Shows error messages for sections that have not been started'() {
    given: 'No sections have been started'
    testData.loadLicence('assessment/unstarted')

    when: 'I view the licence details summary page for the licence record'
    to LicenceDetailsPage, testData.testBookingId

    then: 'I see the error messages for each uncompleted section'

    proposedAddressError == 'Enter the curfew address review details'
    riskError == 'Enter the risk management details'
    victimLiaisonError == 'Enter the victim liaison details'
    curfewHoursError == 'Enter the proposed curfew hours'
    additionalConditionsError == 'Select one or more additional conditions'
    reportingInstructionsError == 'Enter the reporting instructions'
  }

  def 'Shows error messages for incomplete address review section'() {
    given: 'Proposed curfew address section is incomplete'
    testData.loadLicence('assessment/address-incomplete')

    when: 'I view the licence details summary page for the licence record'
    to LicenceDetailsPage, testData.testBookingId

    then: 'I see an error message for incomplete details'
    addressDetails.electricitySupplyError == 'Say if there is an electricity supply'
  }

  def 'Shows version 1 of the error when curfew address review started but nothing submitted'() {
    given: 'Proposed curfew address section is incomplete'
    testData.loadLicence('assessment/curfewAddressReview-with-version-1')

    when: 'I view the licence details summary page for the licence record'
    to LicenceDetailsPage, testData.testBookingId

    then: 'I see an error message for incomplete details'
    curfew.consentV1Error == 'Say if the homeowner consents to HDC'
  }

  def 'Shows version 2 of the error when curfew address review started but nothing submitted'() {
    given: 'Proposed curfew address section is incomplete'
    testData.loadLicence('assessment/curfewAddressReview-with-version-2')

    when: 'I view the licence details summary page for the licence record'
    to LicenceDetailsPage, testData.testBookingId

    then: 'I see an error message for incomplete details'
    curfew.consentV2Error == 'Say if you were able to speak to the main occupier and if they consented to HDC'
  }
}
