package uk.gov.justice.digital.hmpps.licences.specs.common

import geb.spock.GebReportingSpec
import spock.lang.Shared
import uk.gov.justice.digital.hmpps.licences.pages.UserPage
import uk.gov.justice.digital.hmpps.licences.util.Actions


class UserPageSpec extends GebReportingSpec {

  @Shared
  Actions actions = new Actions()


  def cleanup() {
    actions.logOut()
  }

  def 'Shows correct page title - user has single role'() {

    actions.logIn('CA')

    given: 'I view the User page'
    to UserPage

    expect: 'The page title refers to location only'
    pageTitle == "Change your location"

  }

  def 'Displays caseLoad selector - user has single role'() {

    actions.logIn('CA')

    given: 'I view the User page'
    to UserPage

    expect: 'Only caseLoad selector is displayed'
    caseloadSelector.displayed
    !roleSelector.displayed
  }

  def 'Shows correct page title - user has multiple roles'() {

    actions.logIn('CA_RO_DM')

    given: 'I view the User page'
    to UserPage

    expect: 'The page title refers to role and location'
    pageTitle == "Change your role or location"

  }

  def 'Displays role selector - user has multiple roles'() {

    actions.logIn('CA_RO_DM')

    given: 'I view the User page'
    to UserPage

    expect: 'The role and caseLoad selectors are displayed'
    roleSelector.displayed
    caseloadSelector.displayed
  }

}
