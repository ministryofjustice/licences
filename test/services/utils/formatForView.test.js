const { formatObjectForView, formatObjectForViewWithOptions } = require('../../../server/services/utils/formatForView')

describe('formatForView', () => {
  describe('dates', () => {
    test('should format passed in dates', () => {
      const object = {
        a: 'hi',
        b: 'ho',
        c: '1971-05-12',
      }

      const expectedOutput = {
        a: 'hi',
        b: 'ho',
        c: '12/05/1971',
      }

      expect(formatObjectForViewWithOptions(object, { dates: ['c'] })).toEqual(expectedOutput)
    })

    test('should format passed in dates when more than one', () => {
      const object = {
        a: '1985-12-23',
        b: 'hi',
        c: 'ho',
        d: '1971-05-12',
      }

      const expectedOutput = {
        a: '23/12/1985',
        b: 'hi',
        c: 'ho',
        d: '12/05/1971',
      }

      expect(formatObjectForViewWithOptions(object, { dates: ['a', 'd'] })).toEqual(expectedOutput)
    })

    test('should format nested dates', () => {
      const object = {
        a: '1985-12-23',
        b: { o: 'hi' },
        c: 'ho',
        d: { e: { f: '1971-05-12' } },
      }

      const expectedOutput = {
        a: '23/12/1985',
        b: { o: 'Hi' },
        c: 'ho',
        d: { e: { f: '12/05/1971' } },
      }

      expect(formatObjectForViewWithOptions(object, { dates: ['a', 'f'], capitalise: ['o'] })).toEqual(expectedOutput)
    })

    test('should format passed in Date objects', () => {
      const object = {
        a: 'hi',
        b: 'ho',
        c: new Date(Date.parse('2018-07-25T14:54:43.316Z')),
      }

      const expectedOutput = {
        a: 'hi',
        b: 'ho',
        c: '25/07/2018',
      }

      expect(formatObjectForView(object)).toEqual(expectedOutput)
    })
  })

  describe('names', () => {
    test('should format names to be capitalised', () => {
      const object = {
        a: '1985-12-23',
        b: 'hi',
        c: 'ho',
        d: '1971-05-12',
      }

      const expectedOutput = {
        a: '23/12/1985',
        b: 'Hi',
        c: 'ho',
        d: '12/05/1971',
      }

      expect(formatObjectForViewWithOptions(object, { dates: ['a', 'd'], capitalise: ['b'] })).toEqual(expectedOutput)
    })

    test('should format nested names to be capitalised', () => {
      const object = {
        a: '1985-12-23',
        b: { o: 'hi' },
        c: 'ho',
        d: '1971-05-12',
      }

      const expectedOutput = {
        a: '23/12/1985',
        b: { o: 'Hi' },
        c: 'ho',
        d: '12/05/1971',
      }

      expect(formatObjectForViewWithOptions(object, { dates: ['a', 'd'], capitalise: ['o'] })).toEqual(expectedOutput)
    })
  })

  describe('location', () => {
    test('should remove (HMP) and add prefix HMP', () => {
      const object = { agencyLocationDesc: 'Berwyn (HMP)' }
      const expectedOutput = { agencyLocationDesc: 'HMP Berwyn' }

      expect(formatObjectForView(object)).toEqual(expectedOutput)
    })
  })

  describe('agency phone number', () => {
    test('should take first BUS phone', () => {
      const object = {
        phones: [
          { type: 'FAX', number: '111' },
          { type: 'BUS', number: '222' },
          { type: 'BUS', number: '333' },
        ],
      }
      const expectedOutput = { phones: { type: 'BUS', number: '222' } }

      expect(formatObjectForView(object)).toEqual(expectedOutput)
    })

    test('should be empty string if no phones', () => {
      const object = {
        phones: [],
      }
      const expectedOutput = { phones: '' }

      expect(formatObjectForView(object)).toEqual(expectedOutput)
    })

    test('should be empty string if no BUS phone', () => {
      const object = {
        phones: [{ type: 'FAX', number: '111' }],
      }
      const expectedOutput = { phones: '' }

      expect(formatObjectForView(object)).toEqual(expectedOutput)
    })
  })

  describe('offences', () => {
    test('should extract first offence description', () => {
      const object = { offences: [{ offenceDescription: 'first' }, { offenceDescription: 'second' }] }
      const expectedOutput = { offences: 'first' }

      expect(formatObjectForView(object)).toEqual(expectedOutput)
    })

    test('should give empty if offence list missing', () => {
      const object = { offences: undefined }
      const expectedOutput = { offences: '' }

      expect(formatObjectForView(object)).toEqual(expectedOutput)
    })

    test('should give empty if offence list empty', () => {
      const object = { offences: [] }
      const expectedOutput = { offences: '' }

      expect(formatObjectForView(object)).toEqual(expectedOutput)
    })
  })

  describe('aliases', () => {
    test('should join all alias names comma separated and capitalized', () => {
      const object = {
        aliases: [
          { firstName: 'one', lastName: 'two' },
          { firstName: 'three', lastName: 'four' },
        ],
      }
      const expectedOutput = { aliases: 'One Two, Three Four' }

      expect(formatObjectForView(object)).toEqual(expectedOutput)
    })

    test('should give empty if alias list missing', () => {
      const object = { aliases: undefined }
      const expectedOutput = { aliases: '' }

      expect(formatObjectForView(object)).toEqual(expectedOutput)
    })

    test('should give empty if aliases list empty', () => {
      const object = { aliases: [] }
      const expectedOutput = { aliases: '' }

      expect(formatObjectForView(object)).toEqual(expectedOutput)
    })
  })
})
