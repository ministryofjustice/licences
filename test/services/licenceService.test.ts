import moment from 'moment'
import {
  createLicenceService,
  LicenceService,
  adaptFieldConfigToSelectWorkingAddress,
  LicenceRecord,
} from '../../server/services/licenceService'
import * as varyConfig from '../../server/routes/config/vary'
import * as formValidation from '../../server/services/utils/formValidation'
import { LicenceClient } from '../../server/data/licenceClient'
import {
  CaseWithVaryVersion,
  AdditionalConditionsVersion,
  StandardConditionsVersion,
} from '../../server/data/licenceClientTypes'
import { Licence, LicenceStage, Risk, RiskManagement, FinalChecks, Postpone } from '../../server/data/licenceTypes'
import { TaskState } from '../../server/services/config/taskState'
import { riskManagementVersion, curfewAddressReviewVersion, postponeVersion } from '../../server/config'

jest.mock('../../server/services/utils/formValidation')

const LICENCE_SAMPLE: Licence = { eligibility: { excluded: { decision: 'Yes' } } }

describe('licenceService', () => {
  let licenceClient: LicenceClient
  let service: LicenceService

  beforeEach(() => {
    licenceClient = {
      getLicence: (jest.fn() as jest.Mock<Promise<CaseWithVaryVersion>>).mockResolvedValue({
        licence: LICENCE_SAMPLE,
        booking_id: 1,
        stage: undefined,
        version: 2,
        transition_date: moment('2018-05-31 15:23:39').toDate(),
        vary_version: 5,
        additional_conditions_version: 3 as AdditionalConditionsVersion,
        standard_conditions_version: 1 as StandardConditionsVersion,
        deleted_at: null,
        licence_in_cvl: false,
      }),
      getLicenceIncludingSoftDeleted: (jest.fn() as jest.Mock<Promise<CaseWithVaryVersion>>).mockResolvedValue({
        licence: LICENCE_SAMPLE,
        booking_id: 1,
        stage: undefined,
        version: 2,
        transition_date: moment('2018-05-31 15:23:39').toDate(),
        vary_version: 5,
        additional_conditions_version: 3 as AdditionalConditionsVersion,
        standard_conditions_version: 1 as StandardConditionsVersion,
        deleted_at: '2024-05-02 15:00:00',
        licence_in_cvl: false,
      }),
      createLicence: jest.fn() as jest.Mock<Promise<number>>,
      updateSection: jest.fn() as jest.Mock<Promise<void>>,
      updateStage: jest.fn() as jest.Mock<Promise<void>>,
      updateLicence: jest.fn() as jest.Mock<Promise<void>>,
      getApprovedLicenceVersion: jest.fn().mockReturnValue({ version: 2, vary_version: 4 }),
      deleteAll: undefined,
      deleteAllTest: undefined,
      getLicences: undefined,
      getDeliusIds: undefined,
      saveApprovedLicenceVersion: undefined,
      getLicencesInStageBetweenDates: undefined,
      getLicencesInStageBeforeDate: undefined,
      getLicencesInStageWithAddressOrCasLocation: undefined,
      getLicencesInStage: undefined,
      setAdditionalConditionsVersion: jest.fn(),
      setStandardConditionsVersion: jest.fn(),
      softDeleteLicence: jest.fn() as jest.Mock<Promise<void>>,
      setLicenceInCvl: jest.fn(),
    }
    service = createLicenceService(licenceClient)
  })

  describe('getRiskVersion', () => {
    test('defaults to current risk version when not set on licence', () => {
      const licence = {} as Licence

      const version = service.getRiskVersion(licence)

      expect(version).toBe(riskManagementVersion)
    })

    test('reads version 1 when licence and risk management section has been started with old version questions but risk management version 1 not yet assigned', () => {
      const licence = {} as Licence
      licence.risk = {} as Risk
      licence.risk.riskManagement = {} as RiskManagement

      const version = service.getRiskVersion(licence)

      expect(version).toBe('1')
    })

    test('reads risk version from licence when set', () => {
      const licence = {} as Licence
      licence.risk = {} as Risk
      licence.risk.riskManagement = {} as RiskManagement
      licence.risk.riskManagement.version = '1'

      const version = service.getRiskVersion(licence)

      expect(version).toBe('1')
    })
  })

  describe('getCurfewAddressReviewVersion', () => {
    test('return the actual version of the curfewAddressReview if it has been set', () => {
      const licence = { curfew: { curfewAddressReview: { version: '2' } } } as Licence
      const version = service.getCurfewAddressReviewVersion(licence)
      expect(version).toBe('2')
    })
    test('returns the default curfewAddressReview version when not set on licence', () => {
      const licence = {} as Licence
      const version = service.getCurfewAddressReviewVersion(licence)
      expect(version).toBe(curfewAddressReviewVersion)
    })

    test("returns 1 curfewAddressReview's version is falsey", () => {
      const licence = { curfew: { curfewAddressReview: {} } } as Licence
      const version = service.getCurfewAddressReviewVersion(licence)
      expect(version).toBe('1')
    })
  })

  describe('getPostponeVersion', () => {
    test('defaults to current postpone version when not set on licence', () => {
      const licence = {} as Licence

      const version = service.getPostponeVersion(licence)

      expect(version).toBe(postponeVersion)
    })

    test('reads version 1 when licence and postpone section has been started with old version reasons but postpone version 1 not yet assigned', () => {
      const licence = {} as Licence
      licence.finalChecks = {} as FinalChecks
      licence.finalChecks.postpone = {} as Postpone

      const version = service.getPostponeVersion(licence)

      expect(version).toBe('1')
    })

    test('reads postpone version from licence when set', () => {
      const licence = {} as Licence
      licence.finalChecks = {} as FinalChecks
      licence.finalChecks.postpone = {} as Postpone
      licence.finalChecks.postpone.version = '1'

      const version = service.getPostponeVersion(licence)

      expect(version).toBe('1')
    })
  })

  describe('getLicence', () => {
    test('should request licence details from client', async () => {
      await service.getLicence(123)

      expect(licenceClient.getLicence).toHaveBeenCalled()
      expect(licenceClient.getLicence).toHaveBeenCalledWith(123)
    })

    test('should return licence', () => {
      return expect(service.getLicence(123)).resolves.toEqual({
        licence: LICENCE_SAMPLE,
        stage: undefined,
        version: '2.5',
        approvedVersion: '2.4',
        approvedVersionDetails: {
          vary_version: 4,
          version: 2,
        },
        versionDetails: {
          vary_version: 5,
          version: 2,
          additional_conditions_version: 3,
          standard_conditions_version: 1,
        },
        licenceInCvl: false,
      })
    })

    test('should return licence when no approved licence version', () => {
      ;(licenceClient.getApprovedLicenceVersion as jest.Mock<Promise<any>>).mockReturnValue(undefined)

      return expect(service.getLicence(123)).resolves.toEqual({
        licence: LICENCE_SAMPLE,
        stage: undefined,
        version: '2.5',
        approvedVersion: '',
        approvedVersionDetails: {},
        versionDetails: {
          vary_version: 5,
          version: 2,
          additional_conditions_version: 3,
          standard_conditions_version: 1,
        },
        licenceInCvl: false,
      })
    })

    test('should throw if error getting licence', () => {
      ;(licenceClient.getLicence as jest.Mock<Promise<CaseWithVaryVersion>>)
        .mockReset()
        .mockRejectedValue(new Error('dead'))
      return expect(service.getLicence(123)).rejects.toEqual(Error('dead'))
    })
  })

  describe('createLicence', () => {
    test('should create a licence', async () => {
      await service.createLicence({ bookingId: 123, prisonNumber: 'A1234AA', data: LICENCE_SAMPLE })

      expect(licenceClient.createLicence).toHaveBeenCalled()
      expect(licenceClient.createLicence).toHaveBeenCalledWith(123, 'A1234AA', LICENCE_SAMPLE, undefined, 1, 0)
    })

    test('should pass in the stage', async () => {
      await service.createLicence({ bookingId: 123, prisonNumber: 'A1234AA', data: LICENCE_SAMPLE, stage: 'VARY' })

      expect(licenceClient.createLicence).toHaveBeenCalled()
      expect(licenceClient.createLicence).toHaveBeenCalledWith(123, 'A1234AA', LICENCE_SAMPLE, 'VARY', 1, 1)
    })

    test('should pass in vary version as 1 if stage is VARY', async () => {
      await service.createLicence({ bookingId: 123, prisonNumber: 'A1234AA', data: LICENCE_SAMPLE, stage: 'VARY' })

      expect(licenceClient.createLicence).toHaveBeenCalled()
      expect(licenceClient.createLicence).toHaveBeenCalledWith(123, 'A1234AA', LICENCE_SAMPLE, 'VARY', 1, 1)
    })

    test('should pass in vary version as 0 if stage is not VARY', async () => {
      await service.createLicence({ bookingId: 123, prisonNumber: 'A1234AA', data: LICENCE_SAMPLE })

      expect(licenceClient.createLicence).toHaveBeenCalled()
      expect(licenceClient.createLicence).toHaveBeenCalledWith(123, 'A1234AA', LICENCE_SAMPLE, undefined, 1, 0)
    })

    test('should return returned id', () => {
      ;(licenceClient.createLicence as jest.Mock<Promise<number>>).mockResolvedValue(999)

      return expect(service.createLicence({ bookingId: 123, prisonNumber: 'A1234AA' })).resolves.toBe(999)
    })

    test('should throw if error getting licence', () => {
      ;(licenceClient.createLicence as jest.Mock<Promise<number>>).mockRejectedValue(new Error('dead'))
      return expect(service.createLicence({ bookingId: 123, prisonNumber: 'A1234AA' })).rejects.toEqual(Error('dead'))
    })
  })

  describe('updateLicenceConditions', () => {
    let standardLicence

    beforeEach(() => {
      standardLicence = { licence: { a: 'b' } }
    })

    test('should call update section with conditions from the licence client merged with existing', async () => {
      const existingLicence = {
        licence: {
          licenceConditions: { standard: { additionalConditionsRequired: 'Yes' } },
        },
      } as LicenceRecord

      await service.updateLicenceConditions(
        'ab1',
        existingLicence,
        {
          additional: { NOCONTACTPRISONER: {} },
          bespoke: [{ text: 'bespoke' }],
        },
        false
      )

      expect(licenceClient.updateSection).toHaveBeenCalled()
      expect(licenceClient.updateSection).toHaveBeenCalledWith(
        'licenceConditions',
        'ab1',
        {
          standard: { additionalConditionsRequired: 'Yes' },
          additional: { NOCONTACTPRISONER: {} },
          bespoke: [{ text: 'bespoke' }],
        },
        false
      )
    })

    test('should not call update section if no changes have been made', async () => {
      const existingLicence = {
        licence: {
          licenceConditions: {
            standard: { additionalConditionsRequired: 'Yes' },
            additional: { NOCONTACTPRISONER: {} },
            bespoke: [{ text: 'bespoke' }],
          },
        },
      } as LicenceRecord

      await service.updateLicenceConditions('ab1', existingLicence, {
        additional: { NOCONTACTPRISONER: {} },
        bespoke: [{ text: 'bespoke' }],
      })

      expect(licenceClient.updateSection).not.toHaveBeenCalled()
    })

    test('should throw if error updating licence', () => {
      ;(licenceClient.updateSection as jest.Mock<Promise<void>>).mockRejectedValue(Error('dead'))
      return expect(service.updateLicenceConditions(123, standardLicence, {})).rejects.not.toBeNull()
    })

    describe('post approval modifications', () => {
      test('should change stage to MODIFIED_APPROVAL when updates occur', async () => {
        const existingLicence = { stage: 'DECIDED', licence: {} } as LicenceRecord
        await service.updateLicenceConditions('ab1', existingLicence, {
          additional: { NOCONTACTPRISONER: '' },
        })

        expect(licenceClient.updateStage).toHaveBeenCalled()
        expect(licenceClient.updateStage).toHaveBeenCalledWith('ab1', 'MODIFIED_APPROVAL')
      })

      test('should change stage to MODIFIED_APPROVAL when updates occur in MODIFIED stage', async () => {
        const existingLicence = { stage: 'MODIFIED', licence: {} } as LicenceRecord
        await service.updateLicenceConditions('ab1', existingLicence, {
          additional: { NOCONTACTPRISONER: '' },
        })

        expect(licenceClient.updateStage).toHaveBeenCalled()
        expect(licenceClient.updateStage).toHaveBeenCalledWith('ab1', 'MODIFIED_APPROVAL')
      })

      test('should not change stage if not DECIDED', async () => {
        const existingLicence = { stage: 'PROCESSING_RO', licence: {} } as LicenceRecord
        await service.updateLicenceConditions('ab1', existingLicence, {
          additional: { NOCONTACTPRISONER: '' },
        })

        expect(licenceClient.updateStage).not.toHaveBeenCalled()
      })

      test('should not change stage if no changes', async () => {
        const existingLicence = {
          stage: 'PROCESSING_RO',
          licence: { licenceConditions: { additional: { NOCONTACTPRISONER: '' } } },
        } as LicenceRecord
        await service.updateLicenceConditions('ab1', existingLicence, {
          additional: { NOCONTACTPRISONER: '' },
        })

        expect(licenceClient.updateStage).not.toHaveBeenCalled()
      })
    })
  })

  describe('setLicenceCompletionDestination', () => {
    it('should call setLicenceCompletionDestination', () => {
      service.setLicenceCompletionDestination(false, 100)
      expect(licenceClient.setLicenceInCvl).toHaveBeenCalledWith(false, 100)
    })
  })

  describe('deleteLicenceCondition', () => {
    test('should remove additional condition by ID and call update section', async () => {
      const existingLicence = {
        licence: {
          licenceConditions: {
            standard: { additionalConditionsRequired: 'Yes' },
            additional: { 1: {}, 2: {}, 3: {} },
            bespoke: [{ text: 'bespoke' }],
          },
        },
      }

      await service.deleteLicenceCondition('ab1', existingLicence, '2')

      expect(licenceClient.updateSection).toHaveBeenCalled()
      expect(licenceClient.updateSection).toHaveBeenCalledWith('licenceConditions', 'ab1', {
        standard: { additionalConditionsRequired: 'Yes' },
        additional: { 1: {}, 3: {} },
        bespoke: [{ text: 'bespoke' }],
      })
    })

    test('should remove bespoke condition by index when id is "bespoke-index", and call update section', async () => {
      const existingLicence = {
        licence: {
          licenceConditions: {
            standard: { additionalConditionsRequired: 'Yes' },
            additional: { 1: {}, 2: {}, 'bespoke-1': {} },
            bespoke: [{ text: '0' }, { text: '1' }, { text: '2' }],
          },
        },
      }

      await service.deleteLicenceCondition('ab1', existingLicence, 'bespoke-1')

      expect(licenceClient.updateSection).toHaveBeenCalled()
      expect(licenceClient.updateSection).toHaveBeenCalledWith('licenceConditions', 'ab1', {
        standard: { additionalConditionsRequired: 'Yes' },
        additional: { 1: {}, 2: {}, 'bespoke-1': {} },
        bespoke: [{ text: '0' }, { text: '2' }],
      })
    })

    test('should throw if error updating licence', () => {
      ;(licenceClient.getLicence as jest.Mock<Promise<CaseWithVaryVersion>>).mockRejectedValue(new Error('dead'))
      return expect(service.deleteLicenceCondition('ab1', {}, 'bespoke-1')).rejects.not.toBeNull()
    })
  })

  describe('markForHandover', () => {
    test('should call updateStage from the licence client', async () => {
      await service.markForHandover('ab1', 'caToRo')

      expect(licenceClient.updateStage).toHaveBeenCalled()
      expect(licenceClient.updateStage).toHaveBeenCalledWith('ab1', 'PROCESSING_RO')
    })

    test('should change stage according to transition', async () => {
      await service.markForHandover('ab1', 'caToDm')
      expect(licenceClient.updateStage).toHaveBeenCalledWith('ab1', 'APPROVAL')
    })

    test('should return to ELIGIBILITY when RO sends to CA after opt out', async () => {
      await service.markForHandover('ab1', 'roToCaOptedOut')
      expect(licenceClient.updateStage).toHaveBeenCalledWith('ab1', 'ELIGIBILITY')
    })

    test('should return to ELIGIBILITY when RO sends to CA after address rejected', async () => {
      await service.markForHandover('ab1', 'roToCaAddressRejected')
      expect(licenceClient.updateStage).toHaveBeenCalledWith('ab1', 'ELIGIBILITY')
    })

    test('should send to PROCESSING_CA if transition type of dmToCaReturn is passed in', async () => {
      await service.markForHandover('ab1', 'dmToCaReturn')
      expect(licenceClient.updateStage).toHaveBeenCalledWith('ab1', 'PROCESSING_CA')
    })

    test('should throw if error during update status', () => {
      ;(licenceClient.updateStage as jest.Mock<Promise<void>>).mockRejectedValue(new Error('dead'))
      return expect(service.markForHandover(123, 'caToRo')).rejects.toEqual(Error('dead'))
    })

    test('should throw if no matching transition type', () => {
      expect(() => service.markForHandover(123, 'caToBlah')).toThrow(Error)
    })
  })

  describe('removeDecision', () => {
    const licence = {
      licence: {
        approval: {
          release: {
            decision: 'Yes',
          },
          also: 'This',
        },
        somethingElse: 'Yes',
      },
    }

    test('should call updateStage from the licence client', async () => {
      await service.removeDecision(123, licence)

      expect(licenceClient.updateLicence).toHaveBeenCalled()
      expect(licenceClient.updateLicence).toHaveBeenCalledWith(123, { somethingElse: 'Yes' })
    })
  })

  describe('addSplitDateFields', () => {
    test('should add day, month and year fields to split dates', () => {
      const rawData = {
        someDate: '12/03/2019',
        somethingElse: '19/03/2019',
      }
      const formFieldsConfig = [
        { someDate: { splitDate: { day: 'someDay', month: 'someMonth', year: 'someYear' } } },
        { somethingElse: {} },
      ]

      expect(service.addSplitDateFields(rawData, formFieldsConfig)).toEqual({
        someDate: '12/03/2019',
        someDay: '12',
        someMonth: '03',
        someYear: '2019',
        somethingElse: '19/03/2019',
      })
    })

    test('should return as is if date is invalid', () => {
      const rawData = {
        someDate: '43/03/2019',
        somethingElse: '19/03/2019',
      }
      const formFieldsConfig = [
        { someDate: { splitDate: { day: 'someDay', month: 'someMonth', year: 'someYear' } } },
        { somethingElse: {} },
      ]

      expect(service.addSplitDateFields(rawData, formFieldsConfig)).toEqual({
        someDate: '43/03/2019',
        somethingElse: '19/03/2019',
      })
    })

    test('should return as is if date field is missing', () => {
      const rawData = {
        somethingElse: '19/03/2019',
      }
      const formFieldsConfig = [
        { someDate: { splitDate: { day: 'someDay', month: 'someMonth', year: 'someYear' } } },
        { somethingElse: {} },
      ]

      expect(service.addSplitDateFields(rawData, formFieldsConfig)).toEqual({
        somethingElse: '19/03/2019',
      })
    })

    test('should return as is if no splitDate config', () => {
      const rawData = {
        someDate: '43/03/2019',
        somethingElse: '19/03/2019',
      }
      const formFieldsConfig = [{ someDate: {} }, { somethingElse: {} }]

      expect(service.addSplitDateFields(rawData, formFieldsConfig)).toEqual({
        someDate: '43/03/2019',
        somethingElse: '19/03/2019',
      })
    })
  })

  describe('update', () => {
    const bookingId = 'ab1'

    const baseLicence = {
      section1: '',
      section2: '',
      section3: {},
      section4: {
        form1: {},
        form2: { answer: 'answer' },
      },
    }

    describe('When there are dependents', () => {
      const licence = {
        ...baseLicence,
        section4: {
          ...baseLicence.section4,
          form3: {
            decision: '',
            followUp1: '',
            followUp2: '',
          },
        },
      }

      const fieldMap = [
        { decision: {} },
        {
          followUp1: {
            dependentOn: 'decision',
            predicate: 'Yes',
          },
        },
        {
          followUp2: {
            dependentOn: 'decision',
            predicate: 'Yes',
          },
        },
      ]

      test('should store dependents if predicate matches', async () => {
        const userInput = {
          decision: 'Yes',
          followUp1: 'County',
          followUp2: 'Town',
        }

        const licenceSection = 'section4'
        const formName = 'form3'

        const originalLicence = { booking_id: bookingId, licence }
        const output = await service.update({
          bookingId,
          originalLicence,
          config: { fields: fieldMap },
          userInput,
          licenceSection,
          formName,
        })

        expect(output).toEqual({
          ...licence,
          section4: {
            ...licence.section4,
            form3: {
              decision: 'Yes',
              followUp1: 'County',
              followUp2: 'Town',
            },
          },
        })
      })

      test('should remove dependents if predicate does not match', async () => {
        const userInput = {
          decision: 'No',
          followUp1: 'County',
          followUp2: 'Town',
        }

        const licenceSection = 'section4'
        const formName = 'form3'

        const originalLicence = { booking_id: bookingId, licence }
        const output = await service.update({
          bookingId,
          originalLicence,
          config: { fields: fieldMap },
          userInput,
          licenceSection,
          formName,
        })

        expect(output).toEqual({
          ...licence,
          section4: {
            ...licence.section4,
            form3: {
              decision: 'No',
            },
          },
        })
      })
    })

    describe('When there are no dependents', () => {
      const licence = {
        ...baseLicence,
        section4: {
          ...baseLicence.section4,
          form3: {
            decision: '',
            followUp1: '',
            followUp2: '',
          },
        },
      }

      const fieldMap = [{ decision: {} }, { followUp1: {} }, { followUp2: {} }]

      test('should store everything', async () => {
        const userInput = {
          decision: 'Yes',
          followUp1: 'County',
          followUp2: 'Town',
        }

        const licenceSection = 'section4'
        const formName = 'form3'

        const originalLicence = { booking_id: bookingId, licence }
        const output = await service.update({
          bookingId,
          originalLicence,
          config: { fields: fieldMap },
          userInput,
          licenceSection,
          formName,
        })

        expect(output).toEqual({
          ...licence,
          section4: {
            ...licence.section4,
            form3: {
              decision: 'Yes',
              followUp1: 'County',
              followUp2: 'Town',
            },
          },
        })
      })
    })
    test('should call updateLicence and pass in the licence', async () => {
      const licence = {
        ...baseLicence,
        section4: {
          ...baseLicence.section4,
          form3: {
            decision: '',
            followUp1: '',
            followUp2: '',
          },
        },
      }

      const fieldMap = [{ decision: {} }, { followUp1: {} }, { followUp2: {} }]

      const userInput = {
        decision: 'Yes',
        followUp1: 'County',
        followUp2: 'Town',
      }

      const licenceSection = 'section4'
      const formName = 'form3'

      const originalLicence = { booking_id: bookingId, licence }
      await service.update({
        bookingId,
        originalLicence,
        config: { fields: fieldMap },
        userInput,
        licenceSection,
        formName,
        postRelease: true,
      })

      const expectedLicence = {
        ...licence,
        section4: {
          ...licence.section4,
          form3: {
            decision: 'Yes',
            followUp1: 'County',
            followUp2: 'Town',
          },
        },
      }
      expect(licenceClient.updateLicence).toHaveBeenCalled()
      expect(licenceClient.updateLicence).toHaveBeenCalledWith('ab1', expectedLicence, true)
    })

    test('should not call updateLicence if there are no changes', async () => {
      const fieldMap = [{ answer: {} }]
      const userInput = { answer: 'answer' }
      const licenceSection = 'section4'
      const formName = 'form2'

      const originalLicence = { booking_id: bookingId, licence: baseLicence }
      const output = await service.update({
        bookingId,
        originalLicence,
        config: { fields: fieldMap },
        userInput,
        licenceSection,
        formName,
      })

      expect(licenceClient.updateLicence).not.toHaveBeenCalled()
      expect(output).toEqual(baseLicence)
    })

    test('should add new form to the licence', async () => {
      const licence = {
        ...baseLicence,
        section4: {
          ...baseLicence.section4,
        },
      }

      const fieldMap = [{ decision: {} }, { followUp1: {} }, { followUp2: {} }]

      const userInput = {
        decision: 'Yes',
        followUp1: 'County',
        followUp2: 'Town',
      }

      const licenceSection = 'section4'
      const formName = 'form3'

      const originalLicence = { booking_id: bookingId, licence }
      const output = await service.update({
        bookingId,
        originalLicence,
        config: { fields: fieldMap },
        userInput,
        licenceSection,
        formName,
      })

      const expectedLicence = {
        ...licence,
        section4: {
          ...licence.section4,
          form3: {
            decision: 'Yes',
            followUp1: 'County',
            followUp2: 'Town',
          },
        },
      }
      expect(output).toEqual(expectedLicence)
    })

    test('should add new section to the licence', async () => {
      const licence = {
        ...baseLicence,
        section4: {
          ...baseLicence.section4,
        },
      }

      const fieldMap = [{ decision: {} }, { followUp1: {} }, { followUp2: {} }]

      const userInput = {
        decision: 'Yes',
        followUp1: 'County',
        followUp2: 'Town',
      }

      const licenceSection = 'section5'
      const formName = 'form3'

      const originalLicence = { booking_id: bookingId, licence }
      const output = await service.update({
        bookingId,
        originalLicence,
        config: { fields: fieldMap },
        userInput,
        licenceSection,
        formName,
      })

      const expectedLicence = {
        ...licence,
        section5: {
          form3: {
            decision: 'Yes',
            followUp1: 'County',
            followUp2: 'Town',
          },
        },
      }
      expect(output).toEqual(expectedLicence)
    })

    test('should recurse if a field has inner contents', async () => {
      const licence = {
        ...baseLicence,
        section4: {
          ...baseLicence.section4,
        },
      }

      const fieldMap = [
        { decision: {} },
        {
          outer: {
            contains: [
              { innerQuestion: {} },
              { innerQuestion2: {} },
              { dependentAnswer: { dependentOn: 'innerQuestion2', predicate: 'Yes' } },
              {
                innerOuter: {
                  contains: [{ innerInner: {} }],
                },
              },
            ],
          },
        },
        { followUp2: {} },
      ]

      const userInput = {
        decision: 'Yes',
        outer: {
          innerQuestion: 'InnerAnswer',
          innerQuestion2: 'Yes',
          unwantedAnswer: 'unwanted',
          dependentAnswer: 'depAnswer',
          innerOuter: {
            innerInner: 'here',
            innerUnwanted: 'here2',
          },
        },
        followUp2: 'Town',
      }

      const licenceSection = 'section5'
      const formName = 'form3'

      const originalLicence = { booking_id: bookingId, licence }
      const output = await service.update({
        bookingId,
        originalLicence,
        config: { fields: fieldMap },
        userInput,
        licenceSection,
        formName,
      })

      const expectedLicence = {
        ...licence,
        section5: {
          form3: {
            decision: 'Yes',
            outer: {
              innerQuestion: 'InnerAnswer',
              innerQuestion2: 'Yes',
              dependentAnswer: 'depAnswer',
              innerOuter: {
                innerInner: 'here',
              },
            },
            followUp2: 'Town',
          },
        },
      }
      expect(output).toEqual(expectedLicence)
    })

    test('should recurse through list items', async () => {
      const licence = {
        ...baseLicence,
        section4: {
          ...baseLicence.section4,
        },
      }

      const fieldMap = [
        { decision: {} },
        {
          innerObject: {
            isList: true,
            contains: [
              { innerQuestion: {} },
              { innerQuestion2: {} },
              { dependentAnswer: { dependentOn: 'innerQuestion2', predicate: 'Yes' } },
            ],
          },
        },
        { followUp2: {} },
      ]

      const userInput = {
        decision: 'Yes',
        innerObject: [
          {
            innerQuestion: 'InnerAnswer',
            innerQuestion2: 'No',
          },
          {
            innerQuestion: 'InnerAnswer',
            innerQuestion2: 'Yes',
            unwantedAnswer: 'unwanted',
            dependentAnswer: 'depAnswer',
          },
        ],
        followUp2: 'Town',
      }

      const licenceSection = 'section5'
      const formName = 'form3'

      const originalLicence = { booking_id: bookingId, licence }
      const output = await service.update({
        bookingId,
        originalLicence,
        config: { fields: fieldMap },
        userInput,
        licenceSection,
        formName,
      })

      const expectedLicence = {
        ...licence,
        section5: {
          form3: {
            decision: 'Yes',
            innerObject: [
              {
                innerQuestion: 'InnerAnswer',
                innerQuestion2: 'No',
              },
              {
                innerQuestion: 'InnerAnswer',
                innerQuestion2: 'Yes',
                dependentAnswer: 'depAnswer',
              },
            ],
            followUp2: 'Town',
          },
        },
      }
      expect(output).toEqual(expectedLicence)
    })

    test('should filter out empty list items', async () => {
      const licence = {
        ...baseLicence,
        section4: {
          ...baseLicence.section4,
        },
      }

      const fieldMap = [
        { decision: {} },
        {
          innerObject: {
            isList: true,
            contains: [{ innerQuestion: {} }, { innerQuestion2: {} }],
          },
        },
        { followUp2: {} },
      ]

      const userInput = {
        decision: 'Yes',
        innerObject: [
          {
            innerQuestion: 'InnerAnswer',
            innerQuestion2: 'No',
          },
          {
            innerQuestion: 'InnerAnswer2',
            innerQuestion2: 'Yes',
          },
          {
            innerQuestion: '',
            innerQuestion2: '',
          },
        ],
        followUp2: 'Town',
      }

      const licenceSection = 'section5'
      const formName = 'form3'

      const originalLicence = { booking_id: bookingId, licence }
      const output = await service.update({
        bookingId,
        originalLicence,
        config: { fields: fieldMap },
        userInput,
        licenceSection,
        formName,
      })

      const expectedLicence = {
        ...licence,
        section5: {
          form3: {
            decision: 'Yes',
            innerObject: [
              {
                innerQuestion: 'InnerAnswer',
                innerQuestion2: 'No',
              },
              {
                innerQuestion: 'InnerAnswer2',
                innerQuestion2: 'Yes',
              },
            ],
            followUp2: 'Town',
          },
        },
      }
      expect(output).toEqual(expectedLicence)
    })

    test('should filter out empty list items with recursion', async () => {
      const licence = {
        ...baseLicence,
        section4: {
          ...baseLicence.section4,
        },
      }

      const fieldMap = [
        { decision: {} },
        {
          listItem: {
            isList: true,
            contains: [
              { innerQuestion: {} },
              {
                innerQuestion2: {
                  contains: [{ innerInner: {} }],
                },
              },
            ],
          },
        },
        { followUp2: {} },
      ]

      const userInput = {
        decision: 'Yes',
        listItem: [
          {
            innerQuestion: 'InnerAnswer',
            innerQuestion2: {
              innerInner: 'innerInner',
            },
          },
          {
            innerQuestion: 'InnerAnswer2',
            innerQuestion2: {
              innerInner: 'innerInner',
            },
          },
          {
            innerQuestion: '',
            innerQuestion2: {
              innerInner: '',
            },
          },
        ],
        followUp2: 'Town',
      }

      const licenceSection = 'section5'
      const formName = 'form3'

      const originalLicence = { booking_id: bookingId, licence }
      const output = await service.update({
        bookingId,
        originalLicence,
        config: { fields: fieldMap },
        userInput,
        licenceSection,
        formName,
      })

      const expectedLicence = {
        ...licence,
        section5: {
          form3: {
            decision: 'Yes',
            listItem: [
              {
                innerQuestion: 'InnerAnswer',
                innerQuestion2: {
                  innerInner: 'innerInner',
                },
              },
              {
                innerQuestion: 'InnerAnswer2',
                innerQuestion2: {
                  innerInner: 'innerInner',
                },
              },
            ],
            followUp2: 'Town',
          },
        },
      }
      expect(output).toEqual(expectedLicence)
    })

    test('should piece together split dates', async () => {
      const fieldMap = [{ someDate: { splitDate: { day: 'someDay', month: 'someMonth', year: 'someYear' } } }]

      const userInput = {
        someDay: '12',
        someMonth: '03',
        someYear: '1985',
      }

      const licenceSection = 'section5'
      const formName = 'form3'

      const originalLicence = { booking_id: bookingId, licence: baseLicence }
      const output = await service.update({
        bookingId,
        originalLicence,
        config: { fields: fieldMap },
        userInput,
        licenceSection,
        formName,
      })

      const expectedLicence = {
        ...baseLicence,
        section5: {
          form3: {
            someDate: '12/03/1985',
          },
        },
      }
      expect(output).toEqual(expectedLicence)
    })

    describe('modificationRequiresApproval', () => {
      const licence = {
        ...baseLicence,
        section4: {
          ...baseLicence.section4,
          form3: {
            decision: '',
          },
        },
      }

      const fieldMap = [{ decision: {} }]

      const licenceSection = 'section4'
      const formName = 'form3'
      const userInput = {
        decision: 'Yes',
      }

      test('should update stage to MODIFIED if modificationRequiresApproval = true is not in config', async () => {
        const originalLicence = { booking_id: bookingId, stage: 'DECIDED', licence }
        await service.update({
          bookingId,
          originalLicence,
          config: { fields: fieldMap },
          userInput,
          licenceSection,
          formName,
        })

        expect(licenceClient.updateStage).toHaveBeenCalled()
        expect(licenceClient.updateStage).toHaveBeenCalledWith(bookingId, 'MODIFIED')
      })

      test('should not update stage to MODIFIED if noModify is set in config', async () => {
        const originalLicence = { booking_id: bookingId, stage: 'DECIDED', licence }
        const config = {
          fields: fieldMap,
          noModify: true,
        }
        await service.update({ bookingId, originalLicence, config, userInput, licenceSection, formName })

        expect(licenceClient.updateStage).not.toHaveBeenCalled()
      })

      test('should not update stage to MODIFIED if in MODIFIED_APPROVAL', async () => {
        const originalLicence = { booking_id: bookingId, stage: 'MODIFIED_APPROVAL', licence }
        await service.update({
          bookingId,
          originalLicence,
          config: { fields: fieldMap },
          userInput,
          licenceSection,
          formName,
        })

        expect(licenceClient.updateStage).not.toHaveBeenCalled()
      })

      test('should not update stage if in config', async () => {
        const originalLicence = { booking_id: bookingId, stage: 'DECIDED', licence }
        const config = {
          fields: fieldMap,
          modificationRequiresApproval: true,
        }
        await service.update({ bookingId, originalLicence, config, userInput, licenceSection, formName })

        expect(licenceClient.updateStage).toHaveBeenCalled()
        expect(licenceClient.updateStage).toHaveBeenCalledWith(bookingId, 'MODIFIED_APPROVAL')
      })

      test('should not update stage if no change', async () => {
        const originalLicence = { booking_id: bookingId, stage: 'DECIDED', licence }
        const config = {
          fields: fieldMap,
          modificationRequiresApproval: true,
        }
        const bespokeUserInput = {
          decision: '',
        }
        await service.update({
          bookingId,
          originalLicence,
          config,
          userInput: bespokeUserInput,
          licenceSection,
          formName,
        })

        expect(licenceClient.updateStage).not.toHaveBeenCalled()
      })

      test('should not update stage if not in DECIDED state', async () => {
        const originalLicence = { booking_id: bookingId, stage: 'PROCESSING_RO', licence }
        const config = {
          fields: fieldMap,
          modificationRequiresApproval: true,
        }
        const bespokeUserInput = {
          decision: '',
        }
        await service.update({
          bookingId,
          originalLicence,
          config,
          userInput: bespokeUserInput,
          licenceSection,
          formName,
        })

        expect(licenceClient.updateStage).not.toHaveBeenCalled()
      })
    })
  })

  describe('rejectBass', () => {
    const bassRequest = {
      bassRequested: 1,
      proposedTown: 1,
      proposedCounty: 1,
    }

    const bassAreaCheck = {
      bassAreaSuitable: 'No',
      bassAreaReason: '1',
    }

    const baseLicence = {
      stage: 'ELIGIBILITY',
      licence: {
        bassReferral: {
          bassRequest,
          bassAreaCheck,
        },
      },
    }

    test('should move bassReferral into a rejection list', async () => {
      await service.rejectBass(baseLicence.licence, 123, 'Yes', 'Reason')

      const expectedOutput = {
        bassReferral: {
          bassRequest: {
            bassRequested: 'Yes',
          },
        },
        bassRejections: [
          {
            bassRequest,
            bassAreaCheck,
            rejectionReason: 'Reason',
          },
        ],
      }

      expect(licenceClient.updateLicence).toHaveBeenCalledWith(123, expectedOutput)
    })

    test('should set bassReferral to empty with bassRequested value', async () => {
      await service.rejectBass(baseLicence.licence, 123, 'value to set', 'Reason')

      const expectedOutput = {
        bassReferral: {
          bassRequest: {
            bassRequested: 'value to set',
          },
        },
        bassRejections: [
          {
            bassRequest,
            bassAreaCheck,
            rejectionReason: 'Reason',
          },
        ],
      }

      expect(licenceClient.updateLicence).toHaveBeenCalledWith(123, expectedOutput)
    })

    test('should move bassReferral to the end of existing rejection list', async () => {
      const bespokeLicence = {
        stage: 'ELIGIBILITY',
        licence: {
          bassReferral: {
            bassRequest,
            bassAreaCheck,
          },
          bassRejections: [{ first: 'rejection' }],
        },
      }

      await service.rejectBass(bespokeLicence.licence, 123, 'Yes', 'Reason')

      const expectedOutput = {
        bassReferral: {
          bassRequest: {
            bassRequested: 'Yes',
          },
        },
        bassRejections: [
          { first: 'rejection' },
          {
            bassRequest,
            bassAreaCheck,
            rejectionReason: 'Reason',
          },
        ],
      }

      expect(licenceClient.updateLicence).toHaveBeenCalledWith(123, expectedOutput)
    })

    test('should not update the saved licence if there is no bassReferral to reject', async () => {
      const licence = {}

      await service.rejectBass(licence, 123, 'Yes', 'Reason')

      expect(licenceClient.updateLicence).not.toHaveBeenCalled()
    })
  })

  describe('withdrawBass', () => {
    const bassRequest = {
      bassRequested: 1,
      proposedTown: 1,
      proposedCounty: 1,
    }

    const bassAreaCheck = {
      bassAreaSuitable: 'No',
      bassAreaReason: '1',
    }

    const baseLicence = {
      stage: 'ELIGIBILITY',
      licence: {
        bassReferral: {
          bassRequest,
          bassAreaCheck,
        },
      },
    }

    test('should mark bassReferral as withdrawn and move into a rejection list', async () => {
      await service.withdrawBass(baseLicence.licence, 123, 'type of withdraw')

      const expectedOutput = {
        bassReferral: {
          bassRequest: {
            bassRequested: 'Yes',
          },
        },
        bassRejections: [
          {
            bassRequest,
            bassAreaCheck,
            withdrawal: 'type of withdraw',
          },
        ],
      }

      expect(licenceClient.updateLicence).toHaveBeenCalledWith(123, expectedOutput)
    })

    test('should set bassReferral to requested = yes', async () => {
      service.withdrawBass(baseLicence.licence, 123, 'type of withdraw')

      const expectedOutput = {
        bassReferral: {
          bassRequest: {
            bassRequested: 'Yes',
          },
        },
        bassRejections: [
          {
            bassRequest,
            bassAreaCheck,
            withdrawal: 'type of withdraw',
          },
        ],
      }

      expect(licenceClient.updateLicence).toHaveBeenCalledWith(123, expectedOutput)
    })

    test('should move bassWithdrawal to the end of existing rejection list', async () => {
      const currentLicence = {
        stage: 'ELIGIBILITY',
        licence: {
          bassReferral: {
            bassRequest,
            bassAreaCheck,
          },
          bassRejections: [{ first: 'rejection' }],
        },
      }

      service.withdrawBass(currentLicence.licence, 123, 'type of withdraw')

      const expectedOutput = {
        bassReferral: {
          bassRequest: {
            bassRequested: 'Yes',
          },
        },
        bassRejections: [
          { first: 'rejection' },
          {
            bassRequest,
            bassAreaCheck,
            withdrawal: 'type of withdraw',
          },
        ],
      }

      expect(licenceClient.updateLicence).toHaveBeenCalledWith(123, expectedOutput)
    })

    test('should not update the saved licence if there is no bassReferral to withdraw', async () => {
      const licence = {}

      const output = await service.withdrawBass(licence, 123, 'type of withdraw')

      expect(licenceClient.updateLicence).not.toHaveBeenCalled()
      expect(output).toEqual(licence)
    })
  })

  describe('reinstateBass', () => {
    const bassRequest = {
      bassRequested: 1,
      proposedTown: 1,
      proposedCounty: 1,
    }

    const bassAreaCheck = {
      bassAreaSuitable: 'No',
      bassAreaReason: '1',
    }

    const baseLicence = {
      stage: 'ELIGIBILITY',
      licence: {
        bassReferral: {
          bassRequest: {
            something: 'else',
          },
        },
        bassRejections: [
          {
            other: 'record',
          },
          {
            withdrawal: 'reason',
            bassRequest,
            bassAreaCheck,
          },
        ],
      },
    }

    test('should remove last entry from bassRejectons and restore to bassReferral, without the withdrawal field', async () => {
      await service.reinstateBass(baseLicence.licence, 123)

      const expectedOutput = {
        bassReferral: {
          bassRequest,
          bassAreaCheck,
        },
        bassRejections: [
          {
            other: 'record',
          },
        ],
      }

      expect(licenceClient.updateLicence).toHaveBeenCalledWith(123, expectedOutput)
    })

    test('should error when no rejections to reinstate', async () => {
      const noRejections = {
        stage: 'ELIGIBILITY',
        licence: {
          bassReferral: {},
          bassRejections: [],
        },
      }

      expect(() => service.reinstateBass(noRejections.licence, 123)).toThrow(Error)
    })
  })

  describe('reject and reinstate address', () => {
    describe('when risk exists on licence', () => {
      const licence = {
        proposedAddress: {
          curfewAddress: { key: 'value' },
          rejections: [],
        },
        curfew: {
          curfewAddressReview: { rev: 'iew' },
          somethingUninteresting: 'boring',
        },
        risk: {
          riskManagement: {
            planningActions: 'Yes',
            proposedAddressSuitable: 'No',
            unsuitableReason: 'Reasons',
            manageInTheCommunity: 'No',
            manageInTheCommunityNotPossibleReason: 'reasons',
            hasConsideredChecks: 'Yes',
          },
        },
      }

      const rejectedAddressLicence = {
        proposedAddress: {
          rejections: [
            {
              address: {
                key: 'value',
              },
              addressReview: {
                curfewAddressReview: { rev: 'iew' },
              },
              riskManagement: {
                proposedAddressSuitable: 'No',
                unsuitableReason: 'Reasons',
                manageInTheCommunity: 'No',
                manageInTheCommunityNotPossibleReason: 'reasons',
                hasConsideredChecks: 'Yes',
              },
              withdrawalReason: 'consentWithdrawn',
            },
          ],
        },
        curfew: {
          somethingUninteresting: 'boring',
        },
        risk: {
          riskManagement: {
            planningActions: 'Yes',
          },
        },
      }

      describe('reject', () => {
        test('should add proposed address and review to the rejected list', () => {
          service.rejectProposedAddress(licence, '001', 'consentWithdrawn')
          expect(licenceClient.updateLicence).toHaveBeenCalled()
          expect(licenceClient.updateLicence).toHaveBeenCalledWith('001', rejectedAddressLicence)
        })
      })

      describe('reinstate', () => {
        test('should remove from the rejected list and replace in licence structure', async () => {
          const output = await service.reinstateProposedAddress(rejectedAddressLicence, '001')
          expect(licenceClient.updateLicence).toHaveBeenCalled()
          expect(output).toEqual(licence)
        })
      })

      describe('no curfew', () => {
        const licenceNoCurfew = {
          proposedAddress: {
            curfewAddress: { key: 'value' },
            rejections: [],
          },
          risk: {
            riskManagement: {
              planningActions: 'Yes',
              proposedAddressSuitable: 'No',
              unsuitableReason: 'Reasons',
            },
          },
        }

        const rejectedAddressLicenceNoCurfew = {
          proposedAddress: {
            rejections: [
              {
                address: {
                  key: 'value',
                },
                riskManagement: {
                  proposedAddressSuitable: 'No',
                  unsuitableReason: 'Reasons',
                },
                withdrawalReason: 'consentWithdrawn',
              },
            ],
          },
          risk: {
            riskManagement: {
              planningActions: 'Yes',
            },
          },
        }

        test('should add proposed address and review to the rejected list', () => {
          service.rejectProposedAddress(licenceNoCurfew, '001', 'consentWithdrawn')
          expect(licenceClient.updateLicence).toHaveBeenCalled()
          expect(licenceClient.updateLicence).toHaveBeenCalledWith('001', rejectedAddressLicenceNoCurfew)
        })

        test('should remove from the rejected list and replace in licence structure', async () => {
          const output = await service.reinstateProposedAddress(rejectedAddressLicenceNoCurfew, '001')
          expect(licenceClient.updateLicence).toHaveBeenCalled()
          expect(output).toEqual(licenceNoCurfew)
        })
      })
    })

    describe('when risk does not exist on licence', () => {
      const licence = {
        proposedAddress: {
          curfewAddress: { key: 'value' },
          rejections: [],
        },
        curfew: {
          curfewAddressReview: { rev: 'iew' },
          somethingUninteresting: 'boring',
        },
      }

      const rejectedAddressLicence = {
        proposedAddress: {
          rejections: [
            {
              address: {
                key: 'value',
              },
              addressReview: {
                curfewAddressReview: { rev: 'iew' },
              },
              withdrawalReason: 'consentWithdrawn',
            },
          ],
        },
        curfew: {
          somethingUninteresting: 'boring',
        },
      }

      describe('reject', () => {
        test('should handle risk management not being completed', async () => {
          const output = await service.rejectProposedAddress(licence, '001', 'consentWithdrawn')
          expect(licenceClient.updateLicence).toHaveBeenCalled()
          expect(output).toEqual(rejectedAddressLicence)
        })
      })

      describe('reinstate', () => {
        test('should remove from the rejected list and replace in licence structure', async () => {
          const output = await service.reinstateProposedAddress(rejectedAddressLicence, '001')
          expect(licenceClient.updateLicence).toHaveBeenCalled()
          expect(output).toEqual(licence)
        })
      })
    })
  })

  describe('validateFormGroup', () => {
    test('should use correct group when bassReferralNeeded', () => {
      const decisions = {
        bassReferralNeeded: true,
        offenderIsMainOccupier: true,
      }

      service.validateFormGroup({
        licence: {},
        stage: LicenceStage.ELIGIBILITY,
        decisions,
        tasks: {},
        conditionVersion: 1,
      })

      expect(formValidation.validateGroup).toHaveBeenCalled()
      expect(formValidation.validateGroup).toHaveBeenCalledWith({
        licence: {},
        group: 'BASS_REQUEST',
        bespokeConditions: { offenderIsMainOccupier: true },
        conditionVersion: 1,
      })
    })

    test('should use correct group when bassReferralNeeded in processing ro stage', () => {
      const decisions = {
        bassReferralNeeded: true,
        useCvlForLicenceCreation: false,
      }

      service.validateFormGroup({
        licence: {},
        stage: LicenceStage.PROCESSING_RO,
        decisions,
        tasks: {},
        conditionVersion: 1,
      })

      expect(formValidation.validateGroup).toHaveBeenCalled()
      expect(formValidation.validateGroup).toHaveBeenCalledWith({
        licence: {},
        group: 'PROCESSING_RO_BASS_REQUESTED',
        bespokeConditions: { offenderIsMainOccupier: undefined },
        conditionVersion: 1,
      })
    })

    test('should use correct group when bassReferralNeeded and useCvlForLicenceCreationin processing ro stage', () => {
      const decisions = {
        bassReferralNeeded: true,
        useCvlForLicenceCreation: true,
      }

      service.validateFormGroup({
        licence: {},
        stage: LicenceStage.PROCESSING_RO,
        decisions,
        tasks: {},
        conditionVersion: 1,
      })

      expect(formValidation.validateGroup).toHaveBeenCalled()
      expect(formValidation.validateGroup).toHaveBeenCalledWith({
        licence: {},
        group: 'PROCESSING_RO_BASS_REQUESTED_CVL_LICENCE_CREATION',
        bespokeConditions: { offenderIsMainOccupier: undefined },
        conditionVersion: 1,
      })
    })

    test('should use correct group when approvedPremisesRequired', () => {
      const decisions = {
        approvedPremisesRequired: true,
        useCvlForLicenceCreation: false,
      }

      service.validateFormGroup({
        licence: {},
        stage: LicenceStage.PROCESSING_RO,
        decisions,
        tasks: {},
        conditionVersion: 1,
      })

      expect(formValidation.validateGroup).toHaveBeenCalled()
      expect(formValidation.validateGroup).toHaveBeenCalledWith({
        licence: {},
        group: 'PROCESSING_RO_APPROVED_PREMISES',
        bespokeConditions: { offenderIsMainOccupier: undefined },
        conditionVersion: 1,
      })
    })

    test('should use correct group when approvedPremisesRequired and useCvlForLicenceCreation', () => {
      const decisions = {
        approvedPremisesRequired: true,
        useCvlForLicenceCreation: true,
      }

      service.validateFormGroup({
        licence: {},
        stage: LicenceStage.PROCESSING_RO,
        decisions,
        tasks: {},
        conditionVersion: 1,
      })

      expect(formValidation.validateGroup).toHaveBeenCalled()
      expect(formValidation.validateGroup).toHaveBeenCalledWith({
        licence: {},
        group: 'PROCESSING_RO_APPROVED_PREMISES_CVL_LICENCE_CREATION',
        bespokeConditions: { offenderIsMainOccupier: undefined },
        conditionVersion: 1,
      })
    })

    test('should use correct group when not useCvlForLicenceCreation and in processing ro stage', () => {
      const decisions = {
        useCvlForLicenceCreation: false,
      }

      service.validateFormGroup({
        licence: {},
        stage: LicenceStage.PROCESSING_RO,
        decisions,
        tasks: {},
        conditionVersion: 1,
      })

      expect(formValidation.validateGroup).toHaveBeenCalled()
      expect(formValidation.validateGroup).toHaveBeenCalledWith({
        licence: {},
        group: 'PROCESSING_RO',
        bespokeConditions: { offenderIsMainOccupier: undefined },
        conditionVersion: 1,
      })
    })

    test('should use correct group when bassReferralNeeded and useCvlForLicenceCreationin processing ro stage', () => {
      const decisions = {
        useCvlForLicenceCreation: true,
      }

      service.validateFormGroup({
        licence: {},
        stage: LicenceStage.PROCESSING_RO,
        decisions,
        tasks: {},
        conditionVersion: 1,
      })

      expect(formValidation.validateGroup).toHaveBeenCalled()
      expect(formValidation.validateGroup).toHaveBeenCalledWith({
        licence: {},
        group: 'PROCESSING_RO_CVL_LICENCE_CREATION',
        bespokeConditions: { offenderIsMainOccupier: undefined },
        conditionVersion: 1,
      })
    })

    test('should use correct group when new address for review', () => {
      service.validateFormGroup({
        licence: {},
        stage: LicenceStage.ELIGIBILITY,
        decisions: {},
        tasks: { curfewAddressReview: TaskState.UNSTARTED },
        conditionVersion: 1,
      })

      expect(formValidation.validateGroup).toHaveBeenCalled()
      expect(formValidation.validateGroup).toHaveBeenCalledWith({
        licence: {},
        group: 'ELIGIBILITY',
        bespokeConditions: { offenderIsMainOccupier: undefined },
        conditionVersion: 1,
      })
    })
  })

  describe('createLicenceFromFlatInput', () => {
    test('should save the curfew address, reporting address and conditions answer as a licence structure', async () => {
      const details = {
        addressLine1: 'ad1',
        addressLine2: 'ad2',
        addressTown: 'town',
        postCode: 'pc',
        telephone: 'phone',
        reportingAddressLine1: 'rad1',
        reportingAddressLine2: 'rad2',
        reportingAddressTown: 'rtown',
        reportingPostCode: 'rpc',
        reportingTelephone: 'rphone',
        reportingContact: 'rcont',
        additionalConditions: 'y',
      }

      const expectedOutput = {
        proposedAddress: {
          curfewAddress: {
            addressLine1: 'ad1',
            addressLine2: 'ad2',
            addressTown: 'town',
            postCode: 'pc',
            telephone: 'phone',
          },
        },
        reporting: {
          reportingInstructions: {
            name: 'rcont',
            postcode: 'rpc',
            telephone: 'rphone',
            townOrCity: 'rtown',
            buildingAndStreet1: 'rad1',
            buildingAndStreet2: 'rad2',
          },
        },
        licenceConditions: {
          standard: {
            additionalConditionsRequired: 'y',
          },
        },
      }

      await service.createLicenceFromFlatInput(details, 'a', { a: 'b' }, varyConfig.licenceDetails, false)
      expect(licenceClient.updateLicence).toHaveBeenCalled()
      expect(licenceClient.updateLicence).toHaveBeenCalledWith('a', { ...expectedOutput, a: 'b' }, false)
    })

    test('should transform the curfew hours into a licence structure if daySpecificInputs === No', () => {
      const input = {
        allFrom: '19:00',
        allUntil: '07:00',
        mondayFrom: 'gg',
        mondayUntil: 'h',
        tuesdayFrom: 'w',
        tuesdayUntil: 'jyr',
        wednesdayFrom: 'jy',
        wednesdayUntil: 'jsjy',
        thursdayFrom: 's',
        thursdayUntil: 'jryj',
        fridayFrom: 'h',
        fridayUntil: 'jrs',
        saturdayFrom: 'r',
        saturdayUntil: 'jk',
        sundayFrom: 'kt',
        sundayUntil: 'jy',
        daySpecificInputs: 'No',
      }

      const output = {
        curfew: {
          curfewHours: {
            allFrom: '19:00',
            allUntil: '07:00',
            fridayFrom: '19:00',
            mondayFrom: '19:00',
            sundayFrom: '19:00',
            fridayUntil: '07:00',
            mondayUntil: '07:00',
            sundayUntil: '07:00',
            tuesdayFrom: '19:00',
            saturdayFrom: '19:00',
            thursdayFrom: '19:00',
            tuesdayUntil: '07:00',
            saturdayUntil: '07:00',
            thursdayUntil: '07:00',
            wednesdayFrom: '19:00',
            wednesdayUntil: '07:00',
            daySpecificInputs: 'No',
          },
        },
      }

      return expect(service.createLicenceFromFlatInput(input, '1', {}, varyConfig.licenceDetails)).resolves.toEqual(
        output
      )
    })

    test('should transform the curfew hours into a licence structure if daySpecificInputs === Yes', () => {
      const input = {
        allFrom: '19:00',
        allUntil: '07:00',
        mondayFrom: 'gg',
        mondayUntil: 'h',
        tuesdayFrom: 'w',
        tuesdayUntil: 'jyr',
        wednesdayFrom: 'jy',
        wednesdayUntil: 'jsjy',
        thursdayFrom: 's',
        thursdayUntil: 'jryj',
        fridayFrom: 'h',
        fridayUntil: 'jrs',
        saturdayFrom: 'r',
        saturdayUntil: 'jk',
        sundayFrom: 'kt',
        sundayUntil: 'jy',
        daySpecificInputs: 'Yes',
      }

      const output = {
        curfew: {
          curfewHours: {
            allFrom: '19:00',
            allUntil: '07:00',
            mondayFrom: 'gg',
            mondayUntil: 'h',
            tuesdayFrom: 'w',
            tuesdayUntil: 'jyr',
            wednesdayFrom: 'jy',
            wednesdayUntil: 'jsjy',
            thursdayFrom: 's',
            thursdayUntil: 'jryj',
            fridayFrom: 'h',
            fridayUntil: 'jrs',
            saturdayFrom: 'r',
            saturdayUntil: 'jk',
            sundayFrom: 'kt',
            sundayUntil: 'jy',
            daySpecificInputs: 'Yes',
          },
        },
      }

      return expect(service.createLicenceFromFlatInput(input, '1', {}, varyConfig.licenceDetails)).resolves.toEqual(
        output
      )
    })
  })

  describe('adaptFieldConfigToSelectWorkingAddress', () => {
    it('leaves config untouched by default', () => {
      expect(adaptFieldConfigToSelectWorkingAddress({}, varyConfig.licenceDetails.fields)).toEqual(
        varyConfig.licenceDetails.fields
      )
    })

    it('adapts to curfew address approved premises', () => {
      const licence: Licence = {
        proposedAddress: {
          curfewAddress: {
            addressLine1: 'addressLine1',
          },
        },
        curfew: {
          approvedPremises: { required: 'Yes' },
          approvedPremisesAddress: { addressLine1: 'addressLine1' },
        },
      }
      expect(
        adaptFieldConfigToSelectWorkingAddress(licence, varyConfig.licenceDetails.fields)[0].addressLine1
          .licencePosition
      ).toEqual(['curfew', 'approvedPremisesAddress', 'addressLine1'])
    })

    it('adapts to bass address', () => {
      const licence: Licence = {
        proposedAddress: {
          curfewAddress: {
            addressLine1: 'addressLine1',
          },
        },
        curfew: {
          approvedPremises: { required: 'No' },
          approvedPremisesAddress: { addressLine1: 'addressLine1' },
        },
        bassReferral: {
          bassRequest: {
            bassRequested: 'Yes',
          },
          bassOffer: {
            bassAccepted: 'Yes',
          },
          bassAreaCheck: {
            approvedPremisesRequiredYesNo: 'No',
          },
          approvedPremisesAddress: { addressLine1: 'addressLine1' },
        },
      }
      expect(
        adaptFieldConfigToSelectWorkingAddress(licence, varyConfig.licenceDetails.fields)[0].addressLine1
          .licencePosition
      ).toEqual(['bassReferral', 'bassOffer', 'addressLine1'])
    })

    it('adapts to bass address approved premises', () => {
      const licence: Licence = {
        proposedAddress: {
          curfewAddress: {
            addressLine1: 'addressLine1',
          },
        },
        curfew: {
          approvedPremises: { required: 'Yes' },
        },
        bassReferral: {
          bassAreaCheck: {
            approvedPremisesRequiredYesNo: 'Yes',
          },
          approvedPremisesAddress: { addressLine1: 'addressLine1' },
        },
      }
      expect(
        adaptFieldConfigToSelectWorkingAddress(licence, varyConfig.licenceDetails.fields)[0].addressLine1
          .licencePosition
      ).toEqual(['bassReferral', 'approvedPremisesAddress', 'addressLine1'])
    })
  })

  describe('resetLicence', () => {
    it('should call softDeleteLicence', () => {
      service.resetLicence(100)
      expect(licenceClient.softDeleteLicence).toHaveBeenCalledWith(100)
    })
  })

  describe('set conditions version', () => {
    it('should call setAdditionalConditionsVersion', () => {
      service.setAdditionalConditionsVersion(100, 1)
      expect(licenceClient.setAdditionalConditionsVersion).toHaveBeenCalledWith(100, 1)
    })
  })
})
