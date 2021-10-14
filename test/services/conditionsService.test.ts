import createConditionsService from '../../server/services/conditionsService'
import { standardConditions } from '../../server/services/config/conditionsConfig'
import {
  additionalConditionsObject,
  additionalConditionsObjectNoResideSelected,
  additionalConditionsObjectDateSelected,
} from '../stubs/conditions'

describe('conditionsService', () => {
  let service

  beforeEach(() => {
    service = createConditionsService()
  })

  describe('getStandardConditions', () => {
    test('should return the conditions', () => {
      return expect(service.getStandardConditions()).toEqual(standardConditions)
    })
  })

  describe('getAdditionalConditions', () => {
    test('should split the conditions by group and subgroup', () => {
      return expect(service.getAdditionalConditions()).toEqual(additionalConditionsObject)
    })

    test('should populate inputs if licence is passed in', () => {
      const licence = {
        licenceConditions: {
          additional: { NORESIDE: { notResideWithAge: 12, notResideWithGender: 'Female' } },
        },
      }

      return expect(service.getAdditionalConditions(licence)).toEqual(additionalConditionsObjectNoResideSelected)
    })

    test('should split the appointmentDate into day, month, year', () => {
      const licence = {
        licenceConditions: {
          additional: { ATTENDDEPENDENCY: { appointmentDate: '12/03/1985' } },
        },
      }

      return expect(service.getAdditionalConditions(licence)).toEqual(additionalConditionsObjectDateSelected)
    })
  })

  describe('populateLicenceWithConditions', () => {
    test('should return the licence if conditions not required', () => {
      const licence = {
        licenceConditions: {
          standard: { additionalConditionsRequired: 'No' },
          additional: { 1: {} },
          bespoke: [],
        },
      }

      return expect(service.populateLicenceWithConditions(licence)).toEqual(licence)
    })

    test('should return licence if no additional conditions', () => {
      const licence = { licenceConditions: {} }

      return expect(service.populateLicenceWithConditions(licence)).toEqual(licence)
    })

    test('should return licence with additional conditions', () => {
      const licence = {
        licenceConditions: {
          standard: { additionalConditionsRequired: 'Yes' },
          additional: { ATTENDDEPENDENCY: { appointmentDate: '12/03/1985' } },
          conditionsSummary: { additionalConditionsJustification: 'Justification of additional conditions' },
        },
      }

      return expect(service.populateLicenceWithConditions(licence)).toEqual({
        licenceConditions: [
          {
            content: [
              {
                text: 'Attend ',
              },
              {
                variable: ' on 12/03/1985 at ',
              },
              {
                text: ', as directed, to address your dependency on, or propensity to misuse, a controlled drug.',
              },
            ],
            group: 'Post-sentence supervision only',
            id: 'ATTENDDEPENDENCY',
            inputRequired: true,
            subgroup: null,
          },
        ],
        additionalConditionsJustification: 'Justification of additional conditions',
      })
    })

    test('should return licence with bespoke conditions', () => {
      const licence = {
        licenceConditions: {
          standard: { additionalConditionsRequired: 'Yes' },
          additional: {},
          bespoke: [
            { text: 'approved text', approved: 'Yes' },
            { text: 'unapproved text', approved: 'No' },
          ],
        },
      }

      return expect(service.populateLicenceWithConditions(licence)).toEqual({
        licenceConditions: [
          {
            approved: 'Yes',
            content: [
              {
                text: 'approved text',
              },
            ],
            group: 'Bespoke',
            id: 'bespoke-0',
            subgroup: null,
          },
          {
            approved: 'No',
            content: [
              {
                text: 'unapproved text',
              },
            ],
            group: 'Bespoke',
            id: 'bespoke-1',
            subgroup: null,
          },
        ],
        additionalConditionsJustification: undefined,
      })
    })
  })

  describe('populateLicenceWithApprovedConditions', () => {
    test('should return licence with only approved bespoke conditions', () => {
      const licence = {
        licenceConditions: {
          standard: { additionalConditionsRequired: 'Yes' },
          additional: {},
          bespoke: [
            { text: 'approved text', approved: 'Yes' },
            { text: 'unapproved text', approved: 'No' },
            { text: 'unapproved text' },
          ],
        },
      }

      return expect(service.populateLicenceWithApprovedConditions(licence)).toEqual({
        licenceConditions: [
          {
            approved: 'Yes',
            content: [
              {
                text: 'approved text',
              },
            ],
            group: 'Bespoke',
            id: 'bespoke-0',
            subgroup: null,
          },
        ],
        additionalConditionsJustification: undefined,
      })
    })
  })

  describe('createConditionsObjectForLicence', () => {
    test('should combine additional and bespoke conditions', () => {
      expect(
        service.createConditionsObjectForLicence({ additionalConditions: 'NOCONTACTPRISONER' }, [{ text: 'bespoke' }])
      ).toEqual({
        additional: { NOCONTACTPRISONER: {} },
        bespoke: [{ text: 'bespoke' }],
      })
    })

    test('should return an object for each selected item including form data', () => {
      expect(
        service.createConditionsObjectForLicence(
          { additionalConditions: ['NOCONTACTPRISONER', 'NOCONTACTASSOCIATE'], groupsOrOrganisation: 'something' },
          []
        )
      ).toEqual({
        additional: {
          NOCONTACTPRISONER: {},
          NOCONTACTASSOCIATE: {
            groupsOrOrganisation: 'something',
          },
        },
        bespoke: [],
      })
    })
  })

  describe('populateAdditionalConditionsAsObject', () => {
    test('should add text to licence if selected and has no user input', () => {
      const rawLicence = {
        licenceConditions: {
          additional: { 1: {} },
          bespoke: [],
          conditionsSummary: { additionalConditionsJustification: 'Justification of additional conditions' },
        },
      }
      const selectedConditions = [
        {
          id: 1,
          user_input: null,
          text: 'The condition',
          group_name: 'g',
          subgroup_name: 'sg',
        },
      ]

      const output = service.populateAdditionalConditionsAsObject(rawLicence, selectedConditions)

      const expectedOutput = {
        licenceConditions: [
          {
            content: [{ text: 'The condition' }],
            group: 'g',
            subgroup: 'sg',
            id: 1,
            inputRequired: false,
          },
        ],
        additionalConditionsJustification: 'Justification of additional conditions',
      }

      expect(output).toEqual(expectedOutput)
    })

    test('should add bespoke conditions to the output in the same format, including generated IDs', () => {
      const rawLicence = {
        licenceConditions: {
          additional: { 1: {} },
          bespoke: [
            { text: 'bespoke1', approved: 'Yes' },
            { text: 'bespoke2', approved: 'No' },
          ],
          conditionsSummary: { additionalConditionsJustification: 'Justification of additional conditions' },
        },
      }
      const selectedConditions = [
        {
          id: 1,
          user_input: null,
          text: 'The condition',
          group_name: 'g',
          subgroup_name: 'sg',
        },
      ]

      const output = service.populateAdditionalConditionsAsObject(rawLicence, selectedConditions)

      const expectedOutput = {
        licenceConditions: [
          {
            content: [{ text: 'The condition' }],
            group: 'g',
            subgroup: 'sg',
            id: 1,
            inputRequired: false,
          },
          {
            content: [{ text: 'bespoke1' }],
            group: 'Bespoke',
            subgroup: null,
            id: 'bespoke-0',
            approved: 'Yes',
          },
          {
            content: [{ text: 'bespoke2' }],
            group: 'Bespoke',
            subgroup: null,
            id: 'bespoke-1',
            approved: 'No',
          },
        ],
        additionalConditionsJustification: 'Justification of additional conditions',
      }

      expect(output).toEqual(expectedOutput)
    })

    test('should return object for view containing condition sections', () => {
      const rawLicence = {
        licenceConditions: {
          additional: { 1: { appointmentName: 'injected' } },
          bespoke: [],
          conditionsSummary: { additionalConditionsJustification: 'Justification of additional conditions' },
        },
      }
      const selectedConditions = [
        {
          id: 1,
          user_input: 'appointmentName',
          text: 'The condition [placeholder] with input',
          field_position: { appointmentName: 0 },
          group_name: 'g',
          subgroup_name: 'sg',
        },
      ]

      const output = service.populateAdditionalConditionsAsObject(rawLicence, selectedConditions)

      const expectedOutput = {
        licenceConditions: [
          {
            content: [{ text: 'The condition ' }, { variable: 'injected' }, { text: ' with input' }],
            group: 'g',
            subgroup: 'sg',
            id: 1,
            inputRequired: true,
          },
        ],
        additionalConditionsJustification: 'Justification of additional conditions',
      }

      expect(output).toEqual(expectedOutput)
    })

    test('should replace placeholder text for dependency appointment conditions for view', () => {
      const rawLicence = {
        licenceConditions: {
          additional: {
            1: {
              appointmentAddress: 'Address 1',
              appointmentDate: '21/01/2018',
              appointmentTime: '15:30',
            },
          },
          bespoke: [],
          conditionsSummary: { additionalConditionsJustification: 'Justification of additional conditions' },
        },
      }
      const selectedConditions = [
        {
          id: 1,
          user_input: 'appointmentDetails',
          text: 'The condition [placeholder] with input',
          field_position: { appointmentAddress: 0, appointmentDate: 1, appointmentTime: 2 },
          group_name: 'g',
          subgroup_name: 'sg',
        },
      ]

      const output = service.populateAdditionalConditionsAsObject(rawLicence, selectedConditions)

      const expectedOutput = {
        licenceConditions: [
          {
            content: [
              { text: 'The condition ' },
              { variable: 'Address 1 on 21/01/2018 at 15:30' },
              { text: ' with input' },
            ],
            group: 'g',
            subgroup: 'sg',
            id: 1,
            inputRequired: true,
          },
        ],
        additionalConditionsJustification: 'Justification of additional conditions',
      }

      expect(output).toEqual(expectedOutput)
    })

    test('should replace placeholder text for sample appointment conditions for view', () => {
      const rawLicence = {
        licenceConditions: {
          additional: {
            1: {
              attendSampleDetailsName: 'name',
              attendSampleDetailsAddress: 'address',
            },
          },
          bespoke: [],
          conditionsSummary: { additionalConditionsJustification: 'Justification of additional conditions' },
        },
      }
      const selectedConditions = [
        {
          id: 1,
          user_input: 'attendSampleDetails',
          text: 'The condition [placeholder] with input',
          field_position: { attendSampleDetailsName: 0, attendSampleDetailsAddress: 1 },
          group_name: 'g',
          subgroup_name: 'sg',
        },
      ]

      const output = service.populateAdditionalConditionsAsObject(rawLicence, selectedConditions)

      const expectedOutput = {
        licenceConditions: [
          {
            content: [{ text: 'The condition ' }, { variable: 'name, address' }, { text: ' with input' }],
            group: 'g',
            subgroup: 'sg',
            id: 1,
            inputRequired: true,
          },
        ],
        additionalConditionsJustification: 'Justification of additional conditions',
      }

      expect(output).toEqual(expectedOutput)
    })

    test('should replace placeholder text for drug testing appointment conditions for view', () => {
      const rawLicence = {
        licenceConditions: {
          additional: {
            1: {
              drug_testing_name: 'name',
              drug_testing_address: 'address',
            },
          },
          bespoke: [],
          conditionsSummary: { additionalConditionsJustification: 'Justification of additional conditions' },
        },
      }
      const selectedConditions = [
        {
          id: 1,
          user_input: 'drug_testing',
          text: 'The condition [placeholder] with input',
          field_position: { drug_testing_name: 0, drug_testing_address: 1 },
          group_name: 'g',
          subgroup_name: 'sg',
        },
      ]

      const output = service.populateAdditionalConditionsAsObject(rawLicence, selectedConditions)

      const expectedOutput = {
        licenceConditions: [
          {
            content: [{ text: 'The condition ' }, { variable: 'name, address' }, { text: ' with input' }],
            group: 'g',
            subgroup: 'sg',
            id: 1,
            inputRequired: true,
          },
        ],
        additionalConditionsJustification: 'Justification of additional conditions',
      }

      expect(output).toEqual(expectedOutput)
    })

    test('should join all fields and separators for multi field conditions when some missing', () => {
      const rawLicence = {
        licenceConditions: {
          additional: {
            1: {
              appointmentAddress: 'Address 1',
              appointmentTime: '15:30',
            },
          },
          bespoke: [],
          conditionsSummary: { additionalConditionsJustification: 'Justification of additional conditions' },
        },
      }
      const selectedConditions = [
        {
          id: 1,
          user_input: 'appointmentDetails',
          text: 'The condition [placeholder] with input',
          field_position: { appointmentAddress: 0, appointmentDate: 1, appointmentTime: 2 },
          group_name: 'g',
          subgroup_name: 'sg',
        },
      ]

      const output = service.populateAdditionalConditionsAsObject(rawLicence, selectedConditions)

      const expectedOutput = {
        licenceConditions: [
          {
            content: [{ text: 'The condition ' }, { variable: 'Address 1 on  at 15:30' }, { text: ' with input' }],
            group: 'g',
            subgroup: 'sg',
            id: 1,
            inputRequired: true,
          },
        ],
        additionalConditionsJustification: 'Justification of additional conditions',
      }

      expect(output).toEqual(expectedOutput)
    })

    test('should replace placeholder text when multiple items for view', () => {
      const rawLicence = {
        licenceConditions: {
          additional: { 1: { field: 'injected', appointmentTime: 'injected2' } },
          bespoke: [],
          conditionsSummary: { additionalConditionsJustification: 'Justification of additional conditions' },
        },
      }
      const selectedConditions = [
        {
          id: 1,
          user_input: 'standardCondition',
          text: 'The condition [placeholder] with input [placeholder2] and another',
          field_position: { field: 0, appointmentTime: 1 },
          group_name: 'g',
          subgroup_name: 'sg',
        },
      ]

      const output = service.populateAdditionalConditionsAsObject(rawLicence, selectedConditions)

      const expectedOutput = {
        licenceConditions: [
          {
            content: [
              { text: 'The condition ' },
              { variable: 'injected' },
              { text: ' with input ' },
              { variable: 'injected2' },
              { text: ' and another' },
            ],
            group: 'g',
            subgroup: 'sg',
            id: 1,
            inputRequired: true,
          },
        ],
        additionalConditionsJustification: 'Justification of additional conditions',
      }

      expect(output).toEqual(expectedOutput)
    })

    test('should replace placeholder text when multiple items in wrong order for view', () => {
      const rawLicence = {
        licenceConditions: {
          additional: { 1: { field: 'injected', appointmentTime: 'injected2' } },
          bespoke: [],
          conditionsSummary: { additionalConditionsJustification: 'Justification of additional conditions' },
        },
      }
      const selectedConditions = [
        {
          id: 1,
          user_input: 'standardCondition',
          text: 'The condition [placeholder] with input [placeholder2] and another',
          field_position: { appointmentTime: 1, field: 0 },
          group_name: 'g',
          subgroup_name: 'sg',
        },
      ]

      const output = service.populateAdditionalConditionsAsObject(rawLicence, selectedConditions)

      const expectedOutput = {
        licenceConditions: [
          {
            content: [
              { text: 'The condition ' },
              { variable: 'injected' },
              { text: ' with input ' },
              { variable: 'injected2' },
              { text: ' and another' },
            ],
            group: 'g',
            subgroup: 'sg',
            id: 1,
            inputRequired: true,
          },
        ],
        additionalConditionsJustification: 'Justification of additional conditions',
      }

      expect(output).toEqual(expectedOutput)
    })

    test('should replace placeholder text when multiple conditions for view', () => {
      const rawLicence = {
        licenceConditions: {
          additional: {
            1: { field: 'injected', appointmentTime: 'injected2' },
            2: { groupsOrOrganisation: 'injected3' },
          },
          bespoke: [],
          conditionsSummary: { additionalConditionsJustification: 'Justification of additional conditions' },
        },
      }
      const selectedConditions = [
        {
          id: 1,
          user_input: 'standardCondition',
          text: 'The condition [placeholder] with input [placeholder2] and another',
          field_position: { field: 0, appointmentTime: 1 },
          group_name: 'g',
          subgroup_name: 'sg',
          inputRequired: true,
        },
        {
          id: 2,
          user_input: 'groupsOrOrganisations',
          text: 'The condition [placeholder]',
          field_position: { groupsOrOrganisation: 0 },
          group_name: 'g2',
          subgroup_name: 'sg2',
          inputRequired: true,
        },
      ]

      const output = service.populateAdditionalConditionsAsObject(rawLicence, selectedConditions)

      const expectedOutput = {
        licenceConditions: [
          {
            content: [
              { text: 'The condition ' },
              { variable: 'injected' },
              { text: ' with input ' },
              { variable: 'injected2' },
              { text: ' and another' },
            ],
            group: 'g',
            subgroup: 'sg',
            id: 1,
            inputRequired: true,
          },
          {
            content: [{ text: 'The condition ' }, { variable: 'injected3' }],
            group: 'g2',
            subgroup: 'sg2',
            id: 2,
            inputRequired: true,
          },
        ],
        additionalConditionsJustification: 'Justification of additional conditions',
      }

      expect(output).toEqual(expectedOutput)
    })

    describe('When there are errors in user input', () => {
      test('should return object for view containing input errors', () => {
        const rawLicence = {
          licenceConditions: {
            additional: { 1: { appointmentName: 'injected' } },
            bespoke: [],
            conditionsSummary: { additionalConditionsJustification: 'Justification of additional conditions' },
          },
        }
        const errorLicence = { 1: { appointmentName: 'ERROR' } }
        const selectedConditions = [
          {
            id: 1,
            user_input: 'appointmentName',
            text: 'The condition [placeholder] with input',
            field_position: { appointmentName: 0 },
            group_name: 'g',
            subgroup_name: 'sg',
          },
        ]

        const output = service.populateAdditionalConditionsAsObject(rawLicence, selectedConditions, errorLicence)

        const expectedOutput = {
          licenceConditions: [
            {
              content: [{ text: 'The condition ' }, { error: '[ERROR]' }, { text: ' with input' }],
              group: 'g',
              subgroup: 'sg',
              id: 1,
              inputRequired: true,
            },
          ],
          additionalConditionsJustification: 'Justification of additional conditions',
        }

        expect(output).toEqual(expectedOutput)
      })

      test('should replace placeholder text for dependency appointment conditions with errors', () => {
        const rawLicence = {
          licenceConditions: {
            additional: {
              1: {
                appointmentAddress: 'Address 1',
                appointmentDate: '21/01/2018',
                appointmentTime: '15:30',
              },
            },
            bespoke: [],
            conditionsSummary: { additionalConditionsJustification: 'Justification of additional conditions' },
          },
        }

        const errors = { 1: { appointmentDate: 'Invalid date' } }
        const selectedConditions = [
          {
            id: 1,
            user_input: 'appointmentDetails',
            text: 'The condition [placeholder] with input',
            field_position: { appointmentAddress: 0, appointmentDate: 1, appointmentTime: 2 },
            group_name: 'g',
            subgroup_name: 'sg',
          },
        ]

        const output = service.populateAdditionalConditionsAsObject(rawLicence, selectedConditions, errors)

        const expectedOutput = {
          licenceConditions: [
            {
              content: [
                { text: 'The condition ' },
                { error: 'Address 1 on [Invalid date] at 15:30' },
                { text: ' with input' },
              ],
              group: 'g',
              subgroup: 'sg',
              id: 1,
              inputRequired: true,
            },
          ],
          additionalConditionsJustification: 'Justification of additional conditions',
        }

        expect(output).toEqual(expectedOutput)
      })

      test('should replace placeholder text for sample appointment conditions with errors', () => {
        const rawLicence = {
          licenceConditions: {
            additional: {
              1: {
                attendSampleDetailsName: 'name',
                attendSampleDetailsAddress: 'address',
              },
            },
            bespoke: [],
            conditionsSummary: { additionalConditionsJustification: 'Justification of additional conditions' },
          },
        }

        const errors = { 1: { attendSampleDetailsName: 'Missing' } }
        const selectedConditions = [
          {
            id: 1,
            user_input: 'attendSampleDetails',
            text: 'The condition [placeholder] with input',
            field_position: { attendSampleDetailsName: 0, attendSampleDetailsAddress: 1 },
            group_name: 'g',
            subgroup_name: 'sg',
          },
        ]

        const output = service.populateAdditionalConditionsAsObject(rawLicence, selectedConditions, errors)

        const expectedOutput = {
          licenceConditions: [
            {
              content: [{ text: 'The condition ' }, { error: '[Missing], address' }, { text: ' with input' }],
              group: 'g',
              subgroup: 'sg',
              id: 1,
              inputRequired: true,
            },
          ],
          additionalConditionsJustification: 'Justification of additional conditions',
        }

        expect(output).toEqual(expectedOutput)
      })

      test('should replace placeholder text for drug testing appointment conditions with errors', () => {
        const rawLicence = {
          licenceConditions: {
            additional: {
              1: {
                drug_testing_name: 'name',
                drug_testing_address: 'address',
              },
            },
            bespoke: [],
            conditionsSummary: { additionalConditionsJustification: 'Justification of additional conditions' },
          },
        }

        const errors = { 1: { drug_testing_name: 'Missing' } }
        const selectedConditions = [
          {
            id: 1,
            user_input: 'drug_testing',
            text: 'The condition [placeholder] with input',
            field_position: { drug_testing_name: 0, drug_testing_address: 1 },
            group_name: 'g',
            subgroup_name: 'sg',
          },
        ]

        const output = service.populateAdditionalConditionsAsObject(rawLicence, selectedConditions, errors)

        const expectedOutput = {
          licenceConditions: [
            {
              content: [{ text: 'The condition ' }, { error: '[Missing], address' }, { text: ' with input' }],
              group: 'g',
              subgroup: 'sg',
              id: 1,
              inputRequired: true,
            },
          ],
          additionalConditionsJustification: 'Justification of additional conditions',
        }

        expect(output).toEqual(expectedOutput)
      })
    })
  })

  describe('getFullTextForApprovedConditions', () => {
    const standardConditionsText = standardConditions.map((it) => it.text.replace(/\.+$/, ''))

    test('should always return standard conditions even for empty licence', () => {
      const licence = {
        licenceConditions: {
          standard: {},
        },
      }

      return expect(service.getFullTextForApprovedConditions(licence)).toEqual({
        standardConditions: standardConditionsText,
        additionalConditions: [],
      })
    })

    test('should return standard conditions only when no additional conditions required', () => {
      const licence = {
        licenceConditions: { standard: { additionalConditionsRequired: 'No' } },
      }

      return expect(service.getFullTextForApprovedConditions(licence)).toEqual({
        standardConditions: standardConditionsText,
        additionalConditions: [],
      })
    })

    test('should return additional conditions as text', () => {
      const licence = {
        licenceConditions: {
          standard: { additionalConditionsRequired: 'Yes' },
          additional: { ATTENDDEPENDENCY: { appointmentDate: '12/03/1985' } },
        },
      }

      return expect(service.getFullTextForApprovedConditions(licence)).toEqual({
        standardConditions: standardConditionsText,
        additionalConditions: [
          'Attend  on 12/03/1985 at , as directed, to address your dependency on, or propensity to misuse, a controlled drug',
        ],
      })
    })

    test('should return only approved bespoke conditions', () => {
      const licence = {
        licenceConditions: {
          standard: { additionalConditionsRequired: 'Yes' },
          additional: {},
          bespoke: [
            { text: 'approved text', approved: 'Yes' },
            { text: 'unapproved text', approved: 'No' },
            { text: 'unapproved text' },
          ],
        },
      }

      return expect(service.getFullTextForApprovedConditions(licence)).toEqual({
        standardConditions: standardConditionsText,
        additionalConditions: ['approved text'],
      })
    })
  })
  describe('getNonStandardConditions', () => {
    test('should return correctly 4 formatted contents', () => {
      const licence = {
        licenceConditions: {
          additional: {
            ATTENDSAMPLE: {
              attendSampleDetailsName: 'The Probation Service',
              attendSampleDetailsAddress: '1, Some Address',
            },
            NOCONTACTASSOCIATE: {
              groupsOrOrganisation: 'James Smith',
            },
          },
          standard: {
            additionalConditionsRequired: 'Yes',
          },
          bespoke: [
            {
              text: 'Bespoke condition 1',
              approved: 'Yes',
            },
            {
              text: 'some text input but yes/no not selected',
            },
          ],
        },
      }

      return expect(service.getNonStandardConditions(licence)).toEqual({
        additionalConditions: [
          {
            text: 'Not to associate with any person currently or formerly associated with James Smith without the prior approval of your supervising officer',
          },
        ],
        bespokeConditions: [{ text: 'Bespoke condition 1' }],
        pssConditions: [
          {
            text: 'Attend The Probation Service, 1, Some Address, as reasonably required by your supervisor, to give a sample of oral fluid/urine in order to test whether you have any specified Class A and specified Class B drugs in your body, for the purpose of ensuring that you are complying with the requirement of supervision period requiring you to be of good behaviour',
          },
        ],
        unapprovedBespokeConditions: [{ text: 'some text input but yes/no not selected' }],
      })
    })

    test('should return 4 empty arrays', () => {
      const licence = {
        licenceConditions: { bespoke: [], standard: { additionalConditionsRequired: 'Yes' }, additional: {} },
      }

      return expect(service.getNonStandardConditions(licence)).toEqual({
        additionalConditions: [],
        bespokeConditions: [],
        pssConditions: [],
        unapprovedBespokeConditions: [],
      })
    })

    test('should return 2 unapprovedBespokeConditions if approved = No', () => {
      const licence = {
        licenceConditions: {
          additional: {},
          standard: { additionalConditionsRequired: 'Yes' },
          bespoke: [
            {
              text: 'Bespoke condition text 1',
              approved: 'No',
            },
            {
              text: 'Bespoke condition text 2',
              approved: 'No',
            },
          ],
        },
      }

      return expect(service.getNonStandardConditions(licence)).toEqual({
        additionalConditions: [],
        bespokeConditions: [],
        pssConditions: [],
        unapprovedBespokeConditions: [{ text: 'Bespoke condition text 1' }, { text: 'Bespoke condition text 2' }],
      })
    })

    test('should return 0 bespoke conditions but 1 unapprovedBespokeConditions because approved is neither Yes/No', () => {
      const licence = {
        licenceConditions: {
          additional: {},
          standard: { additionalConditionsRequired: 'Yes' },
          bespoke: [
            {
              text: 'Bespoke condition text',
            },
          ],
        },
      }

      return expect(service.getNonStandardConditions(licence)).toEqual({
        additionalConditions: [],
        bespokeConditions: [],
        pssConditions: [],
        unapprovedBespokeConditions: [{ text: 'Bespoke condition text' }],
      })
    })
  })
})
