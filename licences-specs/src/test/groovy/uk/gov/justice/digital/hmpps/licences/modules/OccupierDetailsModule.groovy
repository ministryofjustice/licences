package uk.gov.justice.digital.hmpps.licences.modules

import geb.Module


class OccupierDetailsModule extends Module {

    static content = {

        preferred {
            occupier('0')
        }

        alternative {
            occupier('1')
        }

        occupier { type ->
            [
                    name     : $("#occupiername-${type}"),
                    age      : $("#occupierage-${type}"),
                    relationship : $("#occupierrelationship-${type}"),
                    cautioned: $("#cautioned-${type}")
            ]
        }


    }
}
