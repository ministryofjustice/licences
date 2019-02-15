package uk.gov.justice.digital.hmpps.licences.specs.assessment

import geb.spock.GebReportingSpec
import spock.lang.Shared
import spock.lang.Stepwise
import uk.gov.justice.digital.hmpps.licences.pages.*
import uk.gov.justice.digital.hmpps.licences.pages.assessment.LicenceConditionsAdditionalPage
import uk.gov.justice.digital.hmpps.licences.pages.assessment.RiskManagementPage
import uk.gov.justice.digital.hmpps.licences.pages.assessment.LicenceConditionsStandardPage
import uk.gov.justice.digital.hmpps.licences.util.Actions
import uk.gov.justice.digital.hmpps.licences.util.TestData

@Stepwise
class LicenceConditionsSpec extends GebReportingSpec {

    @Shared
    TestData testData = new TestData()

    @Shared
    Actions actions = new Actions()

    def setupSpec() {
        testData.loadLicence('assessment/unstarted')
        actions.logIn('RO')
    }

    def cleanupSpec() {
        actions.logOut()
    }

    def 'Standard conditions page shown first'() {

        given: 'At task list page'
        to TaskListPage, testData.markAndrewsBookingId

        when: 'I start the additional conditions task'
        taskListAction('Additional conditions').click()

        then: 'I see the standard conditions page'
        at LicenceConditionsStandardPage
    }

    def 'Options initially unset'() {

        when: 'I view the standard conditions page'
        at LicenceConditionsStandardPage

        then:
        additionalConditionsRadios.checked == null
    }

    def 'When additional conditions NOT required, does NOT show additional conditions page'() {

        given: 'At standard page'
        at LicenceConditionsStandardPage

        when: 'I select no additional conditions'
        additionalConditionsRadios = 'No'

        and: 'I continue'
        find('#continueBtn').click()

        then: 'I see the tasklist'
        at TaskListPage
    }

    def 'When additional conditions required, shows additional conditions page'() {

        when: 'I view the standard conditions page'
        to LicenceConditionsStandardPage, testData.markAndrewsBookingId

        and: 'I select additional conditions required'
        additionalConditionsRadios = 'Yes'

        and: 'I continue'
        find('#continueBtn').click()

        then: 'I see the additional conditions page'
        at LicenceConditionsAdditionalPage
    }

    def 'Additional conditions initially unset'() {

        when: 'At additional conditions page'
        at LicenceConditionsAdditionalPage

        then: 'Options not set'
        conditions.every { !it.value() }

        and: 'I see the right number of conditions'
        conditions.size() == 31
    }

    def 'Select a condition reveals the input form'() {

        when: 'At additional conditions page'
        at LicenceConditionsAdditionalPage

        then: 'The input form is not shown'
        !$("#groupsOrOrganisation").isDisplayed()

        when: 'I select a condition requiring additional input'
        $("form").additionalConditions = 'NOCONTACTASSOCIATE'

        then: 'The input form is shown'
        $("#groupsOrOrganisation").isDisplayed()
    }


    def 'Modified additional conditions not saved on return to tasklist'() {

        when: 'At additional conditions page'
        at LicenceConditionsAdditionalPage

        and: 'I select some conditions'
        $("form").additionalConditions = ['NOCONTACTPRISONER', 'NOCONTACTASSOCIATE', 'NORESIDE']

        and: 'I choose return to tasklist'
        find('#backBtn').click()
        at TaskListPage

        and: 'I view the additional conditions page'
        to LicenceConditionsAdditionalPage, testData.markAndrewsBookingId

        then: 'Options not set'
        conditions.every { !it.value() }
    }

    def 'Modified Additional conditions saved on save and continue'() {

        when: 'At additional conditions page'
        at LicenceConditionsAdditionalPage

        and: 'I select some conditions'
        $("form").additionalConditions = ['NOCONTACTPRISONER', 'NOCONTACTASSOCIATE']
        $("#groupsOrOrganisation") << 'sample input'

        and: 'I save and continue'
        find('#continueBtn').click()

        and: 'I view the additional conditions page'
        to LicenceConditionsAdditionalPage, testData.markAndrewsBookingId

        then: 'I see the previously entered values'
        conditionsItem('NOCONTACTPRISONER').checked
        conditionsItem('NOCONTACTASSOCIATE').checked
        $("#groupsOrOrganisation").value() == 'sample input'
    }

    def 'I can add bespoke conditions'() {
        given: 'I am on the additional conditions page'
        to LicenceConditionsAdditionalPage, testData.markAndrewsBookingId

        and: 'I enter a bespoke condition'
        addBespokeRadios = 'Yes'
        bespoke.conditions[0].input << 'Bespoke 1'

        and: 'I save and continue'
        find('#continueBtn').click()

        when: 'I view the additional conditions page'
        to LicenceConditionsAdditionalPage, testData.markAndrewsBookingId

        then: 'I see the previously entered values'
        bespoke.conditions[0].value == 'Bespoke 1'
    }

    def 'I can add multiple bespoke conditions'() {
        given: 'I am on the additional conditions page'
        to LicenceConditionsAdditionalPage, testData.markAndrewsBookingId

        when: 'I click to add another 2 bespoke conditions'
        find('.addBespokeButton').click()
        find('.addBespokeButton').click()

        then: 'I see 2 more bespoke conditions text boxes'
        bespoke.conditions.size == 3

        when: 'I input new conditions'
        bespoke.conditions[1].input << 'Bespoke 2'
        bespoke.conditions[2].input << 'Bespoke 3'

        and: 'I click to remove one'
        bespoke.conditions[1].removeControl.click()

        then: 'The bespoke condition box is not displayed'
        bespoke.conditions.size == 2
        !bespoke.conditions*.value.contains('Bespoke 2')

        when: 'I click to continue'
        find('#continueBtn').click()

        and: 'I return to the additional conditions page'
        to LicenceConditionsAdditionalPage, testData.markAndrewsBookingId

        then: 'I see the previously entered values'
        bespoke.conditions[0].value == 'Bespoke 1'
        bespoke.conditions[1].value == 'Bespoke 3'
    }
}
