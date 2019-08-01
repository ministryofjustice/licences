/* eslint-disable */

$(document).ready(init)

function init() {
  if ($('#releaseNo').is(':checked') || $('#releaseYes').is(':checked')) {
    $('#decisionReasonForm').removeClass('js-hidden')
  }

  $('#releaseNo').click(function() {
    $('#decisionReasonForm').removeClass('js-hidden')
  })

  $('#offenceBeforeNo').click(function() {
    $('#decisionReasonForm').removeClass('js-hidden')
  })
}
