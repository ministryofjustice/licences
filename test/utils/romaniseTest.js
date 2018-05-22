const {romaniseLower} = require('../../server/utils/romanise');
const {expect} = require('../testSetup');

describe('romanise', () => {

    const conversions = {
          1: 'i',
        2: 'ii',
        3: 'iii',
        4: 'iv',
        5: 'v',
        6: 'vi',
        7: 'vii',
        8: 'viii',
        9: 'ix',
        10: 'x',
        11: 'xi',
        14: 'xiv',
        15: 'xv',
        16: 'xvi',
        19: 'xix',
        20: 'xx',
        21: 'xxi'
    };

    Object.entries(conversions)
        .forEach(([arabic, roman]) => {
            it(`should convert ${arabic} to ${roman}`, () => {
                expect(romaniseLower(Number(arabic))).to.eql(roman);
            });
        });
});
