const createConditionsService = require('../../server/services/conditionsService')
const { standardConditions } = require('../../server/services/config/conditionsConfig')
const { getAdditionalConditionsConfig } = require('../../server/services/config/conditionsConfig')
const {
  additionalConditionsObject,
  additionalConditionsObjectNoResideSelected,
  additionalConditionsObjectDateSelected,
} = require('../stubs/conditions')

describe('conditionsService', () => {
  let service

  beforeEach(() => {
    service = createConditionsService({ use2019Conditions: false })
  })

  describe('getStandardConditions', () => {
    it('should return the conditions', () => {
      return expect(service.getStandardConditions()).to.eql(standardConditions)
    })
  })

  describe('getAdditionalConditions', () => {
    it('should split the conditions by group and subgroup', () => {
      return expect(service.getAdditionalConditions()).to.eql(additionalConditionsObject)
    })

    it('should populate inputs if licence is passed in', () => {
      const licence = {
        licenceConditions: {
          additional: { NORESIDE: { notResideWithAge: 12, notResideWithGender: 'Female' } },
        },
      }

      return expect(service.getAdditionalConditions(licence)).to.eql(additionalConditionsObjectNoResideSelected)
    })

    it('should split the appointmentDate into day, month, year', () => {
      const licence = {
        licenceConditions: {
          additional: { ATTENDDEPENDENCY: { appointmentDate: '12/03/1985' } },
        },
      }

      return expect(service.getAdditionalConditions(licence)).to.eql(additionalConditionsObjectDateSelected)
    })
  })

  describe('populateLicenceWithConditions', () => {
    it('should return the licence if conditions not required', () => {
      const licence = {
        licenceConditions: {
          standard: { additionalConditionsRequired: 'No' },
          additional: { 1: {} },
          bespoke: [],
        },
      }

      return expect(service.populateLicenceWithConditions(licence)).to.eql(licence)
    })

    it('should return licence if no additional conditions', () => {
      const licence = { licenceConditions: {} }

      return expect(service.populateLicenceWithConditions(licence)).to.eql({
        licenceConditions: {},
      })
    })

    it('should return licence with additional conditions', () => {
      const licence = {
        licenceConditions: {
          additional: { ATTENDDEPENDENCY: { appointmentDate: '12/03/1985' } },
          conditionsSummary: { additionalConditionsJustification: 'Justification of additional conditions' },
        },
      }

      return expect(service.populateLicenceWithConditions(licence)).to.eql({
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

    it('should return licence with bespoke conditions', () => {
      const licence = {
        licenceConditions: {
          additional: {},
          bespoke: [{ text: 'approved text', approved: 'Yes' }, { text: 'unapproved text', approved: 'No' }],
        },
      }

      return expect(service.populateLicenceWithConditions(licence)).to.eql({
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
    it('should return licence with only approved bespoke conditions', () => {
      const licence = {
        licenceConditions: {
          additional: {},
          bespoke: [
            { text: 'approved text', approved: 'Yes' },
            { text: 'unapproved text', approved: 'No' },
            { text: 'unapproved text' },
          ],
        },
      }

      return expect(service.populateLicenceWithApprovedConditions(licence)).to.eql({
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
    it('should combine additional and bespoke conditions', () => {
      expect(
        service.createConditionsObjectForLicence({ additionalConditions: 'NOCONTACTPRISONER' }, [{ text: 'bespoke' }])
      ).to.eql({
        additional: { NOCONTACTPRISONER: {} },
        bespoke: [{ text: 'bespoke' }],
      })
    })

    it('should return an object for each selected item including form data', () => {
      expect(
        service.createConditionsObjectForLicence(
          { additionalConditions: ['NOCONTACTPRISONER', 'NOCONTACTASSOCIATE'], groupsOrOrganisation: 'something' },
          []
        )
      ).to.eql({
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
    it('should add text to licence if selected and has no user input', () => {
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

      expect(output).to.eql(expectedOutput)
    })

    it('should add bespoke conditions to the output in the same format, including generated IDs', () => {
      const rawLicence = {
        licenceConditions: {
          additional: { 1: {} },
          bespoke: [{ text: 'bespoke1', approved: 'Yes' }, { text: 'bespoke2', approved: 'No' }],
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

      expect(output).to.eql(expectedOutput)
    })

    it('should return object for view containing condition sections', () => {
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

      expect(output).to.eql(expectedOutput)
    })

    it('should replace placeholder text for dependency appointment conditions for view', () => {
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

      expect(output).to.eql(expectedOutput)
    })

    it('should replace placeholder text for sample appointment conditions for view', () => {
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

      expect(output).to.eql(expectedOutput)
    })

    it('should replace placeholder text for drug testing appointment conditions for view', () => {
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

      expect(output).to.eql(expectedOutput)
    })

    it('should join all fields and separators for multi field conditions when some missing', () => {
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

      expect(output).to.eql(expectedOutput)
    })

    it('should replace placeholder text when multiple items for view', () => {
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

      expect(output).to.eql(expectedOutput)
    })

    it('should replace placeholder text when multiple items in wrong order for view', () => {
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

      expect(output).to.eql(expectedOutput)
    })

    it('should replace placeholder text when multiple conditions for view', () => {
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

      expect(output).to.eql(expectedOutput)
    })

    context('When there are errors in user input', () => {
      it('should return object for view containing input errors', () => {
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

        expect(output).to.eql(expectedOutput)
      })

      it('should replace placeholder text for dependency appointment conditions with errors', () => {
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

        expect(output).to.eql(expectedOutput)
      })

      it('should replace placeholder text for sample appointment conditions with errors', () => {
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

        expect(output).to.eql(expectedOutput)
      })

      it('should replace placeholder text for drug testing appointment conditions with errors', () => {
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

        expect(output).to.eql(expectedOutput)
      })
    })

    describe('NO_UNSUPERVISED_CONTACT', () => {
      const service2019 = createConditionsService({ use2019Conditions: true })

      it('should do nothing with last two inputs if social service dept !== yes', () => {
        const rawLicence = {
          licenceConditions: {
            additional: {
              NO_UNSUPERVISED_CONTACT: {
                do_not_unsupervised_contact: 'women',
                do_not_unsupervised_social_services_dept: 'No',
                do_not_unsupervised_social_services_dept_name: '',
              },
            },
            bespoke: [],
          },
        }
        const selectedConditions = [
          getAdditionalConditionsConfig(true).find(cond => cond.id === 'NO_UNSUPERVISED_CONTACT'),
        ]
        const errors = {}

        expect(
          service2019.populateAdditionalConditionsAsObject(rawLicence, selectedConditions, errors).licenceConditions[0]
            .content
        ).to.eql([
          {
            text: 'Do not have unsupervised contact with ',
          },
          {
            variable: 'women',
          },
          {
            text: ' unless it’s approved by your probation officer ',
          },
          {
            variable: null,
          },
          {
            text:
              '.<br /><br />(This does not apply where the contact is not on purpose and could not be reasonably avoided during daily life).',
          },
          {
            variable: undefined,
          },
        ])
      })

      it('should combine last two variables if dept === yes', () => {
        const rawLicence = {
          licenceConditions: {
            additional: {
              NO_UNSUPERVISED_CONTACT: {
                do_not_unsupervised_contact: 'women',
                do_not_unsupervised_social_services_dept: 'yes',
                do_not_unsupervised_social_services_dept_name: 'some department name',
              },
            },
            bespoke: [],
          },
        }
        const selectedConditions = [
          getAdditionalConditionsConfig(true).find(cond => cond.id === 'NO_UNSUPERVISED_CONTACT'),
        ]
        const errors = {}

        expect(
          service2019.populateAdditionalConditionsAsObject(rawLicence, selectedConditions, errors).licenceConditions[0]
            .content
        ).to.eql([
          {
            text: 'Do not have unsupervised contact with ',
          },
          {
            variable: 'women',
          },
          {
            text: ' unless it’s approved by your probation officer ',
          },
          {
            variable: 'and/or some department name',
          },
          {
            text:
              '.<br /><br />(This does not apply where the contact is not on purpose and could not be reasonably avoided during daily life).',
          },
          {
            variable: undefined,
          },
        ])
      })

      it('should incorporate errors', () => {
        const rawLicence = {
          licenceConditions: {
            additional: {
              NO_UNSUPERVISED_CONTACT: {
                do_not_unsupervised_contact: 'women',
                do_not_unsupervised_social_services_dept: 'yes',
                do_not_unsupervised_social_services_dept_name: '',
              },
            },
            bespoke: [],
          },
        }
        const selectedConditions = [
          getAdditionalConditionsConfig(true).find(cond => cond.id === 'NO_UNSUPERVISED_CONTACT'),
        ]
        const errors = { NO_UNSUPERVISED_CONTACT: { do_not_unsupervised_social_services_dept_name: 'MASSIVE ERROR' } }

        expect(
          service2019.populateAdditionalConditionsAsObject(rawLicence, selectedConditions, errors).licenceConditions[0]
            .content
        ).to.eql([
          {
            text: 'Do not have unsupervised contact with ',
          },
          {
            variable: 'women',
          },
          {
            text: ' unless it’s approved by your probation officer ',
          },
          {
            error: '[MASSIVE ERROR]',
          },
          {
            text:
              '.<br /><br />(This does not apply where the contact is not on purpose and could not be reasonably avoided during daily life).',
          },
          {
            variable: undefined,
          },
        ])
      })
    })

    describe('DO_NOT_CONTACT_VICTIM', () => {
      const service2019 = createConditionsService({ use2019Conditions: true })
      const selectedConditions = [getAdditionalConditionsConfig(true).find(cond => cond.id === 'DO_NOT_CONTACT_VICTIM')]

      it('should do nothing with last two inputs if social service dept !== yes', () => {
        const rawLicence = {
          licenceConditions: {
            additional: {
              DO_NOT_CONTACT_VICTIM: {
                do_not_contact_victim_name: 'a',
                do_not_contact_victim_social_services_dept: 'No',
                do_not_contact_victim_social_services_dept_name: '',
              },
            },
            bespoke: [],
          },
        }

        const errors = {}

        expect(
          service2019.populateAdditionalConditionsAsObject(rawLicence, selectedConditions, errors).licenceConditions[0]
            .content
        ).to.eql([
          {
            text: 'Do not approach or communicate with ',
          },
          {
            variable: 'a',
          },
          {
            text: ' unless it’s approved by your probation officer ',
          },
          {
            variable: null,
          },
          {
            text: '.',
          },
          {
            variable: undefined,
          },
        ])
      })

      it('should combine last two variables if dept === yes', () => {
        const rawLicence = {
          licenceConditions: {
            additional: {
              DO_NOT_CONTACT_VICTIM: {
                do_not_contact_victim_name: 'a',
                do_not_contact_victim_social_services_dept: 'yes',
                do_not_contact_victim_social_services_dept_name: 'some department name',
              },
            },
            bespoke: [],
          },
        }

        const errors = {}

        expect(
          service2019.populateAdditionalConditionsAsObject(rawLicence, selectedConditions, errors).licenceConditions[0]
            .content
        ).to.eql([
          {
            text: 'Do not approach or communicate with ',
          },
          {
            variable: 'a',
          },
          {
            text: ' unless it’s approved by your probation officer ',
          },
          {
            variable: 'and/or some department name',
          },
          {
            text: '.',
          },
          {
            variable: undefined,
          },
        ])
      })

      it('should incorporate errors', () => {
        const rawLicence = {
          licenceConditions: {
            additional: {
              DO_NOT_CONTACT_VICTIM: {
                do_not_contact_victim_name: 'a',
                do_not_contact_victim_social_services_dept: 'yes',
                do_not_contact_victim_social_services_dept_name: '',
              },
            },
            bespoke: [],
          },
        }

        const errors = { DO_NOT_CONTACT_VICTIM: { do_not_contact_victim_social_services_dept_name: 'MASSIVE ERROR' } }

        expect(
          service2019.populateAdditionalConditionsAsObject(rawLicence, selectedConditions, errors).licenceConditions[0]
            .content
        ).to.eql([
          {
            text: 'Do not approach or communicate with ',
          },
          {
            variable: 'a',
          },
          {
            text: ' unless it’s approved by your probation officer ',
          },
          {
            error: '[MASSIVE ERROR]',
          },
          {
            text: '.',
          },
          {
            variable: undefined,
          },
        ])
      })
    })
  })

  describe('getFullTextForApprovedConditions', () => {
    const standardConditionsText = standardConditions.map(it => it.text.replace(/\.+$/, ''))

    it('should always return standard conditions even for empty licence', () => {
      const licence = {
        licenceConditions: {},
      }

      return expect(service.getFullTextForApprovedConditions(licence)).to.eql({
        standardConditions: standardConditionsText,
        additionalConditions: [],
      })
    })

    it('should return standard conditions only when no additional conditions required', () => {
      const licence = {
        licenceConditions: { standard: { additionalConditionsRequired: 'No' } },
      }

      return expect(service.getFullTextForApprovedConditions(licence)).to.eql({
        standardConditions: standardConditionsText,
        additionalConditions: [],
      })
    })

    it('should return additional conditions as text', () => {
      const licence = {
        licenceConditions: {
          additional: { ATTENDDEPENDENCY: { appointmentDate: '12/03/1985' } },
        },
      }

      return expect(service.getFullTextForApprovedConditions(licence)).to.eql({
        standardConditions: standardConditionsText,
        additionalConditions: [
          'Attend  on 12/03/1985 at , as directed, to address your dependency on, or propensity to misuse, a controlled drug',
        ],
      })
    })

    it('should return only approved bespoke conditions', () => {
      const licence = {
        licenceConditions: {
          additional: {},
          bespoke: [
            { text: 'approved text', approved: 'Yes' },
            { text: 'unapproved text', approved: 'No' },
            { text: 'unapproved text' },
          ],
        },
      }

      return expect(service.getFullTextForApprovedConditions(licence)).to.eql({
        standardConditions: standardConditionsText,
        additionalConditions: ['approved text'],
      })
    })
  })
})
