const {firstItem} = require('./functionalHelpers');

module.exports = {romanise, romaniseLower};

const numerals = {
    1: 'I',
    4: 'IV',
    5: 'V',
    9: 'IX',
    10: 'X',
    40: 'XL',
    50: 'L'
};

function romaniseLower(number) {
    return romanise(number).toLowerCase();
}

function romanise(number) {
    return firstItem(
        Object.entries(numerals)
            .reverse()
            .filter(([arabic]) => arabic <= number)
            .map(([arabic, roman]) => roman + romanise(number - arabic))
    ) || '';
}
