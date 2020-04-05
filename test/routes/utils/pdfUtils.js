const { curfewAddressCheckFormFileName } = require('../../../server/routes/utils/pdfUtils')

describe('curfewAddressCheckFormFileName', () => {
  let realDateNow

  beforeEach(() => {
    const time = new Date('May 31, 2018 12:00:00')
    realDateNow = Date.now.bind(global.Date)
    global.Date = jest.fn(() => time)
  })

  afterEach(() => {
    global.Date.now = realDateNow
  })

  const examples = [
    {
      prisoner: { firstName: 'FIRST', lastName: 'LAST', offenderNo: '123' },
      filename: 'HDC report 123 FIRST LAST 20180531.pdf',
    },
    {
      prisoner: { firstName: undefined, lastName: undefined, offenderNo: undefined },
      filename: 'HDC report 20180531.pdf',
    },
    {
      prisoner: { firstName: '', lastName: '', offenderNo: '' },
      filename: 'HDC report 20180531.pdf',
    },
    {
      prisoner: { firstName: 'FIRST', lastName: '', offenderNo: '' },
      filename: 'HDC report FIRST 20180531.pdf',
    },
    {
      prisoner: { firstName: 'FIRST MIDDLE', lastName: '', offenderNo: '' },
      filename: 'HDC report FIRST MIDDLE 20180531.pdf',
    },
    {
      prisoner: { firstName: 'FIRST MIDDLE', lastName: 'LAST', offenderNo: '' },
      filename: 'HDC report FIRST MIDDLE LAST 20180531.pdf',
    },
    {
      prisoner: { firstName: 'FIRST MIDDLE', offenderNo: '123' },
      filename: 'HDC report 123 FIRST MIDDLE 20180531.pdf',
    },
    {
      prisoner: { offenderNo: '123' },
      filename: 'HDC report 123 20180531.pdf',
    },
  ]

  examples.forEach((example) => {
    test('generates filename using prisoner details, omitting empties', () => {
      expect(curfewAddressCheckFormFileName(example.prisoner)).toEqual(example.filename)
    })
  })
})
