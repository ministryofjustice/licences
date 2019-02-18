/* eslint-disable */

$(document).ready(init)

$.tablesorter.addParser({
    id: 'offenderName',
    is: function(text) {
        return false
    },
    format: function(text) {
        return text.split(' ')[1]
    },
    type: 'text',
})

$.tablesorter.addParser({
    id: 'timeReference',
    is: function(text) {
        return false
    },
    format: function(text) {
        if (text === '') {
            return null
        }

        const number = text.split(' ')[0]

        if (text.indexOf('overdue') > -1) {
            return -number
        }

        if (text.indexOf('month') > -1) {
            return 31 * number
        }

        if (text.indexOf('year') > -1) {
            return 365 * number
        }

        return number === 'Today' ? 0 : number
    },
    type: 'number',
})

function init() {
    $('#hdcEligiblePrisoners.sortcolumns').tablesorter({
        emptyTo: 'bottom',
        dateFormat: 'uk',
        headers: {
            0: { sorter: 'offenderName' },
            1: { sorter: false },
            2: { sorter: 'timeReference' },
            3: { sorter: 'text' },
            4: { sorter: false },
        },
    })

    $('#hdcEligiblePrisoners.caSortcolumns').tablesorter({
        emptyTo: 'bottom',
        dateFormat: 'uk',
        headers: {
            0: { sorter: 'offenderName' },
            1: { sorter: false },
            2: { sorter: 'shortDate' },
            3: { sorter: 'timeReference' },
            4: { sorter: 'text' },
            5: { sorter: false },
        },
    })
}
