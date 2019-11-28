package uk.gov.justice.digital.hmpps.licences.pages.assessment

import geb.Page
import geb.module.RadioButtons
import uk.gov.justice.digital.hmpps.licences.modules.BassRequestModule
import uk.gov.justice.digital.hmpps.licences.modules.HeaderModule

class BassAreaCheckPage extends Page {

  static url = '/hdc/bassReferral/bassAreaCheck'

  static at = {
    browser.currentUrl.contains(url)
  }

  static content = {
    header { module(HeaderModule) }

    bass { module(BassRequestModule) }

    areaReasons { $('#bassAreaReason') }

    areaRadios(required: false) { $(name: "bassAreaSuitable").module(RadioButtons) }

    approvedRadios(required: false) { $(name: "approvedPremisesRequiredYesNo").module(RadioButtons) }

    approvedAddressRequired(required: false) {$( name: 'approvedAddressRequired')}

    saveAndContinue(required: false){ $('#continueBtn')}
  }
}
