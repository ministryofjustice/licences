package uk.gov.justice.digital.hmpps.licences.modules

import geb.Module


class BassRequestModule extends Module {

  static content = {

    proposed {
      [
        town  : $("#proposedTown").text(),
        county: $("#proposedCounty").text()
      ]
    }

    area {
      [
        bassAreaSuitable: $("#bassAreaSuitable").text(),
        bassAreaReason  : $("#bassAreaReason").text(),
      ]
    }

    offer {
      [
        outcome: $("#bassOfferOutcome").text(),
        details: $("#bassOfferDetails").text()
      ]
    }
  }
}
