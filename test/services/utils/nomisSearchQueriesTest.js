const {expect} = require('../../testSetup');
const {getPrisonersQuery} = require('../../../server/services/utils/nomisSearchQueries');

describe('getPrisonersQuery', () => {


    const inputsAndOutputs = [
        ['one term with one value', {term: '1'}, 'term=1'],
        ['one term with multiple values', {term: ['1', '2', '3']}, 'term=1&term=2&term=3'],
        ['multiple terms with one value', {term1: '1', term2: '2', term3: '3'}, 'term1=1&term2=2&term3=3'],
        ['multiple terms with multiple values',
            {
                term1: ['1', '2'],
                term2: ['2', '3', '4'],
                term3: ['3', '4', '5', '6']
            },
            'term1=1&term1=2&term2=2&term2=3&term2=4&term3=3&term3=4&term3=5&term3=6'
        ],
        ['one term with no value', {term: null}, ''],
        ['multiple terms with no values', {term1: null, term2: null}, ''],
        ['multiple terms, some with no values', {term1: 1, term2: null, term3: 3}, 'term1=1&term3=3']
    ];

    inputsAndOutputs
        .forEach(([label, searchTerms, expected]) => {
            it(`should convert ${label}`, () => {
                expect(getPrisonersQuery(searchTerms)).to.eql(expected);
            });
        });
});
