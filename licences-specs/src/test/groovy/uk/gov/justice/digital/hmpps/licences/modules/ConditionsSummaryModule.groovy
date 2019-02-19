package uk.gov.justice.digital.hmpps.licences.modules

import geb.Module


class ConditionsSummaryModule extends Module {

  static content = {

    message(required: false) { $('#message').text() }

    additional {
      $("div.additional").collect { condition ->
        [
          number       : condition.find('span.number').text(),
          title        : condition.find('span.title').text(),
          approved     : condition.find('span.approved').text(),
          content      : condition.find('div.content').text(),

          editControl  : condition.find('a', text: 'Change'),
          deleteControl: condition.find('input', value: 'Delete')
        ]
      }
    }
  }
}
