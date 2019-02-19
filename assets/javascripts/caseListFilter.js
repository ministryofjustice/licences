/* eslint-disable */

$(document).ready(init)

// to use add .searchable class to the parent of the text
function init() {
  $('#caseListFilter').keyup(function() {
    var rows = $('#hdcEligiblePrisoners').find('tbody tr')
    var searchText = this.value.toLowerCase()
    var searchRegExp = new RegExp('(' + searchText + ')', 'ig')

    rows.each(function() {
      const rowText = $(this)
        .text()
        .toLowerCase()

      if (searchText.length === 0 || rowText.indexOf(searchText) > -1) {
        $(this).show()
        $(this)
          .find('.searchable')
          .each(function() {
            var text = $(this).text()

            $(this).html(text.replace(searchRegExp, '<span class="highlighted-string">$1</span>'))
          })
      } else {
        $(this).hide()
      }
    })
  })
}
