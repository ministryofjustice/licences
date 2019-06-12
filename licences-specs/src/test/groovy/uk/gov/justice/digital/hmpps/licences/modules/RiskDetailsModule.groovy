package uk.gov.justice.digital.hmpps.licences.modules

import geb.Module


class RiskDetailsModule extends Module {

  static content = {

    answers {
      [
        planningActions               : $("#planningActions").text(),
        information                   : $("#awaitingInformation").text(),
        riskManagementDetail          : $("#details").text(),
        addressSuitable               : $("#proposedAddressSuitable").text(),
        unsuitableReason              : $("#unsuitableReason").text(),
        nonDisclosableInformationView : $("#nonDisclosableInformationDetailsView").text()
      ]
    }
  }
}
