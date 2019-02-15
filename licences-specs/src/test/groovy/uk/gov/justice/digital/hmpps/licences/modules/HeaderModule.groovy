package uk.gov.justice.digital.hmpps.licences.modules

import geb.Module


class HeaderModule extends Module {

    static content = {

        user { $('#header-user').text() }

        logoutLink {$('a', text: 'Sign out')}
    }
}
