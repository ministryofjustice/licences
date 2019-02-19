package uk.gov.justice.digital.hmpps.licences.specs.common

import geb.spock.GebReportingSpec
import groovy.json.JsonSlurper
import spock.lang.Shared
import spock.lang.Stepwise
import spock.lang.Unroll
import uk.gov.justice.digital.hmpps.licences.pages.CaselistPage
import uk.gov.justice.digital.hmpps.licences.pages.HealthPage
import uk.gov.justice.digital.hmpps.licences.pages.SigninPage
import uk.gov.justice.digital.hmpps.licences.util.Actions
import uk.gov.justice.digital.hmpps.licences.util.TestData

@Stepwise
class WebsiteSpec extends GebReportingSpec {

  @Shared
  TestData testData = new TestData()

  @Shared
  Actions actions = new Actions()

  def cleanupSpec() {
    actions.logOut()
  }

  @Unroll
  def 'Correct user name is shown when I log in as #user'() {

    when: 'I log in'
    actions.logIn(user)
    to CaselistPage

    then: 'my user name is shown'
    header.user.contains(userName)
    actions.logOut()

    where:
    user | userName
    'CA' | 'Catherine Amos'
    'RO' | 'Ryan Orton'
    'DM' | 'Diane Matthews'
  }

  def 'Login prevented for user without licences role'() {

    when: 'I log in as a Nomis user without Licences roles'
    to SigninPage
    signInAs('NONE')

    then: 'Log in fails and I see the log in screen'
    at SigninPage
  }

  def 'User can log out'() {

    given: 'I am viewing the website'
    actions.logIn()
    to CaselistPage

    when: 'I click the logout link'
    header.logoutLink.click()

    then: 'I return to login page'
    at SigninPage
  }

  def 'Health page shows application status'() {

    when: 'Viewing the health page'
    to HealthPage

    then: 'I see health status OK'

    def json = driver.pageSource - ' xmlns="http://www.w3.org/1999/xhtml"' - '<html><head></head><body><pre style="word-wrap: break-word; white-space: pre-wrap;">'
    def response = new JsonSlurper().parseText(json)

    response.healthy == true
    response.checks.db == 'OK'
    response.checks.nomis == 'OK'
  }
}
