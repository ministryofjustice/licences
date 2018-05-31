const {parseSearchTerms} = require('../../server/utils/searchParser');
const {expect} = require('../testSetup');

describe('parseSearchTerms', () => {

    describe('valid searches', () => {
        const inputsAndOutputs = [
            ['last name only', 'last', 'lastName=LAST'],
            ['first and last name', 'first last', 'firstName=FIRST&lastName=LAST'],
            ['dob only - 2 digit year', '1/1/01', 'dob=2001-01-01'],
            ['dob only - leading zeroes 2 digit year', '01/01/01', 'dob=2001-01-01'],
            ['dob only - 4 digit year', '1/1/2001', 'dob=2001-01-01'],
            ['dob only - leading zeroes 4 digit year', '01/01/2001', 'dob=2001-01-01'],
            ['nomis id only', 'A0001AA', 'nomisId=A0001AA'],
            ['nomis id only - lower case', 'a0001aa', 'nomisId=A0001AA'],
            ['multiple nomis ids only', 'A0001AA B0002BB', 'nomisId=A0001AA&nomisId=B0002BB'],
            ['last name and dob', 'last 1/1/01', 'dob=2001-01-01&lastName=LAST'],
            ['first name last name and dob', 'first last 1/1/01', 'dob=2001-01-01&firstName=FIRST&lastName=LAST'],
            [
                'first name last name and dob and nomis',
                'first last 1/1/01 A0001AA',
                'nomisId=A0001AA&dob=2001-01-01&firstName=FIRST&lastName=LAST'
            ]
        ];

        inputsAndOutputs
            .forEach(([label, searchTerms, expected]) => {
                it(`should parse ${label}`, () => {
                    expect(parseSearchTerms(searchTerms).query).to.eql(expected);
                });
            });
    });

    describe('invalid searches', () => {
        const inputsAndOutputs = [
            ['too short', 'a', 'Invalid entry - too short'],
            ['no matched terms', '222 ***', 'Invalid entry - no supported search terms found'],
            [
                'too many ids with name',
                'name A0001AA A0001BB',
                'Invalid entry - when searching for name or DOB, only one prison number allowed'
            ],
            [
                'too many ids with dob',
                '1/1/01 A0001AA A0001BB',
                'Invalid entry - when searching for name or DOB, only one prison number allowed'
            ],
            ['too many dobs', '1/1/01 2/2/02', 'Invalid entry - only one date of birth allowed'],
            ['unmatched pattern dob', '1/1/1', 'Invalid entry - no supported search terms found'],
            ['invalid date dob', '50/1/01', 'Invalid entry - Date of birth should be dd/mm/yyyy'],
            ['invalid dob but valid name', '1/1/1 name', 'Invalid entry - unrecognised input'],
            ['valid id but unrecognised other', 'a0001aa 555', 'Invalid entry - unrecognised input'],
            ['too many names', 'first last other', 'Invalid entry - enter last name, or first name and last name']
        ];

        inputsAndOutputs
            .forEach(([label, searchTerms, expected]) => {
                it(`should report error when ${label}`, () => {
                    expect(parseSearchTerms(searchTerms).error).to.eql(expected);
                });
            });
    });

    describe('parsing and url encoding names including special characters anddiacritics', () => {
        const inputsAndOutputs = [
            ['last', 'lastName=LAST'],
            ['LAST', 'lastName=LAST'],
            ['first last', 'firstName=FIRST&lastName=LAST'],
            [`apostrophe'last`, `lastName=APOSTROPHE'LAST`],
            ['hyphen-last', 'lastName=HYPHEN-LAST'],
            ['àccent-làst', 'lastName=%C3%80CCENT-L%C3%80ST'],
            ['ümlaüt-last', 'lastName=%C3%9CMLA%C3%9CT-LAST']
        ];

        inputsAndOutputs
            .forEach(([names, expected]) => {
                it(`should parse ${names}`, () => {
                    expect(parseSearchTerms(names).query).to.eql(expected);
                });
            });
    });
});
