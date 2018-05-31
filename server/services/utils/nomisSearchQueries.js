const querystring = require('querystring');

function getPrisonersQuery(terms) {
    const definedTerms = Object.entries(terms)
        .reduce((result, [key, value]) => {
            if (value) {
                result[key] = value;
            }
            return result;
        }, {});

    return querystring.stringify(definedTerms);
}

module.exports = {
    getPrisonersQuery
};
