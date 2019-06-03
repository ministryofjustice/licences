package uk.gov.justice.digital.hmpps.licences.modules

import geb.Module


class OccupierDetailsModule extends Module {

  static content = {

    details {
      [
        name        : $("#occupiername"),
        age         : $("#occupierage"),
        relationship: $("#occupierrelationship"),
        cautioned   : $("#cautioned")
      ]
    }


  }
}
