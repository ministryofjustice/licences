package uk.gov.justice.digital.hmpps.licences.pages.finalchecks

import geb.Page
import geb.module.RadioButtons
import uk.gov.justice.digital.hmpps.licences.modules.HeaderModule

class FinalChecksUndulyLenientSentencePage extends Page {

  static url = '/hdc/finalChecks/undulyLenientSentence'

  static at = {
    browser.currentUrl.contains(url)
  }

  static content = {

    header { module(HeaderModule) }

    undulyLenientSentenceRadios { $(name: "decision").module(RadioButtons) }
  }
}
