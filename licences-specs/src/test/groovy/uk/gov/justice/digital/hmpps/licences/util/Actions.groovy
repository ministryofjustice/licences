package uk.gov.justice.digital.hmpps.licences.util

import geb.Browser
import uk.gov.justice.digital.hmpps.licences.pages.SigninPage
import uk.gov.justice.digital.hmpps.licences.pages.CaselistPage


class Actions {

  def users = [
    'CA_RO_DM': [username: 'CA_RO_DM_USER', password: 'password123456'],
    'READONLY': [username: 'LICENCE_READONLY_TEST', password: 'password123456'],
    'CA'      : [username: 'CA_USER_TEST', password: 'password123456'],
    'CA_MULTI': [username: 'CA_USER_MULTI', password: 'password123456'],
    'RO'      : [username: 'AUTH_RO_USER_TEST', password: 'password123456'],
    'RO_MULTI': [username: 'RO_USER_MULTI', password: 'password123456'],
    'RO_USER' : [username: 'RO_USER_TEST', password: 'password123456'],
    'DM'      : [username: 'DM_USER_TEST', password: 'password123456'],
    'DM_MULTI': [username: 'DM_USER_MULTI', password: 'password123456'],
    'NONE'    : [username: 'NONE', password: 'licences123456'],
  ]

  def logIn(role = 'CA') {
    Browser.drive {
      to SigninPage
      def credentials = users[role]
      println "Logging in as ${credentials.username}"
      signInAs(credentials.username, credentials.password)
      at CaselistPage
    }
  }

  def logOut() {
    Browser.drive {
      go '/logout'
    }
  }
}
