package uk.gov.justice.digital.hmpps.licences.specs.assessment

import geb.spock.GebReportingSpec
import spock.lang.Shared
import spock.lang.Stepwise
import spock.lang.Unroll
import uk.gov.justice.digital.hmpps.Stage
import uk.gov.justice.digital.hmpps.licences.pages.CaselistPage
import uk.gov.justice.digital.hmpps.licences.pages.assessment.BassAreaCheckPage
import uk.gov.justice.digital.hmpps.licences.pages.assessment.CurfewAddressReviewPage
import uk.gov.justice.digital.hmpps.licences.pages.assessment.LicenceDetailsPage
import uk.gov.justice.digital.hmpps.licences.pages.assessment.ReportingInstructionsPage
import uk.gov.justice.digital.hmpps.licences.pages.assessment.RiskManagementPage
import uk.gov.justice.digital.hmpps.licences.pages.SentPage
import uk.gov.justice.digital.hmpps.licences.pages.assessment.LicenceConditionsStandardPage
import uk.gov.justice.digital.hmpps.licences.pages.TaskListPage
import uk.gov.justice.digital.hmpps.licences.pages.assessment.VictimLiaisonPage
import uk.gov.justice.digital.hmpps.licences.pages.review.ReviewLicencePage
import uk.gov.justice.digital.hmpps.licences.util.Actions
import uk.gov.justice.digital.hmpps.licences.util.TestData

@Stepwise
class TaskListSpec extends GebReportingSpec {

    @Shared
    TestData testData = new TestData()

    @Shared
    Actions actions = new Actions()

    @Shared
    def tasks = [
            address   : 'Proposed curfew address',
            bass      : 'BASS area check',
            conditions: 'Additional conditions',
            risk      : 'Risk management',
            victim    : 'Victim liaison',
            reporting : 'Reporting instructions',
            submit    : 'Submit to prison case admin'
    ]

    def setupSpec() {
        actions.logIn('RO')
    }

    def cleanupSpec() {
        actions.logOut()
    }

    @Stage
    def 'Shows details of the prisoner (from nomis)'() {

        given: 'An unprocessed licence'
        testData.loadLicence('assessment/unstarted')

        when: 'I view the task list page'
        to TaskListPage, testData.markAndrewsBookingId

        then: 'I see the expected offender details data'
        offender.details.name == 'Mark Andrews'
        offender.details.nomisId == 'A5001DY'
        offender.details.dob == '22/10/1989'
        //offender.details.roName == 'Ryan Orton'
        offender.details.externalLocation == 'HMP Albany'
        offender.details.offences == "Cause exceed max permitted wt of artic' vehicle - No of axles/configuration (No MOT/Manufacturer's Plate)"
        offender.details.crd == '15/10/2019'
        offender.details.hdced == '23/08/2019'
        offender.details.internalLocation == 'T-T1-001'
        offender.details.sed == '24/05/2020'
        offender.details.led == '02/05/2020'
        offender.details.pssed == '15/10/2020'
    }

    def 'Back link goes back to case list'() {

        when: 'I view the page'
        at TaskListPage

        and: 'I click the back to dashboard button'
        $('a', text: 'Back to case list').click()

        then: 'I go back to the dashboard'
        at CaselistPage
    }

    def 'Shows start now button for all tasks except submit'() {

        when: 'I view the page'
        to TaskListPage, testData.markAndrewsBookingId

        then: 'I see the task buttons and the submit button'
        taskListActions.size() == 7

        and: 'The buttons all say Start'
        taskListActions.take(5).every { it.text() == 'Start now' }
        taskListActions.last().text() == 'Continue'
    }

    @Unroll
    def '#task button links to page'() {

        given: 'Viewing task list'
        to TaskListPage, testData.markAndrewsBookingId

        when: 'I start the task'
        taskListAction(task).click()

        then: 'I see the journey page'
        at page

        where:
        task             | page
        tasks.address    | CurfewAddressReviewPage
        tasks.conditions | LicenceConditionsStandardPage
        tasks.risk       | RiskManagementPage
        tasks.victim     | VictimLiaisonPage
        tasks.reporting  | ReportingInstructionsPage
    }

