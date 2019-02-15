package uk.gov.justice.digital.hmpps.licences.modules

import geb.Module


class BespokeConditionsModule extends Module {

    static content = {

        conditions {
            $("div.bespokeConditionsForm").collect { condition ->
                [
                        input        : condition.find('textarea'),
                        value        : condition.find('textarea').value(),
                        removeControl: condition.find('a.removeBespoke')
                ]
            }
        }
    }
}
