package uk.gov.justice.digital.hmpps.licences.pages

import geb.Page

class HealthPage extends Page {

  static url = '/health'

  static at = {
    browser.currentUrl.contains(url)
  }

  static content = {


  }
}
