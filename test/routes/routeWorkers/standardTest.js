const standard = require('../../../server/routes/routeWorkers/standard')
const { createLicenceServiceStub, createNomisPushServiceStub } = require('../../supertestSetup')

describe('formPost', () => {
  describe('push to nomis', () => {
    const testLicence = {
      sectionName: { testForm: {} },
      statusProperty: 'testStatus',
      reasonProperty: 'testReason',
      nestedStatusProperty: { subStatus: 'subStatus' },
      nestedReasonProperty: { subReason: { subSubReason: 'subSubReason' } },
    }

    const req = {
      body: {},
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
      it('should not send to nomisPushService if main config off', async () => {
        const nomisPush = {
          status: ['statusProperty'],
          reason: ['reasonProperty'],
        }

        const standardRoute = createRoute({ nomisPush, config: { pushToNomis: false } })

        await standardRoute.formPost(req, res, 'testForm', '123', '')
        expect(nomisPushService.pushStatus).not.to.be.calledOnce()
      })

      it('should not send to nomisPushService when validation errors', async () => {
        const nomisPush = {
          status: ['statusProperty'],
          reason: ['reasonProperty'],
        }

        licenceService.validateForm.returns(['some errors'])
        const standardRoute = createRoute({ nomisPush, validate: true })

        await standardRoute.formPost(req, res, 'testForm', '123', '')
        expect(nomisPushService.pushStatus).not.to.be.calledOnce()
      })

      it('should not send to nomisPushService if no form config', async () => {
        const standardRoute = createRoute({})

        await standardRoute.formPost(req, res, 'testForm', '123', '')
        expect(nomisPushService.pushStatus).not.to.be.calledOnce()
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
        expect(nomisPushService.pushStatus).to.be.calledWith('123', expectedData, 'testUser')
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
        expect(nomisPushService.pushStatus).to.be.calledWith('123', expectedData, 'testUser')
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
        expect(nomisPushService.pushStatus).to.be.calledWith('123', expectedData, 'testUser')
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
        expect(nomisPushService.pushStatus).to.be.calledWith('123', expectedData, 'testUser')
      })
    })

    describe('pushChecksPassed', () => {
      it('should not send to nomisPushService if main config off', async () => {
        const standardRoute = createRoute({ config: { pushToNomis: false } })

        await standardRoute.formPost(req, res, 'suitability', '123', '')
        expect(nomisPushService.pushChecksPassed).not.to.be.calledOnce()
      })

      it('should not send to nomisPushService when validation errors', async () => {
        licenceService.validateForm.returns(['some errors'])
        const standardRoute = createRoute({ validate: true })

        await standardRoute.formPost(req, res, 'suitability', '123', '')
        expect(nomisPushService.pushChecksPassed).not.to.be.calledOnce()
      })

      const checksFailedExamples = [
        {
          type: 'unsuitable',
          licence: { eligibility: { suitability: { decision: 'Yes' } } },
        },
        {
          type: 'excluded',
          licence: { eligibility: { excluded: { decision: 'Yes' } } },
        },
        {
          type: ' excluded not answered',
          licence: { eligibility: { excluded: {}, suitability: { decision: 'No' } } },
        },
        {
          type: ' suitability not answered',
          licence: { eligibility: { excluded: { decision: 'No' }, suitability: {} } },
        },
      ]

      checksFailedExamples.forEach(example => {
        it(`should NOT send to nomisPushService when  ${example.type}`, async () => {
          licenceService.update.resolves(example.licence)
          const standardRoute = createRoute({})

          await standardRoute.formPost(req, res, 'suitability', '123', '')
          expect(nomisPushService.pushChecksPassed).not.to.be.calledOnce()
        })
      })

      it('should NOT send to nomisPushService when suitable but on different form', async () => {
        const licence = {
          eligibility: {
            excluded: {
              decision: 'No',
            },
            suitability: {
              decision: 'No',
            },
          },
        }
        licenceService.update.resolves(licence)
        const standardRoute = createRoute({})

        await standardRoute.formPost(req, res, 'testForm', '123', '')
        expect(nomisPushService.pushChecksPassed).not.to.be.calledOnce()
      })

      it('should send to nomisPushService when checks passed', async () => {
        const licence = { eligibility: { excluded: { decision: 'No' }, suitability: { decision: 'No' } } }
        licenceService.update.resolves(licence)
        const standardRoute = createRoute({})

        await standardRoute.formPost(req, res, 'suitability', '123', '')
        expect(nomisPushService.pushChecksPassed).to.be.calledOnce()
        expect(nomisPushService.pushChecksPassed).to.be.calledWith('123', 'testUser')
      })
    })
  })
})
