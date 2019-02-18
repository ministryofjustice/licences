package uk.gov.justice.digital.hmpps.licences.specs.assessment

import geb.spock.GebReportingSpec
import spock.lang.Shared
import spock.lang.Stepwise
import uk.gov.justice.digital.hmpps.licences.pages.TaskListPage
import uk.gov.justice.digital.hmpps.licences.pages.assessment.BassAreaCheckPage
import uk.gov.justice.digital.hmpps.licences.util.Actions
import uk.gov.justice.digital.hmpps.licences.util.TestData

@Stepwise
class BassAreaSpec extends GebReportingSpec {

    @Shared
    TestData testData = new TestData()

    @Shared
    Actions actions = new Actions()

    def setupSpec() {
        testData.loadLicence('assessment/bassArea-unstarted')
        actions.logIn('RO')
    }

    def cleanupSpec() {
        actions.logOut()
    }

    def 'Answer initially blank' () {

        given: 'At task list page'
        to TaskListPage, testData.markAndrewsBookingId

        when: 'I start the BASS area task'
        taskListAction('BASS area check').click()

        then: 'I see the bass area page'
        at BassAreaCheckPage

        and: 'The options are unset'
        areaRadios.checked == null

        and: 'The reason input is always shown'
        areaReasons.isDisplayed()

        and: 'The requested area is shown'
        bass.proposed.town == 'BASS Town'
        bass.proposed.county == 'BASS County'
    }

    def 'Shows previously saved values'() {

        given: 'Bass area rejected'
        testData.loadLicence('assessment/bassArea-rejected')

        when: 'I view the bass area page'
        to BassAreaCheckPage, testData.markAndrewsBookingId

        then: 'I see the previous values'
        areaRadios.checked == 'No'
        areaReasons.text() == 'Reason'
    }

    def 'Modified choices are not saved after return to tasklist'() {

        given: 'On the bass area page'
        at BassAreaCheckPage

        when: 'I select new options'
        areaRadios.checked = 'Yes'

        and: 'I choose return to tasklist'
        $('#backLink').click()
        at TaskListPage

        and: 'I go back to the bass area page'
        to BassAreaCheckPage, testData.markAndrewsBookingId

        then: 'I see the original values'
        areaRadios.checked == 'No'
    }

    def 'Does not show radios when no specific area'() {

        given: 'No specific area requested'
        testData.loadLicence('assessment/bassArea-unstarted-no-area')

        when: 'I view the bass area page'
        to BassAreaCheckPage, testData.markAndrewsBookingId

        then: 'The radios are not shown'
        !areaRadios.isDisplayed()

        and: 'The reason input is always shown'
        areaReasons.isDisplayed()

        and: 'No preferred area message is shown'
        $('#noSpecificAreaMessage').isDisplayed()
    }
}
