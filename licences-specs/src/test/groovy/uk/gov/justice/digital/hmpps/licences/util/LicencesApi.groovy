package uk.gov.justice.digital.hmpps.licences.util

import groovyx.net.http.RESTClient
import static groovyx.net.http.ContentType.JSON
import spock.lang.Shared


class LicencesApi {

  @Shared
  def apiRoot = System.getenv('LICENCES_URI') ?: "http://localhost:3000/"
  @Shared
  def client = new RESTClient("$apiRoot/utils/")

  def deleteAll() {

    println 'deleteAll'

    def response = client.get(path: 'reset-test')

    println("Status: " + response.status)
  }

  def create(bookingId, sample) {

    println "create $sample"
    println "create/$bookingId"

    def response = client.post(
      path: "create/$bookingId",
      contentType: JSON,
      body: sample,
      headers: [Accept: 'application/json']
    )

    println("Status: " + response.status)
    if (response.status > 299) {
      throw new Exception("Received an HTTP ${response.status} status code while attempting to create a licence. Licence creation failed.")
    }

    if (response.data) {
      println("Content Type: " + response.contentType)
      println("Headers: " + response.getAllHeaders())
      println("Body:\n" + JsonOutput.prettyPrint(JsonOutput.toJson(response.data)))
    }
  }

  def enableLdu(probationAreaCode, lduCode) {

    println "enabling ldu $probationAreaCode/$lduCode"

    def response = client.post(
      path: "enable-ldu/$probationAreaCode/$lduCode",
      contentType: JSON,
      headers: [Accept: 'application/json']
    )

    println("Status: " + response.status)
    if (response.status > 299) {
      throw new Exception("Received an HTTP ${response.status} status code while attempting to create a licence. Licence creation failed.")
    }

    if (response.data) {
      println("Content Type: " + response.contentType)
      println("Headers: " + response.getAllHeaders())
      println("Body:\n" + JsonOutput.prettyPrint(JsonOutput.toJson(response.data)))
    }
  }
}
