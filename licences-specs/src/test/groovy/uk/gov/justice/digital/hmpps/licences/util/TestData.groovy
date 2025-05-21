package uk.gov.justice.digital.hmpps.licences.util

import groovy.json.JsonSlurper
import spock.lang.Shared

class TestData {

  @Shared
  def testBookingId = System.getenv('BOOKING_ID') ?: "1200635"

  LicencesApi licences

  TestData() {
    licences = new LicencesApi()
  }

  def deleteLicences() {
    licences.deleteAll()
  }

  def enableLdu(probationArea, ldu) {
    licences.enableLdu(probationArea, ldu)
  }

  def loadLicence(filename, bookingId = testBookingId) {
    deleteLicences()
    addLicence(filename, bookingId)
  }

  def addLicence(filename, bookingId = testBookingId) {

    def licenceFile = TestData.class.getResource("/licences/${filename}.json")

    if (licenceFile == null) {
      throw new Exception("No licence file found: '${filename}'")
    }

    def sampleText = licenceFile.text
    def sample = new JsonSlurper().parseText(sampleText)

    licences.create(bookingId, sample)
  }
}
