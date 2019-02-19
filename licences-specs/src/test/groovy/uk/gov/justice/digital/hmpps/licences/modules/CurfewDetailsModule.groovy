package uk.gov.justice.digital.hmpps.licences.modules

import geb.Module


class CurfewDetailsModule extends Module {

  static content = {

    address {
      [
        line1    : $("#address1-curfew").text(),
        line2    : $("#address2-curfew").text(),
        town     : $("#town-curfew").text(),
        postCode : $("#postCode-curfew").text(),
        telephone: $("#telephone-curfew").text()
      ]
    }

    occupier {
      [
        name        : $("#occupierName-curfew").text(),
        relationship: $("#occupierRelation-curfew").text(),
      ]
    }

    residents {
      $('div.resident').collect { resident ->
        [
          name        : resident.find(id: startsWith("residentName-curfew-")).text(),
          age         : resident.find(id: startsWith("residentAge-curfew-")).text(),
          relationship: resident.find(id: startsWith("residentRelation-curfew-")).text()
        ]
      }
    }

    reviewAnswers {
      [
        cautioned  : $("#cautioned-curfew").text(),
        consent    : $("#consent-curfew").text(),
        homeVisit  : $("#homeVisit-curfew").text(),
        electricity: $("#electricity-curfew").text()
      ]
    }

    curfewHours { day ->
      $("#${day.uncapitalize().replaceAll("\\s", "")}").text()
    }
  }
}
