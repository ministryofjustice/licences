const moment = require('moment');
const querystring = require('querystring');

const {allValuesEmpty, difference, isEmpty} = require('./functionalHelpers');

const nomisIdRegex = /[A-Z]\d{4}[A-Z]{2}/gi;
const dobRegex = /(\d{1,2}[\/]){2}\d{2,4}/g;
const nameRegex = /(?!\d+)(?:[^\s])[A-ZÀ-ÖØ-öø-ÿ-']+[^\s\d]/giu;


function parseSearchTerms(input) {

    if (fewerThan(2)(input)) {
        return {error: 'Invalid entry - too short'};
    }

    const {ids, names, dobs} = extractTerms(input);

    if (allValuesEmpty({ids, dobs, names})) {
        return {error: 'Invalid entry - no supported search terms found'};
    }

    const unrecognisedTerms = difference(input.split(' '), [].concat(names, ids, dobs));

    if (!isEmpty(unrecognisedTerms)) {
        return {error: 'Invalid entry - unrecognised input'};
    }

    const invalidDobs = dobs && dobs.filter(d => !moment(d, 'DD/MM/YYYY').isValid());

    if(!isEmpty(invalidDobs)) {
        return {error: 'Invalid entry - Date of birth should be dd/mm/yyyy'};
    }

    if ((dobs || names) && moreThan(1)(ids)) {
        return {error: 'Invalid entry - when searching for name or DOB, only one prison number allowed'};
    }

    if (moreThan(1)(dobs)) {
        return {error: 'Invalid entry - only one date of birth allowed'};
    }

    if (moreThan(2)(names)) {
        return {error: 'Invalid entry - enter last name, or first name and last name'};
    }

    const nomisIdTerm = ids && formatNomisMatches(ids);
    const dobTerm = dobs && formatDobMatches(dobs);
    const nameTerm = names && formatNameMatches(names);

    const query = [nomisIdTerm, dobTerm, nameTerm].filter(term => term).join('&');

    return {query};
}

const fewerThan = count => item => !item || item.length < count;
const moreThan = count => item => item && item.length > count;


function extractTerms(input) {

    const ids = input.match(nomisIdRegex);
    const names = input.match(nameRegex);
    const dobs = input.match(dobRegex);

    return {ids, names, dobs: dobs};
}

function formatNomisMatches(nomisIdMatches) {
    return querystring.stringify({nomisId: nomisIdMatches.map(id => id.toUpperCase())});
}

function formatDobMatches(validDobs) {
    const dobStrings = validDobs.map(d => moment(d, 'DD/MM/YYYY').format('YYYY-MM-DD'));
    return querystring.stringify({dob: dobStrings});
}

function formatNameMatches(nameMatches) {
    return querystring.stringify(chooseNames(nameMatches.map(name => name.toUpperCase())));
}

function chooseNames(nameMatches) {
    const lastFirst = nameMatches.reverse();
    const firstName = lastFirst[1];
    const lastName = lastFirst[0];

    return firstName ? {firstName, lastName} : {lastName};
}

module.exports = {
    parseSearchTerms
};
