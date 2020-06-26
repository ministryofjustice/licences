package uk.gov.justice.digital.hmpps.licences.pages

import geb.Page
import uk.gov.justice.digital.hmpps.licences.modules.HeaderModule

class SigninPage extends Page {

  static url = '/login'

  static at = {
    browser.currentUrl.contains(url)
  }

  static content = {
    signInAs { user, password ->
      $('form').username = user
      $('form').password = password

      assert $('form').username == user
      assert $('form').password == password

      $('#submit').click()
    }
  }

}
