const querystring = require('querystring');
const {difference, isEmpty} = require('./functionalHelpers');

const nomisIdRegex = /[A-Z]\d{4}[A-Z]{2}/gi;

function parseSearchTerms(input) {

    if (!input || input.length < 6) {
        return {error: 'Invalid entry - too short'};
    }

    const ids = input.match(nomisIdRegex);

    if (!ids) {
        return {error: 'Invalid entry - no supported search terms found'};
    }

    const unrecognisedTerms = difference(input.split(' '), ids);

    if (!isEmpty(unrecognisedTerms)) {
        return {error: 'Invalid entry - unrecognised input'};
    }

    const query = ids && formatNomisMatches(ids);

    return {query};
}

function formatNomisMatches(nomisIdMatches) {
    return querystring.stringify({nomisId: nomisIdMatches.map(id => id.toUpperCase())});
}

module.exports = {
    parseSearchTerms
};
