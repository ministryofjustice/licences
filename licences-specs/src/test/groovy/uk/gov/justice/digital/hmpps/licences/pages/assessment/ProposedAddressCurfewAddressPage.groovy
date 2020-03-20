package uk.gov.justice.digital.hmpps.licences.pages.assessment
import geb.Page
import geb.module.RadioButtons
import geb.module.Textarea
import geb.module.TextInput

class ProposedAddressCurfewAddressPage extends Page {

  static url = '/hdc/proposedAddress/curfewAddress'

  static at = {
    browser.currentUrl.contains(url)
  }
  static content = {
    additionalInformation { $(name: "additionalInformation")}
    street { $(name: "addressLine1") }
    town { $(name: "addressTown") }
    postcode { $(name: "postCode") }
    telephone { $(name: "telephone") }
    occupier { $( "#occupiername") }
    relation { $("#occupierrelationship") }
    caution { $(name:"cautionedAgainstResident").module(RadioButtons)  }
    saveAndContinue(required: false){ $('#continueBtn')}
  }
}


