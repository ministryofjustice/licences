/* eslint-disable */

$(document).ready(init)

function init() {
  if ($('#offenceBeforeYes').is(':checked')) {
    $('.licence-type-for-old-offence').removeClass('js-hidden')
  }

  $('#offenceBeforeYes').click(function() {
    $('.licence-type-for-old-offence').removeClass('js-hidden')
  })

  $('#offenceBeforeNo').click(function() {
    $('.licence-type-for-old-offence').addClass('js-hidden')
  })
}
