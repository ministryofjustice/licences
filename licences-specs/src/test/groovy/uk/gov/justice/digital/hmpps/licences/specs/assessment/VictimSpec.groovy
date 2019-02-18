package uk.gov.justice.digital.hmpps.licences.specs.assessment

import geb.spock.GebReportingSpec
import spock.lang.Shared
import spock.lang.Stepwise
import uk.gov.justice.digital.hmpps.licences.pages.TaskListPage
import uk.gov.justice.digital.hmpps.licences.pages.assessment.VictimLiaisonPage
import uk.gov.justice.digital.hmpps.licences.util.Actions
import uk.gov.justice.digital.hmpps.licences.util.TestData

@Stepwise
class VictimSpec extends GebReportingSpec {

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

    def 'Options initially blank' () {

        given: 'At task list page'
        to TaskListPage, testData.markAndrewsBookingId

        when: 'I start the victim task'
        taskListAction('Victim liaison').click()

        then: 'I see the victim liaison page'
        at VictimLiaisonPage

        and: 'The options are unset'
        victimLiaisonRadios.checked == null
    }

    def 'Further details form shown when Yes' () {

        when: 'At victim liaison page'
        at VictimLiaisonPage

        then: 'I dont see the reason form'
        !victimLiaisonForm.isDisplayed()

        when: 'I select yes'
        victimLiaisonRadios.checked = 'Yes'

        then: 'I see the reason form'
        victimLiaisonForm.isDisplayed()
    }

    def 'Modified choices are saved after save and continue' () {

        given:  'At victim liaison page'
        at VictimLiaisonPage

        when: 'I select new options'
        victimLiaisonRadios.checked = 'Yes'

        and: 'I save and continue'
        find('#continueBtn').click()

        and: 'I return to the victim liaison page'
        to VictimLiaisonPage, testData.markAndrewsBookingId

        then: 'I see the previously entered values'
        victimLiaisonRadios.checked == 'Yes'
    }
}
