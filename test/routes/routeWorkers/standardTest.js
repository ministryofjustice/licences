const standard = require('../../../server/routes/routeWorkers/standard')
const { createLicenceServiceStub, createNomisPushServiceStub } = require('../../supertestSetup')

const testLicence = {
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
  },
  redirect: () => {},
}

let licenceService
let nomisPushService

beforeEach(() => {
  licenceService = createLicenceServiceStub()
  nomisPushService = createNomisPushServiceStub()
  licenceService.update.resolves(testLicence)
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
        nomisPushService,
        config,
      })
    }

    describe('pushStatus', () => {
      const bookingId = '123'
      const username = 'testUser'

      it('should not send to nomisPushService if main config off', async () => {
        const nomisPush = {
          status: ['statusProperty'],
          reason: ['reasonProperty'],
          checksFailedStatusValue: 'testStatus',
        }

        const standardRoute = createRoute({ nomisPush, config: { pushToNomis: false } })

        await standardRoute.formPost(req, res, 'testForm', '123', '')
        expect(nomisPushService.pushStatus).not.to.be.calledOnce()
        expect(nomisPushService.pushChecksPassed).not.to.be.calledOnce()
      })

      it('should not send to nomisPushService when validation errors', async () => {
        const nomisPush = {
          status: ['statusProperty'],
          reason: ['reasonProperty'],
          checksFailedStatusValue: 'testStatus',
        }

        licenceService.validateForm.returns(['some errors'])
        const standardRoute = createRoute({ nomisPush, validate: true })

        await standardRoute.formPost(req, res, 'testForm', '123', '')
        expect(nomisPushService.pushStatus).not.to.be.calledOnce()
        expect(nomisPushService.pushChecksPassed).not.to.be.calledOnce()
      })

      it('should not send to nomisPushService if no form config', async () => {
        const standardRoute = createRoute({})

        await standardRoute.formPost(req, res, 'testForm', '123', '')
        expect(nomisPushService.pushStatus).not.to.be.calledOnce()
        expect(nomisPushService.pushChecksPassed).not.to.be.calledOnce()
      })

      it('should send the specified licence fields to nomisPushService', async () => {
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
        expect(nomisPushService.pushStatus).to.be.calledOnce()
        expect(nomisPushService.pushStatus).to.be.calledWith({
          bookingId,
          data: expectedData,
          username,
        })
      })

      it('should send the specified licence fields to nomisPushService when fields are nested', async () => {
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
        expect(nomisPushService.pushStatus).to.be.calledOnce()
        expect(nomisPushService.pushStatus).to.be.calledWith({
          bookingId,
          data: expectedData,
          username,
        })
      })

      it('should send to nomisPushService even if fields are not found', async () => {
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
        expect(nomisPushService.pushStatus).to.be.calledOnce()
        expect(nomisPushService.pushStatus).to.be.calledWith({
          bookingId,
          data: expectedData,
          username,
        })
      })

      it('should not try to access licence data if not specified', async () => {
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
        expect(nomisPushService.pushStatus).to.be.calledOnce()
        expect(nomisPushService.pushStatus).to.be.calledWith({
          bookingId,
          data: expectedData,
          username,
        })
      })

      it('should send checks passed when configured and status matches', async () => {
        const nomisPush = {
          status: ['statusProperty'],
          reason: ['reasonProperty'],
          checksFailedStatusValue: 'testStatus',
        }

        const standardRoute = createRoute({ nomisPush })

        await standardRoute.formPost(req, res, 'testForm', '123', '')
        expect(nomisPushService.pushChecksPassed).to.be.calledOnce()
        expect(nomisPushService.pushChecksPassed).to.be.calledWith({
          bookingId,
          passed: false,
          username,
        })
      })

      it('should not send checks passed when configured and status does not match', async () => {
        const nomisPush = {
          status: ['statusProperty'],
          reason: ['reasonProperty'],
          checksFailedStatusValue: 'not-matched',
        }

        const standardRoute = createRoute({ nomisPush })

        await standardRoute.formPost(req, res, 'testForm', '123', '')
        expect(nomisPushService.pushChecksPassed).not.to.be.calledOnce()
      })

      it('should not send checks passed when not configured', async () => {
        const nomisPush = {
          status: ['statusProperty'],
          reason: ['reasonProperty'],
        }

        const standardRoute = createRoute({ nomisPush })

        await standardRoute.formPost(req, res, 'testForm', '123', '')
        expect(nomisPushService.pushChecksPassed).not.to.be.calledOnce()
      })
    })

    describe('processingCallback', () => {
      it('should invoke the processing callback if one is supplied', async () => {
        const standardRoute = createRoute({})
        const callback = sinon.stub()
        const callbackPost = standardRoute.callbackPost('testForm', callback)

        await callbackPost(req, res)
        expect(callback).to.be.calledOnce()
        expect(callback).to.be.calledWith({ req, bookingId: 123, updatedLicence: testLicence })
      })
    })
  })

  describe('form validation', () => {
    function createRoute({ formConfig }) {
      return standard({
        formConfig,
        licenceService,
        sectionName: 'sectionName',
        nomisPushService,
      })
    }

    const saveSectionInput = { input: 'saveSection' }
    const formInput = { input: 'form' }

    beforeEach(() => {
      licenceService.update.resolves({
        save: { section: saveSectionInput },
        sectionName: { testForm: formInput },
      })
    })

    it('should use the save section for validation if specified', async () => {
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

      expect(licenceService.validateForm).to.be.calledOnce()
      const calledWith = licenceService.validateForm.getCalls()[0].args[0]
      expect(calledWith.formResponse).to.eql(saveSectionInput)
    })

    it('should use the form input for validation if no save section specified', async () => {
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

      expect(licenceService.validateForm).to.be.calledOnce()
      const calledWith = licenceService.validateForm.getCalls()[0].args[0]
      expect(calledWith.formResponse).to.eql(formInput)
    })
  })
})
