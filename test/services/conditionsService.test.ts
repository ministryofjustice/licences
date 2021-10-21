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
