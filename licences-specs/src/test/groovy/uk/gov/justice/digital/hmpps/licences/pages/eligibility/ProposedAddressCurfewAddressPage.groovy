package uk.gov.justice.digital.hmpps.licences.pages.eligibility

import geb.Page
import geb.module.RadioButtons
import uk.gov.justice.digital.hmpps.licences.modules.AddressDetailsModule
import uk.gov.justice.digital.hmpps.licences.modules.HeaderModule
import uk.gov.justice.digital.hmpps.licences.modules.OccupierDetailsModule
import uk.gov.justice.digital.hmpps.licences.modules.ResidentDetailsModule

class ProposedAddressCurfewAddressPage extends Page {

  static url = '/hdc/proposedAddress/curfewAddress'

  static at = {
    browser.currentUrl.contains(url)
  }

  static content = {

    header { module(HeaderModule) }

    address { module(AddressDetailsModule) }
    occupier { module(OccupierDetailsModule) }
    residents { module(ResidentDetailsModule) }

    cautionedRadios { $(name: "cautionedAgainstResident").module(RadioButtons) }

    alternativeAddressRadios { $(name: "alternativeAddress").module(RadioButtons) }

    alternativeAddressForm(required: false) { $('#alternativeAddress') }

    addResidentLink { $(".otherResidentsInput", 0).find('a') }
    addResidentLinkAlternative { $(".otherResidentsInput", 1).find('a') }
  }
}