    def 'Shows change link for tasks that have been done'() {

        given: 'Tasks started except reporting instructions'
        testData.loadLicence('assessment/risks-no')

        when: 'I view the page'
        to TaskListPage, testData.markAndrewsBookingId

        then: 'I see the task buttons and the submit button'
        taskListActions.size() == 7

        and: 'The links for completed tasks all say Change'
        taskListAction(tasks.address).text() == 'Change'
        taskListAction(tasks.conditions).text() == 'Change'
        taskListAction(tasks.risk).text() == 'Change'
        taskListAction(tasks.victim).text() == 'Change'
        taskListAction(tasks.reporting).text() == 'Start now'
    }

    def 'Shows Submit button even when tasks are not done'() {

        given: 'Tasks not all done'
        testData.loadLicence('assessment/unstarted')

        when: 'I view the page'
        to TaskListPage, testData.markAndrewsBookingId

        then: 'I see the task buttons'
        taskListActions.size() == 7

        and: 'There is a submit to OMU button'
        taskListAction(tasks.submit).text() == 'Continue'
    }

    // @Stage todo prep data on stage
    def 'I can submit the licence back to the CA'() {

        given: 'All tasks done'
        testData.loadLicence('assessment/done')

        when: 'I press submit to PCA'
        to TaskListPage, testData.markAndrewsBookingId
        taskListAction(tasks.submit).click()

        then: 'I see the licence details page'
        at LicenceDetailsPage

        when: 'I click continue'
        find('#continueBtn').click()

        then: 'I see the sent to CA confirmation page'
        at SentPage

        and: 'I see contact details for the prison (only first BUS phone shown)'
        submissionTarget.prison.text() == 'HMP Albany'
        submissionTarget.phones.size() == 1

        when: 'I click return to case list'
        find('#backBtn').click()

        then: 'I return to the case list'
        at CaselistPage
    }

    def 'Rejecting address obviates subsequent tasks but still allows submission'() {

        given: 'The address has been rejected'
        testData.loadLicence('assessment/address-rejected')

        when: 'I view the tasklist'
        to TaskListPage, testData.markAndrewsBookingId

        then: 'I see only the address and submit tasks'
        taskListAction(tasks.address).text() == 'Change'
        taskListAction(tasks.submit).text() == 'Continue'
    }

    def 'BASS task button links to bass area page'() {

        given: 'BASS has been requested'
        testData.loadLicence('assessment/bassArea-unstarted')

        when: 'I view the task list'
        to TaskListPage, testData.markAndrewsBookingId

        and: 'I start the task'
        taskListAction(tasks.bass).click()

        then: 'I see the BASS area check page'
        at BassAreaCheckPage
    }

    def 'Rejecting BASS area obviates subsequent tasks but still allows submission'() {

        given: 'The address has been rejected'
        testData.loadLicence('assessment/bassArea-rejected')

        when: 'I view the tasklist'
        to TaskListPage, testData.markAndrewsBookingId

        then: 'I see only the BASS and submit tasks'
        taskListAction(tasks.bass).text() == 'Change'
        taskListAction(tasks.submit).text() == 'Continue'
    }

    def 'Shows continue button for BASS area task when started'() {

        given: 'The address is not approved but no reason given yet'
        testData.loadLicence('assessment/bassArea-no')

        when: 'Viewing the tasklist when BASS area rejected'
        to TaskListPage, testData.markAndrewsBookingId

        then: 'A Continue button is shown'
        taskListAction(tasks.bass).text() == 'Continue'
    }

    def 'Shows change link for BASS area task when complete'() {

        given: 'BASS area task complete'
        testData.loadLicence('assessment/bassArea-yes')

        when: 'I view the page'
        to TaskListPage, testData.markAndrewsBookingId

        then: 'A change link is shown'
        taskListAction(tasks.bass).text() == 'Change'
    }

    def 'Bass details shown on review page'() {

        given: 'Rejected bass area'
        testData.loadLicence('assessment/bassArea-rejected')

        when: 'I proceed'
        taskListAction(tasks.submit).click()

        then: 'I see the review page'
        at ReviewLicencePage

        and: 'The bass details are shown'
        bass.proposed.town == 'BASS Town'
        bass.proposed.county == 'BASS County'
        bass.area.bassAreaSuitable == 'No'
        bass.area.bassAreaReason == 'Reason'
    }
}































