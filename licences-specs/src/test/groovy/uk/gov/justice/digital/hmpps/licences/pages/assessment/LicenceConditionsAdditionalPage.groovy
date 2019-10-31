package uk.gov.justice.digital.hmpps.licences.pages.assessment

import geb.Page
import geb.module.Checkbox
import geb.module.RadioButtons
import uk.gov.justice.digital.hmpps.licences.modules.BespokeConditionsModule
import uk.gov.justice.digital.hmpps.licences.modules.HeaderModule

class LicenceConditionsAdditionalPage extends Page {

  static url = '/hdc/licenceConditions/additionalConditions'

  static at = {
    browser.currentUrl.contains(url)
  }

  static content = {

    header { module(HeaderModule) }

    conditions(required: false) { $(name: "additionalConditions") }

    conditionsItem { conditionValue ->
      $("input", value: conditionValue, name: "additionalConditions").module(Checkbox)
    }

    abuseAndBehaviours { conditionValue ->
      $("input", value: conditionValue, name: "abuseAndBehaviours").module(Checkbox)
    }

    addBespokeRadios { $(name: "bespokeDecision").module(RadioButtons) }
    bespoke { module(BespokeConditionsModule) }
  }
}
