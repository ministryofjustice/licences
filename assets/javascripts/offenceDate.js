/* eslint-disable */

$(document).ready(init)

function init() {
  if ($('#offenceBeforeNo').is(':checked')) {
    $('.licence-type-for-no').removeClass('js-hidden')
  }

  $('#offenceBeforeNo').click(function() {
    console.log('Hello' + $(offenceBeforeYes).val())
    $('.licence-type-for-no').removeClass('js-hidden')
  })

  $('#offenceBeforeYes').click(function() {
    console.log('Hello 2' + $(offenceBeforeYes).val())
    $('.licence-type-for-no').addClass('js-hidden')
  })
}
