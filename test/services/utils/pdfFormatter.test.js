const { formatPdfData, getConditionText } = require('../../../server/services/utils/pdfFormatter/pdfFormatter')

describe('pdfFormatter', () => {
  let realDateNow

  beforeEach(() => {
    const time = new Date('January 1, 2001 12:00:00')
    realDateNow = Date.now.bind(global.Date)
    Date.now = jest.fn(() => time)
  })

  afterEach(() => {
    global.Date.now = realDateNow
  })

  function formatWith({
    templateName = 'hdc_ap_pss',
    licence = {},
    prisonerInfo = {},
    establishment = {},
    image = '',
    approvedVersionDetails = {},
    placeholder = 'PLACEHOLDER',
  }) {
    return formatPdfData(
      templateName,
      {
        licence,
        prisonerInfo,
        establishment,
      },
      image,
      approvedVersionDetails,
      placeholder
    )
  }

  test('should give placeholders and display names for everything when all inputs missing', () => {
    const data = formatWith({})

    expect(data.values).toEqual(allValuesEmpty)
    expect(data.missing).toEqual(displayNames)
  })

  test('should join offender names using spaces', () => {
    const prisonerInfo = {
      firstName: 'first',
      middleName: 'second',
      lastName: 'third',
    }

    const data = formatWith({ prisonerInfo })

    expect(data.values.OFF_NAME).toBe('first second third')
    expect(data.missing).not.toHaveProperty('OFF_NAME')
  })

  test('should join offender names using spaces, omitting blanks', () => {
    const prisonerInfo = {
      firstName: 'first',
      middleName: '',
      lastName: 'third',
    }

    const data = formatWith({ prisonerInfo })

    expect(data.values.OFF_NAME).toBe('first third')
    expect(data.missing).not.toHaveProperty('OFF_NAME')
  })

  test('should take number from establishment phone number', () => {
    const establishment = {
      phones: { type: 'BUS', number: 111 },
    }

    const data = formatWith({ establishment })

    expect(data.values.EST_PHONE).toBe('111')
    expect(data.missing).not.toHaveProperty('EST_PHONE')
  })

  test('should convert image to base64 string', () => {
    const data = formatWith({ image: 'IMAGE INPUT' })

    expect(data.values.OFF_PHOTO).toEqual('IMAGE INPUT'.toString('base64'))
    expect(data.missing).not.toHaveProperty('OFF_PHOTO')
  })

  test('should join reporting address elements using new lines, omitting blanks', () => {
    const licence = {
      reporting: {
        reportingInstructions: {
          buildingAndStreet1: 'first',
          buildingAndStreet2: '',
          townOrCity: 'town',
          postcode: 'post',
          telephone: '123456',
        },
      },
    }

    const data = formatWith({ licence })

    expect(data.values.REPORTING_ADDRESS).toBe('first\ntown\npost\n123456')
    expect(data.missing).not.toHaveProperty('REPORTING_ADDRESS')
  })

  test('should join curfew address elements using new lines, omitting blanks', () => {
    const licence = {
      proposedAddress: {
        curfewAddress: {
          addressLine1: 'first',
          addressLine2: 'second',
          addressTown: '',
          postCode: 'post',
        },
      },
    }

    const data = formatWith({ licence })

    expect(data.values.CURFEW_ADDRESS).toBe('first\nsecond\npost')
    expect(data.missing).not.toHaveProperty('CURFEW_ADDRESS')
  })

  test('should use approved premises address instead of curfew address when approved premises required', () => {
    const licence = {
      proposedAddress: {
        curfewAddress: {
          addresses: [
            {
              addressLine1: 'first',
              addressLine2: 'second',
              addressTown: '',
              postCode: 'post',
            },
          ],
        },
      },
      bassReferral: {
        bassRequest: { bassRequested: 'Yes' },
        bassOffer: {
          bassAccepted: 'Yes',
          postCode: 'BASS PC',
          addressTown: 'BASS Town',
          addressLine1: 'BASS 1',
          addressLine2: 'BASS 2',
        },
      },
      curfew: {
        approvedPremises: {
          required: 'Yes',
        },
        approvedPremisesAddress: {
          addressLine1: 'AP 1',
          addressLine2: 'AP 2',
          addressTown: 'AP Town',
          postCode: 'AP PC',
        },
      },
    }

    const data = formatWith({ licence })

    expect(data.values.CURFEW_ADDRESS).toBe('AP 1\nAP 2\nAP Town\nAP PC')
    expect(data.missing).not.toHaveProperty('CURFEW_ADDRESS')
  })

  test('should use BASS address instead of curfew address when BASS requested and accepted', () => {
    const licence = {
      proposedAddress: {
        curfewAddress: {
          addresses: [
            {
              addressLine1: 'first',
              addressLine2: 'second',
              addressTown: '',
              postCode: 'post',
            },
          ],
        },
      },
      bassReferral: {
        bassRequest: { bassRequested: 'Yes' },
        bassOffer: {
          bassAccepted: 'Yes',
          postCode: 'BASS PC',
          addressTown: 'BASS Town',
          addressLine1: 'BASS 1',
          addressLine2: 'BASS 2',
        },
      },
    }

    const data = formatWith({ licence })

    expect(data.values.CURFEW_ADDRESS).toBe('BASS 1\nBASS 2\nBASS Town\nBASS PC')
    expect(data.missing).not.toHaveProperty('CURFEW_ADDRESS')
  })

  test('should use curfew address instead of BASS address when BASS not accepted', () => {
    const licence = {
      proposedAddress: {
        curfewAddress: {
          addressLine1: 'first',
          addressLine2: 'second',
          addressTown: '',
          postCode: 'post',
        },
      },
      bassReferral: {
        bassRequest: { bassRequested: 'Yes' },
        bassOffer: {
          bassAccepted: 'Not Yes',
          postCode: 'BASS PC',
          addressTown: 'BASS Town',
          addressLine1: 'BASS 1',
          addressLine2: 'BASS 2',
        },
      },
    }

    const data = formatWith({ licence })

    expect(data.values.CURFEW_ADDRESS).toBe('first\nsecond\npost')
    expect(data.missing).not.toHaveProperty('CURFEW_ADDRESS')
  })

  test('should use curfew address instead of BASS address when BASS not requested', () => {
    const licence = {
      proposedAddress: {
        curfewAddress: {
          addressLine1: 'first',
          addressLine2: 'second',
          addressTown: '',
          postCode: 'post',
        },
      },
      bassReferral: {
        bassRequest: { bassRequested: 'Not Yes' },
        bassOffer: {
          bassAccepted: 'Yes',
          postCode: 'BASS PC',
          addressTown: 'BASS Town',
          addressLine1: 'BASS 1',
          addressLine2: 'BASS 2',
        },
      },
    }

    const data = formatWith({ licence })

    expect(data.values.CURFEW_ADDRESS).toBe('first\nsecond\npost')
    expect(data.missing).not.toHaveProperty('CURFEW_ADDRESS')
  })

  test('should join conditions with newlines, terminated by semi-colons, with roman numeral index', () => {
    const licence = {
      licenceConditions: [
        { content: [{ text: 'first condition' }] },
        { content: [{ text: 'second condition' }] },
        { content: [{ variable: 'third condition' }] },
      ],
    }
    const expected = 'viii. first condition;\n\nix. second condition;\n\nx. third condition;'

    const data = formatWith({ licence })

    expect(data.values.CONDITIONS).toEqual(expected)
    expect(data.missing).not.toHaveProperty('CONDITIONS')
  })

  test('should join conditions except exclusions', () => {
    const licence = {
      licenceConditions: [
        { id: 'INCLUDED_1', content: [{ text: 'first included condition' }] },
        { id: 'ATTENDSAMPLE', content: [{ text: 'excluded condition' }] },
        { id: 'INCLUDED_2', content: [{ variable: 'second included condition' }] },
      ],
    }
    const expected = 'viii. first included condition;\n\nix. second included condition;'

    const data = formatWith({ licence })

    expect(data.values.CONDITIONS).toEqual(expected)
    expect(data.missing).not.toHaveProperty('CONDITIONS')
  })

  test('should add terminator before end of list if list is last text in condition', () => {
    const licence = {
      licenceConditions: [
        { id: 'INCLUDED_1', content: [{ text: 'first included condition' }] },
        { id: 'INCLUDED_2', content: [{ variable: '<ul><li>second</li><li>included</li></ul>' }] },
      ],
    }
    const expected = 'viii. first included condition;\n\nix. <ul><li>second</li><li>included;</li></ul>'

    const data = formatWith({ licence })

    expect(data.values.CONDITIONS).toEqual(expected)
  })

  test('should ignore list if list is not last text in condition', () => {
    const licence = {
      licenceConditions: [
        { id: 'INCLUDED_1', content: [{ text: 'first included condition' }] },
        { id: 'INCLUDED_2', content: [{ variable: '<ul><li>second</li><li>included</li></ul>condition' }] },
      ],
    }
    const expected = 'viii. first included condition;\n\nix. <ul><li>second</li><li>included</li></ul>condition;'

    const data = formatWith({ licence })

    expect(data.values.CONDITIONS).toEqual(expected)
  })

  test('should join PSS conditions only for inclusions', () => {
    const licence = {
      licenceConditions: [
        { id: 'ATTENDSAMPLE', content: [{ text: 'first PSS condition' }] },
        { id: 'NOT_A_PSS_CONDITION', content: [{ text: 'excluded condition' }] },
        { id: 'ATTENDDEPENDENCY', content: [{ variable: 'second PSS condition' }] },
      ],
    }
    const expected = 'ix. first PSS condition;\n\nx. second PSS condition;'

    const data = formatWith({ licence })

    expect(data.values.PSSCONDITIONS).toEqual(expected)
    expect(data.missing).not.toHaveProperty('PSSCONDITIONS')
  })

  test('should skip placeholder when standard conditions only', () => {
    const licence = {
      licenceConditions: { standard: { additionalConditionsRequired: 'No' } },
    }

    const data = formatWith({ licence })

    expect(data.values.CONDITIONS).toBe('')
    expect(data.values.PSSCONDITIONS).toBe('')
    expect(data.missing.CONDITIONS).toEqual(displayNames.CONDITIONS)
    expect(data.missing.PSSCONDITIONS).toEqual(displayNames.PSSCONDITIONS)
  })

  test('should skip placeholder when additional conditions needed but not supplied', () => {
    const licence = {
      licenceConditions: { standard: { additionalConditionsRequired: 'Yes' } },
    }

    const data = formatWith({ licence })

    expect(data.values.CONDITIONS).toBe('')
    expect(data.values.PSSCONDITIONS).toBe('')
    expect(data.missing.CONDITIONS).toEqual(displayNames.CONDITIONS)
    expect(data.missing.PSSCONDITIONS).toEqual(displayNames.PSSCONDITIONS)
  })

  test('should skip placeholder when additional conditions empty', () => {
    const licence = {
      licenceConditions: [],
    }

    const data = formatWith({ licence })

    expect(data.values.CONDITIONS).toBe('')
    expect(data.values.PSSCONDITIONS).toBe('')
    expect(data.missing.CONDITIONS).toEqual(displayNames.CONDITIONS)
    expect(data.missing.PSSCONDITIONS).toEqual(displayNames.PSSCONDITIONS)
  })

  test('should take version number and date from approvedVersionDetails', () => {
    const approvedVersionDetails = {
      approvedVersion: 111,
      timestamp: '123',
    }

    const data = formatWith({ approvedVersionDetails })

    expect(data.values.VERSION_DATE).toBe('123')
    expect(data.values.VERSION_NUMBER).toBe('111')
    expect(data.missing).not.toHaveProperty('VERSION_DATE')
    expect(data.missing).not.toHaveProperty('VERSION_NUMBER')
  })

  test('should add name of decision maker', () => {
    const licence = {
      approval: {
        release: {
          decisionMaker: 'first last',
        },
      },
    }

    const data = formatWith({ licence })

    expect(data.values.APPROVER).toBe('first last')
    expect(data.missing).not.toHaveProperty('APPROVER')
  })

  test('should format conditions text with commas and spaces', () => {
    const content = [
      {
        text:
          'To comply with any requirements specified by your supervising officer for the purpose of ensuring that you address your ',
      },
      { variable: ['anger', 'debt', 'offending behaviour'] },
      { text: ' problems at the ' },
      { variable: 'NHS Clinic' },
      { text: '.' },
    ]
    const terminator = ';'

    const conditionText = getConditionText(content, terminator)
    expect(conditionText).toBe(
      'To comply with any requirements specified by your supervising officer for the purpose of ensuring that you address your anger, debt, offending behaviour problems at the NHS Clinic;'
    )
  })

  test('should contain single selection from  abuseAndBehaviours', () => {
    const content = [
      {
        text:
          'To comply with any requirements specified by your supervising officer for the purpose of ensuring that you address your ',
      },
      { variable: ['drug abuse'] },
      { text: ' problems at the Misuse Support Services' },
    ]
    const terminator = ';'

    const conditionText = getConditionText(content, terminator)
    expect(conditionText).toBe(
      'To comply with any requirements specified by your supervising officer for the purpose of ensuring that you address your drug abuse problems at the Misuse Support Services;'
    )
  })
  test('should contain multiple selection from abuseAndBehaviours', () => {
    const content = [
      {
        text:
          'To comply with any requirements specified by your supervising officer for the purpose of ensuring that you address your ',
      },
      { variable: ['alcohol abuse', 'drug abuse'] },
      { text: ' problems at the Misuse Support Services' },
    ]
    const terminator = ';'

    const conditionText = getConditionText(content, terminator)
    expect(conditionText).toBe(
      'To comply with any requirements specified by your supervising officer for the purpose of ensuring that you address your alcohol abuse, drug abuse problems at the Misuse Support Services;'
    )
  })
})

