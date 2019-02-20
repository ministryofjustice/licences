package uk.gov.justice.digital.hmpps.licences.pages

import geb.Page
import uk.gov.justice.digital.hmpps.licences.modules.HeaderModule

class SigninPage extends Page {

  static url = '/login'

  static at = {
    browser.currentUrl.contains(url)
  }

  static content = {
    signInAs { user ->
      $('form').username = user
      $('form').password = 'licences123457'

      assert $('form').username == user
      assert $('form').password == 'licences123457'

      $('#submit').click()
    }
  }

}
