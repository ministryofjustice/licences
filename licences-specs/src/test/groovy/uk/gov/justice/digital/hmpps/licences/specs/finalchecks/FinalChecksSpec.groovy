package uk.gov.justice.digital.hmpps.licences.specs.finalchecks

import geb.spock.GebReportingSpec
import org.openqa.selenium.JavascriptExecutor
import spock.lang.Shared
import spock.lang.Stepwise
import uk.gov.justice.digital.hmpps.licences.pages.TaskListPage
import uk.gov.justice.digital.hmpps.licences.pages.finalchecks.FinalChecksOnRemandPage
import uk.gov.justice.digital.hmpps.licences.pages.finalchecks.FinalChecksConfiscationOrderPage
import uk.gov.justice.digital.hmpps.licences.pages.finalchecks.FinalChecksSeriousOffencePage
import uk.gov.justice.digital.hmpps.licences.util.Actions
import uk.gov.justice.digital.hmpps.licences.util.TestData

@Stepwise
class FinalChecksSpec extends GebReportingSpec {

  @Shared
  TestData testData = new TestData()
  @Shared
  Actions actions = new Actions()
  JavascriptExecutor js = (JavascriptExecutor) driver;


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

    js.executeScript("window.scrollBy(0,document.body.scrollHeight)")
    find('#continueBtn').click()

    then: 'I see the confiscation order page'
    at FinalChecksConfiscationOrderPage
  }

  def 'Saved answers shown on tasklist'() {

    given: 'Viewing confiscation order page'
    at FinalChecksConfiscationOrderPage

    when: 'I choose a value and continue'
    confiscationOrderRadios.checked = 'No'

    js.executeScript("window.scrollBy(0,document.body.scrollHeight)")
    find('#continueBtn').click()

    then: 'I see the task list'
    at TaskListPage

    and: 'I see the summary text for the saved values'
    warnings.contains('The offender is under investigation or been charged for a serious offence in custody')
  }

}
