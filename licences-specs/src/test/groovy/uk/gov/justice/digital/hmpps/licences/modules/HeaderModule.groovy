package uk.gov.justice.digital.hmpps.licences.modules

import geb.Module


class HeaderModule extends Module {

  static content = {

    user { $('span[data-qa="logged-in-name"]').text() }

    logoutLink { $('a', text: 'Sign out') }
  }
}
