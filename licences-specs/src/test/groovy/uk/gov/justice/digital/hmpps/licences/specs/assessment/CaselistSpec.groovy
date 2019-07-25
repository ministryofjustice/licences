package uk.gov.justice.digital.hmpps.licences.specs.assessment

import geb.spock.GebReportingSpec
import spock.lang.Shared
import spock.lang.Stepwise
import spock.lang.Unroll
import uk.gov.justice.digital.hmpps.licences.pages.CaselistPage
import uk.gov.justice.digital.hmpps.licences.util.Actions
import uk.gov.justice.digital.hmpps.licences.util.TestData

@Stepwise
class CaselistSpec extends GebReportingSpec {

  @Shared
  TestData testData = new TestData()
  @Shared

  Actions actions = new Actions()

  def setupSpec() {
    actions.logIn('RO')
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
    type        | sample                 | status
    'Unstarted' | 'assessment/unstarted' | 'Not started'
    'Doing'     | 'assessment/reporting' | 'In progress'
    'Done'      | 'assessment/done'      | 'In progress'
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
    status               | label       | sample
    'RAddress provided'  | 'Start now' | 'assessment/unstarted'
    'Assessment ongoing' | 'Continue'  | 'assessment/reporting'
  }

  @Unroll
  def 'Does not show button when stage is #stage'() {

    given: 'A licence'
    testData.loadLicence(sample)

    when: 'I view the caselist'
    via CaselistPage

    then: 'Button depends on stage'
    find('a.button').size() == 0

    where:
    stage         | sample
    'UNSTARTED'   | 'unstarted/unstarted'
    'ELIGIBILITY' | 'eligibility/unstarted'
  }

  @Unroll
  def 'Button links to #target when stage is #stage'() {

    given: 'A licence'
    testData.loadLicence(sample)

    when: 'I view the caselist'
    to CaselistPage

    then: 'Button target depends on stage'
    find('a.button').getAttribute('href').contains(target)

    where:
    stage           | sample                  | target
    'PROCESSING_RO' | 'assessment/unstarted'  | '/taskList'
    'PROCESSING_CA' | 'finalchecks/unstarted' | '/review/licence'
    'APPROVAL'      | 'decision/unstarted'    | '/review/licence'
    'DECIDED'       | 'decision/approved'     | '/taskList'
  }
}
