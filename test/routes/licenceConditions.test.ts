import request from 'supertest'
import { mockAudit } from '../mockClients'
import { appSetup, testFormPageGets } from '../supertestSetup'

import {
  createPrisonerServiceStub,
  createLicenceServiceStub,
  createConditionsServiceStub,
  createConditionsServiceFactoryStub,
  createSignInServiceStub,
} from '../mockServices'

import standardRouter from '../../server/routes/routeWorkers/standardRouter'
import createRoute from '../../server/routes/conditions'
import * as formConfig from '../../server/routes/config/licenceConditions'
import NullTokenVerifier from '../../server/authentication/tokenverifier/NullTokenVerifier'
import { CURRENT_CONDITION_VERSION } from '../../server/services/config/conditionsConfig'

describe('/hdc/licenceConditions', () => {
  let conditionsService = createConditionsServiceStub()
  let conditionsServiceFactory = createConditionsServiceFactoryStub()

  beforeEach(() => {
    conditionsService.getStandardConditions.mockReturnValue([{ text: 'Not commit any offence' }])
    conditionsService.getAdditionalConditions.mockReturnValue({
      base: {
        base: [{ text: 'hi', id: 'ho', user_input: {} }],
      },
    })
    conditionsService.populateLicenceWithConditions = jest.fn().mockReturnValue({ licence: {} })
    conditionsServiceFactory.forVersion.mockReturnValue(conditionsService)
    conditionsServiceFactory.forLicence.mockReturnValue(conditionsService)
    conditionsServiceFactory.getVersion.mockReturnValue(CURRENT_CONDITION_VERSION)
  })

  describe('licenceConditions routes', () => {
    const licenceService = createLicenceServiceStub()

    conditionsService.getNonStandardConditions.mockReturnValue({
      additionalConditions: [{ text: '' }],
      bespokeConditions: [{ text: '' }],
      pssConditions: [{ text: '' }],
      unapprovedBespokeConditions: [{ text: '' }],
    })

    const app = createApp({ licenceService }, 'roUser')
    const routes = [
      { url: '/hdc/licenceConditions/standard/1', content: 'Not commit any offence' },
      { url: '/hdc/licenceConditions/additionalConditions/1', content: 'Select additional conditions</h1>' },
      { url: '/hdc/licenceConditions/conditionsSummary/1', content: 'Add additional condition' },
    ]

    testFormPageGets(app, routes, licenceService)
  })

  describe('Additional licenceConditions route ', () => {
    const licenceService = createLicenceServiceStub()

    test('displays the 1 additional condition selected', () => {
      conditionsService.getNonStandardConditions.mockReturnValue({
        additionalConditions: [{ text: 'Not to contact directly or indirectly' }],
        bespokeConditions: [{ text: '' }],
        pssConditions: [{ text: '' }],
        unapprovedBespokeConditions: [{ text: '' }],
      })

      const app = createApp({ licenceService }, 'roUser')
      return request(app)
        .get('/hdc/licenceConditions/standard/1')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('Not to contact directly or indirectly')
        })
    })

    test('displays the 1 PSS condition selected', () => {
      conditionsService.getNonStandardConditions.mockReturnValue({
        additionalConditions: [{ text: '' }],
        bespokeConditions: [{ text: '' }],
        pssConditions: [{ text: 'reasonably required by your supervisor, to give a sample' }],
        unapprovedBespokeConditions: [{ text: '' }],
      })

      const app = createApp({ licenceService }, 'roUser')
      return request(app)
        .get('/hdc/licenceConditions/standard/1')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('reasonably required by your supervisor, to give a sample ')
        })
    })

    test('displays the 1 approved Bespoke condition selected', () => {
      conditionsService.getNonStandardConditions.mockReturnValue({
        additionalConditions: [{ text: '' }],
        bespokeConditions: [{ text: 'Bespoke condition - approval Yes' }],
        pssConditions: [{ text: '' }],
        unapprovedBespokeConditions: [{ text: '' }],
      })

      const app = createApp({ licenceService }, 'roUser')
      return request(app)
        .get('/hdc/licenceConditions/standard/1')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('Bespoke condition - approval Yes')
        })
    })

    test('Displays appropriate message where no additional, pss or bespoke conditions selected', () => {
      conditionsService.getNonStandardConditions.mockReturnValue({
        additionalConditions: [],
        bespokeConditions: [],
        pssConditions: [],
        unapprovedBespokeConditions: [],
      })

      const app = createApp({ licenceService }, 'roUser')
      return request(app)
        .get('/hdc/licenceConditions/standard/1')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('No additional conditions selected')
          expect(res.text).toContain('No post sentence supervision conditions selected')
          expect(res.text).toContain('No bespoke conditions selected')
          expect(res.text).toContain('No unapproved bespoke conditions selected')
        })
    })
  })

  describe('POST /hdc/licenceConditions/standard/:bookingId', () => {
    const routes = [
      {
        url: '/hdc/licenceConditions/standard/1',
        body: { additionalConditionsRequired: 'Yes', bookingId: 1 },
        nextPath: '/hdc/licenceConditions/additionalConditions/1',
        formName: 'standard',
      },
      {
        url: '/hdc/licenceConditions/standard/1',
        body: { additionalConditionsRequired: 'No', bookingId: 1 },
        nextPath: '/hdc/taskList/1',
        formName: 'standard',
      },
      {
        url: '/hdc/licenceConditions/standard/1',
        body: { bookingId: 1 },
        nextPath: '/hdc/taskList/1',
        formName: 'standard',
      },
      {
        url: '/hdc/licenceConditions/standard/change/1',
        body: { additionalConditionsRequired: 'Yes', bookingId: 1 },
        nextPath: '/hdc/licenceConditions/additionalConditions/change/1',
        formName: 'standard',
      },
      {
        url: '/hdc/licenceConditions/standard/change/1',
        body: { additionalConditionsRequired: 'No', bookingId: 1 },
        nextPath: '/hdc/review/licenceDetails/1',
        formName: 'standard',
      },
      {
        url: '/hdc/licenceConditions/standard/change/1',
        body: { bookingId: 1 },
        nextPath: '/hdc/review/licenceDetails/1',
        formName: 'standard',
      },
    ]

    routes.forEach((route) => {
      test(`redirects to '${route.nextPath}' page for ${route.url}`, () => {
        const licenceService = createLicenceServiceStub()
        licenceService.getLicence.mockResolvedValue({
          licence: { key: 'value' },
          versionDetails: { additional_conditions_version: 1 },
        })
        const app = createApp({ licenceService }, 'roUser')

        return request(app)
          .post(route.url)
          .send(route.body)
          .expect(302)
          .expect((res) => {
            expect(licenceService.update).toHaveBeenCalled()
            expect(licenceService.update).toHaveBeenCalledWith({
              bookingId: '1',
              originalLicence: { licence: { key: 'value' }, versionDetails: { additional_conditions_version: 1 } },
              config: formConfig[route.formName],
              userInput: route.body,
              licenceSection: 'licenceConditions',
              formName: route.formName,
              postRelease: false,
            })

            expect(res.header.location).toBe(route.nextPath)
          })
      })

      test(`renders the correct path '${route.nextPath}' page when ca in post approval`, () => {
        const licenceService = createLicenceServiceStub()
        licenceService.getLicence.mockResolvedValue({
          stage: 'DECIDED',
          licence: { key: 'value' },
          versionDetails: { additional_conditions_version: 1 },
        })
        const app = createApp({ licenceService }, 'caUser')

        return request(app)
          .post(route.url)
          .send(route.body)
          .expect(302)
          .expect((res) => {
            expect(licenceService.update).toHaveBeenCalled()
            expect(licenceService.update).toHaveBeenCalledWith({
              bookingId: '1',
              originalLicence: {
                licence: { key: 'value' },
                stage: 'DECIDED',
                versionDetails: {
                  additional_conditions_version: 1,
                },
              },
              config: formConfig[route.formName],
              userInput: route.body,
              licenceSection: 'licenceConditions',
              formName: route.formName,
              postRelease: false,
            })

            expect(res.header.location).toBe(route.nextPath)
          })
      })

      test(`throws when posting to '${route.nextPath}' when ca in non-post approval`, () => {
        const licenceService = createLicenceServiceStub()
        licenceService.getLicence.mockResolvedValue({ stage: 'PROCESSING_RO', licence: { key: 'value' } })
        const app = createApp({ licenceService }, 'caUser')

        return request(app).post(route.url).send(route.body).expect(403)
      })
    })

    test(`passes postRelease true if agencyLocationId is out`, async () => {
      const licenceService = createLicenceServiceStub()
      const prisonerService = createPrisonerServiceStub()
      prisonerService.getPrisonerPersonalDetails.mockResolvedValue({ agencyLocationId: 'out' })
      const app = createApp({ licenceService, prisonerService }, 'roUser')

      await request(app)
        .post('/hdc/licenceConditions/standard/1')
        .send({ additionalConditionsRequired: 'Yes', bookingId: 1 })
        .expect(302)
        .expect(() => {
          expect(licenceService.update).toHaveBeenCalled()
          expect(licenceService.update).toHaveBeenCalledWith({
            bookingId: '1',
            originalLicence: { licence: { key: 'value' } },
            config: formConfig.standard,
            userInput: { additionalConditionsRequired: 'Yes', bookingId: 1 },
            licenceSection: 'licenceConditions',
            formName: 'standard',
            postRelease: true,
          })
        })
    })
  })

  describe('POST /hdc/licenceConditions/additional/:bookingId', () => {
    const routes = [
      {
        url: '/hdc/licenceConditions/additionalConditions/1',
        body: { bespokeDecision: 'Yes', bookingId: 1, bespokeConditions: [{ text: 'a bespoke condition' }] },
        nextPath: '/hdc/licenceConditions/conditionsSummary/1',
      },
      {
        url: '/hdc/licenceConditions/additionalConditions/change/1',
        body: { bespokeDecision: 'Yes', bookingId: 1, bespokeConditions: [{ text: 'a bespoke condition' }] },
        nextPath: '/hdc/licenceConditions/conditionsSummary/change/1',
      },
    ]

    routes.forEach((route) => {
      test(`redirects to '${route.nextPath}' page for ${route.url}`, () => {
        const licenceService = createLicenceServiceStub()
        licenceService.getLicence.mockResolvedValue({
          licence: { key: 'value' },
          versionDetails: { additional_conditions_version: 1 },
        })
        conditionsService.createConditionsObjectForLicence.mockReturnValue({} as any)
        const app = createApp({ licenceService }, 'roUser')

        return request(app)
          .post(route.url)
          .send(route.body)
          .expect(302)
          .expect((res) => {
            expect(licenceService.updateLicenceConditions).toHaveBeenCalledWith(
              1,
              { licence: { key: 'value' }, versionDetails: { additional_conditions_version: 1 } },
              {},
              false
            )

            expect(res.header.location).toBe(route.nextPath)
          })
      })
    })
    describe('setting conditions version', () => {
      test(`sets conditions version if not previously set and additional conditions selected`, () => {
        const licenceService = createLicenceServiceStub()
        conditionsServiceFactory.getNewVersion.mockReturnValue(1)
        const app = createApp({ licenceService }, 'roUser')

        return request(app)
          .post('/hdc/licenceConditions/additionalConditions/2')
          .send({ bookingId: 2 })
          .expect(302)
          .expect(() => {
            expect(licenceService.setAdditionalConditionsVersion).toHaveBeenCalledWith(2, 1)
          })
      })

      test(`sets conditions version if not previously set and no additional conditions selected`, () => {
        const licenceService = createLicenceServiceStub()
        conditionsServiceFactory.getNewVersion.mockReturnValue(1)
        const app = createApp({ licenceService }, 'roUser')

        return request(app)
          .post('/hdc/licenceConditions/additionalConditions/2')
          .send({ bookingId: 2 })
          .expect(302)
          .expect(() => {
            expect(licenceService.setAdditionalConditionsVersion).toHaveBeenCalledWith(2, 1)
          })
      })

      test(`does not set conditions version if previously set and no additional conditions selected`, () => {
        const licenceService = createLicenceServiceStub()
        conditionsServiceFactory.getNewVersion.mockReturnValue(null)
        const app = createApp({ licenceService }, 'roUser')

        return request(app)
          .post('/hdc/licenceConditions/additionalConditions/2')
          .send({ bookingId: 2 })
          .expect(302)
          .expect(() => {
            expect(licenceService.setAdditionalConditionsVersion).not.toHaveBeenCalled()
          })
      })
    })
  })

  describe('POST /additionalConditions/:bookingId/delete/:conditionId', () => {
    const formResponse = {
      bookingId: '123',
      conditionId: 'ABC',
    }

    test('calls licence service delete and returns to summary page', () => {
      const licenceService = createLicenceServiceStub()
      const app = createApp({ licenceService }, 'roUser')

      return request(app)
        .post('/hdc/licenceConditions/additionalConditions/123/delete/ABC')
        .send(formResponse)
        .expect(302)
        .expect((res) => {
          expect(licenceService.deleteLicenceCondition).toHaveBeenCalledWith(
            '123',
            { licence: { key: 'value' } },
            'ABC'
          )
          expect(res.header.location).toBe('/hdc/licenceConditions/conditionsSummary/123')
        })
    })

    test('audits the delete event', () => {
      const licenceService = createLicenceServiceStub()
      const audit = mockAudit()
      const app = createApp({ licenceService, audit }, 'roUser')

      return request(app)
        .post('/hdc/licenceConditions/additionalConditions/123/delete/ABC')
        .send(formResponse)
        .expect(() => {
          expect(audit.record).toHaveBeenCalled()
          expect(audit.record).toHaveBeenCalledWith('UPDATE_SECTION', 'RO_USER', {
            path: '/hdc/licenceConditions/additionalConditions/123/delete/ABC',
            bookingId: '123',
            userInput: {
              conditionId: 'ABC',
            },
          })
        })
    })
  })

  describe('GET /additionalConditions/conditionsSummary/:bookingId', () => {
    test('should validate the conditions', () => {
      const licenceService = createLicenceServiceStub()
      licenceService.getLicence.mockResolvedValue({ licence: { licenceConditions: { additional: { cond: 'that' } } } })
      licenceService.validateForm = jest.fn().mockReturnValue({ error: 'object' })
      const app = createApp({ licenceService }, 'roUser')

      return request(app)
        .get('/hdc/licenceConditions/conditionsSummary/1')
        .expect(200)
        .expect(() => {
          expect(licenceService.validateForm).toHaveBeenCalledWith({
            formResponse: { cond: 'that' },
            pageConfig: formConfig.additional.get(CURRENT_CONDITION_VERSION),
            formType: 'additional',
          })
          expect(conditionsService.populateLicenceWithConditions).toHaveBeenCalledWith(
            { licenceConditions: { additional: { cond: 'that' } } },
            { error: 'object' }
          )
        })
    })
  })

  function createApp({ licenceService = null, prisonerService = null, audit = mockAudit() }, user) {
    const prisonerServiceMock = prisonerService || createPrisonerServiceStub()
    const signInService = createSignInServiceStub()

    const baseRouter = standardRouter({
      licenceService,
      prisonerService: prisonerServiceMock,
      audit,
      signInService,
      tokenVerifier: new NullTokenVerifier(),
      config: null,
    })

    const route = baseRouter(createRoute({ licenceService, conditionsServiceFactory }))

    return appSetup(route, user, '/hdc/licenceConditions/')
  }
})
