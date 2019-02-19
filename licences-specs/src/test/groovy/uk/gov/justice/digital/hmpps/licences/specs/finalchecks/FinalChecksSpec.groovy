package uk.gov.justice.digital.hmpps.licences.specs.finalchecks

import geb.spock.GebReportingSpec
import spock.lang.Shared
import spock.lang.Stepwise
import spock.lang.Unroll
import uk.gov.justice.digital.hmpps.Stage
import uk.gov.justice.digital.hmpps.licences.pages.CaselistPage
import uk.gov.justice.digital.hmpps.licences.pages.SendPage
import uk.gov.justice.digital.hmpps.licences.pages.SentPage
import uk.gov.justice.digital.hmpps.licences.pages.TaskListPage
import uk.gov.justice.digital.hmpps.licences.pages.eligibility.EligibilityExclusionPage
import uk.gov.justice.digital.hmpps.licences.pages.finalchecks.FinalChecksOnRemandPage
import uk.gov.justice.digital.hmpps.licences.pages.finalchecks.FinalChecksConfiscationOrderPage
import uk.gov.justice.digital.hmpps.licences.pages.finalchecks.FinalChecksPostponePage
import uk.gov.justice.digital.hmpps.licences.pages.finalchecks.FinalChecksSeriousOffencePage
import uk.gov.justice.digital.hmpps.licences.pages.review.ReviewAddressPage
import uk.gov.justice.digital.hmpps.licences.pages.review.ReviewConditionsPage
import uk.gov.justice.digital.hmpps.licences.pages.review.ReviewReportingPage
import uk.gov.justice.digital.hmpps.licences.pages.review.ReviewRiskPage
import uk.gov.justice.digital.hmpps.licences.util.Actions
import uk.gov.justice.digital.hmpps.licences.util.TestData

@Stepwise
class FinalChecksSpec extends GebReportingSpec {

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

  def 'Serious offence starts with nothing selected'() {

    given: 'A licence ready for final checks'
    testData.loadLicence('finalchecks/unstarted')

    when: 'I view the serious offence page'
    to FinalChecksSeriousOffencePage, testData.markAndrewsBookingId

    then: 'Neither radio option is selected'
    seriousOffenceRadios.checked == null
  }

  def 'Shows previously saved values'() {

    given: 'Serious offence already done'
    testData.loadLicence('finalchecks/serious-offence')

    when: 'I view the serious offence page'
    to FinalChecksSeriousOffencePage, testData.markAndrewsBookingId

    then: 'I see the previous values'
    seriousOffenceRadios.checked == 'Yes'
  }

  def 'On remand shown next'() {

    given: 'Serious offence already done'
    testData.loadLicence('finalchecks/serious-offence')

    when: 'I view the serious offence page'
    to FinalChecksSeriousOffencePage, testData.markAndrewsBookingId

    and: 'I continue'
    find('#continueBtn').click()

    then: 'I see the on remand page'
    at FinalChecksOnRemandPage
  }

  def 'Confiscation order shown next'() {

    given: 'On on remand page'
    at FinalChecksOnRemandPage

    when: 'I choose a value and continue'
    onRemandRadios.checked = 'No'
    find('#continueBtn').click()

    then: 'I see the confiscation order page'
    at FinalChecksConfiscationOrderPage
  }

  def 'Saved answers shown on tasklist'() {

    given: 'Viewing confiscation order page'
    at FinalChecksConfiscationOrderPage

    when: 'I choose a value and continue'
    confiscationOrderRadios.checked = 'No'
    find('#continueBtn').click()

    then: 'I see the task list'
    at TaskListPage

    and: 'I see the summary test for the saved values'
    seriousOffenceAnswer.text() == 'The offender is under investigation or been charged for a serious offence in custody'
    onRemandAnswer.text() == 'The offender is not on remand'
    confiscationOrderAnswer.text() == 'The offender is not subject to a confiscation order'
  }

  def 'Tasklist shows answers with alert styling when answers are Yes'() {

    given: 'Serious Offence and On Remand'
    testData.loadLicence('finalchecks/serious-offence-on-remand')

    when: 'I view the task list'
    to TaskListPage, testData.markAndrewsBookingId

    then: 'I see the the final check status summary with alert styling'
    seriousOffenceAnswer.classes().contains('alert')
    onRemandAnswer.classes().contains('alert')
    confiscationOrderAnswer.classes().contains('alert')

  }

}
