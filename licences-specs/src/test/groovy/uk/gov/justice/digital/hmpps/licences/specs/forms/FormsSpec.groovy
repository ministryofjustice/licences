package uk.gov.justice.digital.hmpps.licences.specs.forms

import geb.spock.GebReportingSpec
import spock.lang.Shared
import spock.lang.Stepwise
import uk.gov.justice.digital.hmpps.licences.pages.TaskListPage
import uk.gov.justice.digital.hmpps.licences.pages.forms.FormsPage
import uk.gov.justice.digital.hmpps.licences.util.Actions
import uk.gov.justice.digital.hmpps.licences.util.TestData

@Stepwise
class FormsSpec extends GebReportingSpec {

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

  def 'includes prisoner details'() {
    given: 'An offender'
    testData.loadLicence('eligibility/done')

    when: 'I view the forms page'
    to FormsPage, testData.testBookingId

    then: 'I see the expected offender details data'
    offender.details.name == 'Osiss Helkarci'
    offender.details.nomisId == 'A5001DY'
    offender.details.dob == '22/10/1989'
  }

  def 'links to forms using booking id'() {
    when: 'viewing the forms list for an offender'
    at FormsPage

    then: 'the links include the offenders booking id'
    formLinks.every {it.getAttribute('href').endsWith(testData.testBookingId) }
  }

  def 'links to Electronic Monitoring Order service'() {
    when: 'viewing the forms list for an offender'
    at FormsPage

    then: 'the Manage an Electronic Monitoring Order section links to that service'
    emoServiceLink.getAttribute('href').contains('https://hmpps-electronic-monitoring-create-an-order.hmpps.service.justice.gov.uk/')
  }

  def 'hides forms link if no licence record'() {
    given: 'licence not yet started'
    testData.deleteLicences()

    when: 'viewing the task list for an offender'
    to TaskListPage, testData.testBookingId

    then: 'there is no forms page link'
    !formsLink.isDisplayed()
  }
}
