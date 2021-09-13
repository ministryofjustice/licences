package uk.gov.justice.digital.hmpps.licences.specs.eligibility

import geb.spock.GebReportingSpec
import spock.lang.Shared
import spock.lang.Stepwise
import spock.lang.Unroll
import uk.gov.justice.digital.hmpps.licences.pages.CaselistPage
import uk.gov.justice.digital.hmpps.licences.pages.review.ReviewLicencePage
import uk.gov.justice.digital.hmpps.licences.util.Actions
import uk.gov.justice.digital.hmpps.licences.util.TestData

@Stepwise
class CaselistSpec extends GebReportingSpec {

  @Shared
  TestData testData = new TestData()

  @Shared
  Actions actions = new Actions()

  def setupSpec() {
    testData.deleteLicences()
    actions.logIn('CA')
  }

  def cleanupSpec() {
    actions.logOut()
  }

  @Unroll
  def 'Shows correct status message when #type'() {

    given: 'a licence exists in a particular state'
    testData.loadLicence(sample)

    when: 'I view the caselist'
    to CaselistPage

    then: 'The appropriate status is shown'
    statusFor(0) == status

    where:
    type         | sample                 | status
    'Unstarted'  | 'eligibility/started'  | 'Not started'
    'Sent to RO' | 'assessment/unstarted' | 'With community offender manager'
  }

  @Unroll
  'Shows #label button when status is #status'() {

    given: 'A licence'
    testData.loadLicence(sample)

    when: 'I view the caselist'
    via CaselistPage

    then: 'Button label depends on status'
    find('a.button').text() == label

    where:
    status        | label       | sample
    'Not started' | 'Start now' | 'eligibility/unstarted'
    'Review case' | 'Continue'  | 'finalchecks/unstarted'
    'Postponed'   | 'Change'    | 'finalchecks/postponed'
  }

  @Unroll
  def 'Button links to #target when stage is #stage'() {

    given: 'A licence'
    testData.loadLicence(sample)

    when: 'I view the caselist'
    via CaselistPage

    then: 'Button target depends on stage'
    find('a.button').getAttribute('href').contains(target)

    where:
    stage           | sample                  | target
    'UNSTARTED'     | 'unstarted/unstarted'   | '/taskList'
    'ELIGIBILITY'   | 'eligibility/unstarted' | '/taskList'
    'PROCESSING_RO' | 'assessment/unstarted'  | '/review/licence'
    'PROCESSING_CA' | 'finalchecks/unstarted' | '/taskList'
    'APPROVAL'      | 'decision/unstarted'    | '/review/licence'
    'DECIDED'       | 'decision/approved'     | '/taskList'
  }

  def 'Review button shows licence review with return to caselist option'() {

    given: 'A licence in a review stage'
    testData.loadLicence('assessment/unstarted')

    when: 'I click review'
    via CaselistPage
    find('a.button').click()

    then: 'I see the licence review page'
    at ReviewLicencePage

    when: 'I click return to caselist'
    find('a.button').click()

    then: 'I see the caselist'
    at CaselistPage
  }
}
