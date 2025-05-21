package uk.gov.justice.digital.hmpps.licences.specs.decision

import geb.spock.GebReportingSpec
import spock.lang.PendingFeature
import spock.lang.Shared
import spock.lang.Stepwise
import uk.gov.justice.digital.hmpps.licences.pages.TaskListPage
import uk.gov.justice.digital.hmpps.licences.pages.decision.ApprovalRefusePage
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
    to ApprovalReleasePage, testData.testBookingId

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
    to ApprovalReleasePage, testData.testBookingId

    then: 'I see the previous values'
    releaseRadios.checked == 'Yes'
  }

  def 'When sent for refusal, shows reason chosen by CA - insufficient time'() {

    given: 'Sent for refusal due to insufficient time'
    testData.loadLicence('decision/insufficientTime')

    when: 'I view the refusal page'
    to ApprovalRefusePage, testData.testBookingId

    then: 'I see the reason chosen by the CA'
    reasonsForm.isDisplayed()

    reasonsItem('insufficientTime').checked

    !reasonsItem('addressUnsuitable').checked
    !reasonsItem('noAvailableAddress').checked
    !reasonsItem('outOfTime').checked
  }

  def 'When sent for refusal, shows reason chosen by CA - address unsuitable'() {

    given: 'Sent for refusal due to address rejected'
    testData.loadLicence('decision/address-rejected')

    when: 'I view the refusal page'
    to ApprovalRefusePage, testData.testBookingId

    then: 'I see the reason chosen by the CA'
    reasonsForm.isDisplayed()

    reasonsItem('addressUnsuitable').checked

    !reasonsItem('insufficientTime').checked
    !reasonsItem('noAvailableAddress').checked
    !reasonsItem('outOfTime').checked
  }
}