const allValuesEmpty = {
  CONDITIONS: '',
  CURFEW_ADDRESS: 'PLACEHOLDER',
  CURFEW_FIRST_FROM: 'PLACEHOLDER',
  CURFEW_FIRST_UNTIL: 'PLACEHOLDER',
  CURFEW_FRI_FROM: 'PLACEHOLDER',
  CURFEW_FRI_UNTIL: 'PLACEHOLDER',
  CURFEW_MON_FROM: 'PLACEHOLDER',
  CURFEW_MON_UNTIL: 'PLACEHOLDER',
  CURFEW_SAT_FROM: 'PLACEHOLDER',
  CURFEW_SAT_UNTIL: 'PLACEHOLDER',
  CURFEW_SUN_FROM: 'PLACEHOLDER',
  CURFEW_SUN_UNTIL: 'PLACEHOLDER',
  CURFEW_THU_FROM: 'PLACEHOLDER',
  CURFEW_THU_UNTIL: 'PLACEHOLDER',
  CURFEW_TUE_FROM: 'PLACEHOLDER',
  CURFEW_TUE_UNTIL: 'PLACEHOLDER',
  CURFEW_WED_FROM: 'PLACEHOLDER',
  CURFEW_WED_UNTIL: 'PLACEHOLDER',
  EST_PHONE: 'PLACEHOLDER',
  EST_PREMISE: 'PLACEHOLDER',
  MONITOR: '0800 137 291', // tagging co phone is hardcoded so always present
  OFF_BOOKING: 'PLACEHOLDER',
  OFF_CRO: '',
  OFF_DOB: 'PLACEHOLDER',
  OFF_NAME: 'PLACEHOLDER',
  OFF_NOMS: 'PLACEHOLDER',
  OFF_PHOTO: 'PLACEHOLDER',
  OFF_PNC: '',
  PSSCONDITIONS: '',
  REPORTING_ADDRESS: 'PLACEHOLDER',
  REPORTING_AT: 'PLACEHOLDER',
  REPORTING_NAME: 'PLACEHOLDER',
  REPORTING_ON: 'PLACEHOLDER',
  SENT_CRD: 'PLACEHOLDER',
  SENT_HDCAD: 'PLACEHOLDER',
  SENT_LED: 'PLACEHOLDER',
  SENT_SED: 'PLACEHOLDER',
  SENT_TUSED: 'PLACEHOLDER',
  VERSION_DATE: 'PLACEHOLDER',
  VERSION_NUMBER: 'PLACEHOLDER',
  APPROVER: 'PLACEHOLDER',
  VARY_APPROVER: 'PLACEHOLDER',
  CREATION_DATE: '01/01/2001',
}

