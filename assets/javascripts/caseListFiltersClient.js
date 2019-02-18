/* eslint-disable */

$(document).ready(init)

function init() {
    $('#licenceFilters').change(function() {
        window.location = $(this).val()
    })
}
