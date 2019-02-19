package uk.gov.justice.digital.hmpps.licences.specs.decision

import geb.spock.GebReportingSpec
import spock.lang.PendingFeature
import spock.lang.Shared
import spock.lang.Stepwise
import uk.gov.justice.digital.hmpps.licences.pages.TaskListPage
import uk.gov.justice.digital.hmpps.licences.pages.decision.ApprovalReleasePage
import uk.gov.justice.digital.hmpps.licences.pages.eligibility.EligibilityExclusionPage
import uk.gov.justice.digital.hmpps.licences.pages.eligibility.EligibilitySuitabilityPage
import uk.gov.justice.digital.hmpps.licences.pages.eligibility.EligibilityTimeCheckPage
import uk.gov.justice.digital.hmpps.licences.util.Actions
import uk.gov.justice.digital.hmpps.licences.util.TestData

@Stepwise
class ApprovalSpec extends GebReportingSpec {

  @Shared
  TestData testData = new TestData()
  @Shared
  Actions actions = new Actions()

  def setupSpec() {
    testData.loadLicence('decision/unstarted')
    actions.logIn('DM')
  }

  def cleanupSpec() {
    actions.logOut()
  }

  def 'Starts with nothing selected because there is no default'() {

    when: 'I view the approval page'
    to ApprovalReleasePage, testData.markAndrewsBookingId

    then: 'Neither radio option is selected'
    releaseRadios.checked == null
  }

  def 'Reasons not shown when option is approve'() {

    when: 'I view the approval page'
    at ApprovalReleasePage

    and: 'I select yes for approve release'
    releaseRadios.checked = 'Yes'

    then: 'I do not see reason options'
    !reasonsForm.isDisplayed()
  }

  def 'Reasons are shown when option is refusal'() {

    when: 'I view the approval page'
    at ApprovalReleasePage

    and: 'I select no for approve release'
    releaseRadios.checked = 'No'

    then: 'I see 4 reason options'
    reasonsForm.isDisplayed()
    reasons.size() == 4
  }

  def 'Shows previously saved values'() {

    given: 'Approval already done'
    testData.loadLicence('decision/approved')

    when: 'I view the approval page'
    to ApprovalReleasePage, testData.markAndrewsBookingId

    then: 'I see the previous values'
    releaseRadios.checked == 'Yes'
  }
}
