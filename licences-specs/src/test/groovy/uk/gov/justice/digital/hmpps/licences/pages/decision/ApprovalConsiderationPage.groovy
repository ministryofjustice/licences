package uk.gov.justice.digital.hmpps.licences.pages.decision

import geb.Page
import geb.module.RadioButtons
import uk.gov.justice.digital.hmpps.licences.modules.HeaderModule

import java.awt.Button

class ApprovalConsiderationPage extends Page {

  static url = '/hdc/approval/consideration'

  static at = {
    browser.currentUrl.contains(url)
  }

  static content = {

    header { module(HeaderModule) }

    considerationRadios { $(name: "decision").module(RadioButtons) }

    saveAndContinue(required: false){ $('#continueBtn')}

  }
}
