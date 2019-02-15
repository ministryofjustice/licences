package uk.gov.justice.digital.hmpps.licences.util

import geb.Browser
import spock.lang.Shared
import uk.gov.justice.digital.hmpps.licences.pages.SigninPage
import uk.gov.justice.digital.hmpps.licences.pages.CaselistPage


class Actions {

    def users = [
            'CA'      : 'CA_USER_TEST',
            'CA_MULTI': 'CA_USER_MULTI',
            'RO'      : 'RO_USER_TEST',
            'RO_MULTI'      : 'RO_USER_MULTI',
            'DM'      : 'DM_USER_TEST',
            'DM_MULTI'      : 'DM_USER_MULTI',
            'NONE'    : 'NONE'
    ]

    def logIn(role = 'CA') {
        Browser.drive {
            to SigninPage
            def userName = users[role]
            println "Logging in as ${userName}"
            signInAs(userName)
            at CaselistPage
        }
    }

    def logOut() {
        Browser.drive {
            go '/logout'
        }
    }
}
