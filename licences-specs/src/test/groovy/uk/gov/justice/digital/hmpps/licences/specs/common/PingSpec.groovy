package uk.gov.justice.digital.hmpps.licences.specs.common

import groovyx.net.http.HTTPBuilder
import spock.lang.Specification

class PingSpec extends Specification {
  def apiRoot = System.getenv('LICENCES_URI') ?: "http://localhost:3000"
  HTTPBuilder http

  def setup() {
    http = new HTTPBuilder(apiRoot)
  }

  def "Ping page returns pong"() {
    given:

    when:
    def response = http.get([path: '/ping'])
    then:
    response == 'pong'
  }
}
