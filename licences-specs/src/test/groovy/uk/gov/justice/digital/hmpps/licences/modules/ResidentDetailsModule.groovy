package uk.gov.justice.digital.hmpps.licences.modules

import geb.Module


class ResidentDetailsModule extends Module {

  static content = {

    preferred {
      resident('0')
    }

    alternative {
      resident('1')
    }

    resident { type ->
      $("div.resident.type${type}").collect { resident ->
        [
          name        : resident.find(id: startsWith("residentName-${type}")).text(),
          age         : resident.find(id: startsWith("residentAge-${type}")).text(),
          relationship: resident.find(id: startsWith("residentRelation-${type}")).text()
        ]
      }
    }
  }
}
