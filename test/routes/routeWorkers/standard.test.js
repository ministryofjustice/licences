const standard = require('../../../server/routes/routeWorkers/standard')
const { createLicenceServiceStub, createNomisPushServiceStub } = require('../../mockServices')

const testLicence = {
  id: 1,
  sectionName: { testForm: {} },
  statusProperty: 'testStatus',
  reasonProperty: 'testReason',
  nestedStatusProperty: { subStatus: 'subStatus' },
  nestedReasonProperty: { subReason: { subSubReason: 'subSubReason' } },
}

const req = {
  body: {},
  params: { bookingId: 123 },
  user: {
    username: 'testUser',
  },
  flash: () => {},
}

const res = {
  locals: {
    licence: testLicence,
    licenceStatus: { decisions: {} },
    prisoner: { offenderNo: 'A1234AA' },
  },
  redirect: () => {},
}

const bookingId = '123'
const username = 'testUser'
const offenderNo = 'A1234AA'
const licenceId = 1

let licenceService
let eventService

beforeEach(() => {
  licenceService = createLicenceServiceStub()
  eventService = createNomisPushServiceStub()
  licenceService.update.mockResolvedValue(testLicence)
})

describe('formPost', () => {
  describe('push to nomis', () => {
    function createRoute({ nomisPush, config = { pushToNomis: true }, validate = false }) {
      const formConfig = {
        testForm: {
          nextPath: {},
          validate,
          nomisPush,
        },
        suitability: {
          nextPath: {},
          validate,
        },
      }

      return standard({
        formConfig,
        licenceService,
        sectionName: 'sectionName',
        eventService,
        config,
      })
    }

    describe('pushStatus', () => {
      test('should not send to eventService if main config off', async () => {
        const nomisPush = {
          status: ['statusProperty'],
          reason: ['reasonProperty'],
          checksPassed: { failState: 'testStatus' },
        }

        const standardRoute = createRoute({ nomisPush, config: { pushToNomis: false } })

        await standardRoute.formPost(req, res, 'testForm', '123', '')
        expect(eventService.pushStatus).not.toHaveBeenCalled()
        expect(eventService.pushChecksPassed).not.toHaveBeenCalled()
      })

      test('should not send to eventService when validation errors', async () => {
        const nomisPush = {
          status: ['statusProperty'],
          reason: ['reasonProperty'],
          checksPassed: { failState: 'testStatus' },
        }

        licenceService.validateForm.mockResolvedValue(['some errors'])
        const standardRoute = createRoute({ nomisPush, validate: true })

        await standardRoute.formPost(req, res, 'testForm', '123', '')
        expect(eventService.pushStatus).not.toHaveBeenCalled()
        expect(eventService.pushChecksPassed).not.toHaveBeenCalled()
      })

      test('should not send to eventService if no form config', async () => {
        const standardRoute = createRoute({ nomisPush: null, config: null, validate: null })

        await standardRoute.formPost(req, res, 'testForm', '123', '')
        expect(eventService.pushStatus).not.toHaveBeenCalled()
        expect(eventService.pushChecksPassed).not.toHaveBeenCalled()
      })

      test('should send the specified licence fields to eventService', async () => {
        const nomisPush = {
          status: ['statusProperty'],
          reason: ['reasonProperty'],
        }

        const standardRoute = createRoute({ nomisPush })

        const expectedData = {
          type: 'testForm',
          status: 'testStatus',
          reason: 'testReason',
        }

        await standardRoute.formPost(req, res, 'testForm', '123', '')
        expect(eventService.pushStatus).toHaveBeenCalled()
        expect(eventService.pushStatus).toHaveBeenCalledWith({
          bookingId,
          data: expectedData,
          username,
          offenderNo,
          licenceId,
        })
      })

      test('should send the specified licence fields to eventService when fields are nested', async () => {
        const nomisPush = {
          status: ['nestedStatusProperty', 'subStatus'],
          reason: ['nestedReasonProperty', 'subReason', 'subSubReason'],
        }

        const standardRoute = createRoute({ nomisPush })

        const expectedData = {
          type: 'testForm',
          status: 'subStatus',
          reason: 'subSubReason',
        }

        await standardRoute.formPost(req, res, 'testForm', '123', '')
        expect(eventService.pushStatus).toHaveBeenCalled()
        expect(eventService.pushStatus).toHaveBeenCalledWith({
          bookingId,
          data: expectedData,
          username,
          offenderNo,
          licenceId,
        })
      })

      test('should send to eventService even if fields are not found', async () => {
        const nomisPush = {
          status: ['noSuchProperty'],
          reason: [''],
        }

        const standardRoute = createRoute({ nomisPush })

        const expectedData = {
          type: 'testForm',
          status: undefined,
          reason: undefined,
        }

        await standardRoute.formPost(req, res, 'testForm', '123', '')
        expect(eventService.pushStatus).toHaveBeenCalled()
        expect(eventService.pushStatus).toHaveBeenCalledWith({
          bookingId,
          data: expectedData,
          username,
          offenderNo,
          licenceId,
        })
      })

      test('should not try to access licence data if not specified', async () => {
        const nomisPush = {
          reason: ['reasonProperty'],
        }

        const standardRoute = createRoute({ nomisPush })

        const expectedData = {
          type: 'testForm',
          status: undefined,
          reason: 'testReason',
        }

        await standardRoute.formPost(req, res, 'testForm', '123', '')
        expect(eventService.pushStatus).toHaveBeenCalled()
        expect(eventService.pushStatus).toHaveBeenCalledWith({
          bookingId,
          data: expectedData,
          username,
          offenderNo,
          licenceId,
        })
      })
    })

    describe('push checks passed', () => {
      const examples = [
        { label: 'fail status matches', checksPassed: { failState: 'testStatus' }, result: false },
        { label: 'pass status matches', checksPassed: { passState: 'testStatus' }, result: true },
        {
          label: 'only fail status matches',
          checksPassed: { failState: 'testStatus', passState: 'not-matched' },
          result: false,
        },
        {
          label: 'pass & fail status matches',
          checksPassed: { failState: 'testStatus', passState: 'testStatus' },
          result: true,
        },
      ]

      examples.forEach((example) => {
        test(example.label, async () => {
          const nomisPush = {
            status: ['statusProperty'],
            reason: ['reasonProperty'],
            checksPassed: example.checksPassed,
          }

          const standardRoute = createRoute({ nomisPush })

          await standardRoute.formPost(req, res, 'testForm', '123', '')
          expect(eventService.pushChecksPassed).toHaveBeenCalled()
          expect(eventService.pushChecksPassed).toHaveBeenCalledWith({
            bookingId,
            passed: example.result,
            username,
            offenderNo,
            licenceId,
          })
        })
      })

      test('should not send checks passed when configured and fail status does not match', async () => {
        const nomisPush = {
          status: ['statusProperty'],
          reason: ['reasonProperty'],
          checksPassed: { failState: 'not-matched' },
        }

        const standardRoute = createRoute({ nomisPush })

        await standardRoute.formPost(req, res, 'testForm', '123', '')
        expect(eventService.pushChecksPassed).not.toHaveBeenCalled()
      })

      test('should not send checks passed when configured and neither status matches', async () => {
        const nomisPush = {
          status: ['statusProperty'],
          reason: ['reasonProperty'],
          checksPassed: { failState: 'not-matched', passState: 'not-matched' },
        }

        const standardRoute = createRoute({ nomisPush })

        await standardRoute.formPost(req, res, 'testForm', '123', '')
        expect(eventService.pushChecksPassed).not.toHaveBeenCalled()
      })

      test('should not send checks passed when not configured', async () => {
        const nomisPush = {
          status: ['statusProperty'],
          reason: ['reasonProperty'],
        }

        const standardRoute = createRoute({ nomisPush })

        await standardRoute.formPost(req, res, 'testForm', '123', '')
        expect(eventService.pushChecksPassed).not.toHaveBeenCalled()
      })
    })

    describe('processingCallback', () => {
      test('should invoke the processing callback if one is supplied', async () => {
        const standardRoute = createRoute({ nomisPush: null, config: null, validate: null })
        const callback = jest.fn()
        const callbackPost = standardRoute.callbackPost('testForm', callback)

        await callbackPost(req, res)
        expect(callback).toHaveBeenCalled()
        expect(callback).toHaveBeenCalledWith({ req, res, bookingId: 123, updatedLicence: testLicence })
      })
    })
  })

  describe('form validation', () => {
    function createRoute({ formConfig }) {
      return standard({
        formConfig,
        licenceService,
        sectionName: 'sectionName',
        eventService,
      })
    }

    const saveSectionInput = { input: 'saveSection' }
    const formInput = { input: 'form' }

    beforeEach(() => {
      licenceService.update.mockResolvedValue({
        save: { section: saveSectionInput },
        sectionName: { testForm: formInput },
      })
    })

    test('should use the save section for validation if specified', async () => {
      const formConfig = {
        testForm: {
          validate: true,
          saveSection: ['save', 'section'],
          nextPath: {
            path: 'something',
          },
        },
      }

      const standardRoute = createRoute({ formConfig })
      await standardRoute.formPost(req, res, 'testForm', '123', '')

      expect(licenceService.validateForm).toHaveBeenCalled()
      const calledWith = licenceService.validateForm.mock.calls[0][0]
      expect(calledWith.formResponse).toEqual(saveSectionInput)
    })

    test('should use the form input for validation if no save section specified', async () => {
      const formConfig = {
        testForm: {
          validate: true,
          nextPath: {
            path: 'something',
          },
        },
      }

      const standardRoute = createRoute({ formConfig })
      await standardRoute.formPost(req, res, 'testForm', '123', '')

      expect(licenceService.validateForm).toHaveBeenCalled()
      const calledWith = licenceService.validateForm.mock.calls[0][0]
      expect(calledWith.formResponse).toEqual(formInput)
    })
  })
})
