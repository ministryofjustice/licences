package uk.gov.justice.digital.hmpps.licences.util

import groovy.json.JsonOutput
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
        if (response.data) {
            println("Content Type: " + response.contentType)
            println("Headers: " + response.getAllHeaders())
            println("Body:\n" + JsonOutput.prettyPrint(JsonOutput.toJson(response.data)))
        }
    }
}
