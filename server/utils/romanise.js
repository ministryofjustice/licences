const { firstItem } = require('./functionalHelpers')

module.exports = { romanise }

const conversions = {
    1: 'I',
    4: 'IV',
    5: 'V',
    9: 'IX',
    10: 'X',
    40: 'XL',
    50: 'L',
}

const numerals = Object.entries(conversions).reverse()

function romanise(number) {
    if (number < 1 || number > 50) {
        throw new Error('Input must be in range 1 to 50')
    }

    return convert(number)
}

function convert(number) {
    return (
        firstItem(
            numerals.filter(([arabic]) => arabic <= number).map(([arabic, roman]) => roman + convert(number - arabic))
        ) || ''
    )
}
