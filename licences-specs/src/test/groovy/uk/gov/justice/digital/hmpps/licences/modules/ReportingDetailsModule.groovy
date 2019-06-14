package uk.gov.justice.digital.hmpps.licences.modules

import geb.Module


class ReportingDetailsModule extends Module {

  static content = {

    address {
      [
        line1    : $("#reportingAddress1").text(),
        line2    : $("#reportingAddress2").text(),
        town     : $("#reportingTown").text(),
        postCode : $("#reportingPostCode").text(),
        telephone: $("#reportingTelephone").text()
      ]
    }

    name { $("#reportingName").text() }
    organisation { $("#reportingOrganisation").text() }
  }
}
