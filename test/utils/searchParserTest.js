const { parseSearchTerms } = require('../../server/utils/searchParser')

describe('parseSearchTerms', () => {
  describe('valid searches', () => {
    const inputsAndOutputs = [
      ['nomis id only', 'A0001AA', 'nomisId=A0001AA'],
      ['nomis id only - lower case', 'a0001aa', 'nomisId=A0001AA'],
      ['multiple nomis ids only', 'A0001AA B0002BB', 'nomisId=A0001AA&nomisId=B0002BB'],
      [
        'multiple nomis ids with multiple spaces',
        'A0001AA     B0002BB  C0003CC   ',
        'nomisId=A0001AA&nomisId=B0002BB&nomisId=C0003CC',
      ],
      ['multiple nomis ids with commas', 'A0001AA,B0002BB,C0003CC', 'nomisId=A0001AA&nomisId=B0002BB&nomisId=C0003CC'],
      [
        'multiple nomis ids with multiple commas and sapces',
        ',,,A0001AA,   ,   B0002BB , C0003CC, ',
        'nomisId=A0001AA&nomisId=B0002BB&nomisId=C0003CC',
      ],
    ]

    inputsAndOutputs.forEach(([label, searchTerms, expected]) => {
      it(`should parse ${label}`, () => {
        expect(parseSearchTerms(searchTerms).query).to.eql(expected)
      })
    })
  })

  describe('invalid searches', () => {
    const inputsAndOutputs = [
      ['too short', 'a', 'Invalid entry - too short'],
      ['no matched terms', '222 ***', 'Invalid entry - no supported search terms found'],
      ['valid id but unrecognised other', 'a0001aa 555', 'Invalid entry - unrecognised input'],
    ]

    inputsAndOutputs.forEach(([label, searchTerms, expected]) => {
      it(`should report error when ${label}`, () => {
        expect(parseSearchTerms(searchTerms).error).to.eql(expected)
      })
    })
  })
})
