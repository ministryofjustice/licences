package uk.gov.justice.digital.hmpps.licences.modules

import geb.Module


class OffenderDetailsModule extends Module {

  static content = {

    details {
      [
        name            : $("#prisonerName").text(),
        nomisId         : $("#prisonerPrisonNumber").text(),
        dob             : $("#prisonerDob").text(),
        roName          : $("#prisonerComName").text(),
        internalLocation: $("#prisonerLocationInternal").text(),
        externalLocation: $("#prisonerLocationExternal").text(),
        offences        : $("#prisonerOffences").text(),
        crd             : $("#prisonerCrd").text(),
        hdced           : $("#prisonerHdced").text(),
        sed             : $("#prisonerSed").text(),
        led             : $("#prisonerLed").text(),
        pssed           : $("#prisonerPssed").text(),
        photoDate       : $("#prisonerPhotoDate").text()
      ]
    }
  }
}