const displayNames = {
  document: {
    optional: {
      VERSION_DATE: 'Version date',
      VERSION_NUMBER: 'Version number',
      APPROVER: 'Name of decision maker',
    },
  },
  conditions: {
    optional: {
      CONDITIONS: 'Additional conditions',
      PSSCONDITIONS: 'Post-sentence supervision conditions',
    },
  },
  curfew: {
    optional: {
      CURFEW_ADDRESS: 'Curfew address',
      CURFEW_FRI_FROM: 'Curfew Friday from',
      CURFEW_FRI_UNTIL: 'Curfew Friday until',
      CURFEW_MON_FROM: 'Curfew Monday from',
      CURFEW_MON_UNTIL: 'Curfew Monday until',
      CURFEW_SAT_FROM: 'Curfew Saturday from',
      CURFEW_SAT_UNTIL: 'Curfew Saturday until',
      CURFEW_SUN_FROM: 'Curfew Sunday from',
      CURFEW_SUN_UNTIL: 'Curfew Sunday until',
      CURFEW_THU_FROM: 'Curfew Thursday from',
      CURFEW_THU_UNTIL: 'Curfew Thursday until',
      CURFEW_TUE_FROM: 'Curfew Tuesday from',
      CURFEW_TUE_UNTIL: 'Curfew Tuesday until',
      CURFEW_WED_FROM: 'Curfew Wednesday from',
      CURFEW_WED_UNTIL: 'Curfew Wednesday until',
    },
  },
  firstNight: {
    mandatoryPreRelease: {
      CURFEW_FIRST_FROM: 'Curfew first night from',
      CURFEW_FIRST_UNTIL: 'Curfew first night until',
    },
  },
  reporting: {
    optional: {
      REPORTING_AT: 'Reporting at',
      REPORTING_ON: 'Reporting on',
      REPORTING_ADDRESS: 'Reporting address',
      REPORTING_NAME: 'Reporting name',
    },
  },
  sentence: {
    mandatory: {
      EST_PHONE: 'Prison telephone number',
      EST_PREMISE: 'Prison name',
      OFF_BOOKING: 'Booking ID',
      OFF_DOB: 'Offender date of birth',
      OFF_NAME: 'Offender name',
      OFF_NOMS: 'Noms ID',
      OFF_PHOTO: 'Offender photograph',
      SENT_CRD: 'Conditional release date (CRD)',
      SENT_HDCAD: 'HDC approved date (HDCAD)',
      SENT_LED: 'Licence expiry date (LED)',
      SENT_SED: 'Sentence expiry date (SED)',
      SENT_TUSED: 'Top-up supervision end date (TUSED)',
    },
    preferred: {
      OFF_CRO: 'CRO number',
      OFF_PNC: 'PNC ID',
    },
  },
  varyApproval: {
    mandatoryPostRelease: {
      VARY_APPROVER: 'Name of approver',
    },
  },
}
