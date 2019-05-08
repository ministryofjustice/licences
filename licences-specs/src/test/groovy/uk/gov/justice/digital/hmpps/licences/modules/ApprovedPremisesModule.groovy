package uk.gov.justice.digital.hmpps.licences.modules

import geb.Module


class ApprovedPremisesModule extends Module {

  static content = {

    address {
      [
        line1    : $("#address1").text(),
        line2    : $("#address2").text(),
        town     : $("#town").text(),
        postCode : $("#postCode").text(),
        telephone: $("#telephone").text()
      ]
    }

    addressForm {
      [
      line1:  $('#addressLine1'),
      line2 : $('#addressLine2'),
      town : $('#addressTown'),
      postCode:  $('#postCode'),
      telephone:  $('#telephone')
      ]
    }
  }
}
