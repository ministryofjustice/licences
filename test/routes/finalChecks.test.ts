import request from 'supertest'
import { mockAudit } from '../mockClients'
import { appSetup } from '../supertestSetup'

import {
  createPrisonerServiceStub,
  createLicenceServiceStub,
  createSignInServiceStub,
  createNomisPushServiceStub,
  createHdcServiceStub,
} from '../mockServices'

import standardRouter from '../../server/routes/routeWorkers/standardRouter'
import createRoute from '../../server/routes/finalChecks'
import formConfig from '../../server/routes/config/finalChecks'
import NullTokenVerifier from '../../server/authentication/tokenverifier/NullTokenVerifier'

describe('/hdc/finalChecks', () => {
  describe('routes', () => {
    const routes = [
      { url: '/hdc/finalChecks/seriousOffence/1', content: 'Has the offender committed an offence' },
      { url: '/hdc/finalChecks/onRemand/1', content: 'Is the offender currently on remand ' },
      {
        url: '/hdc/finalChecks/confiscationOrder/1',
        content: 'Is the offender subject to a confiscation order?',
      },
      {
        url: '/hdc/finalChecks/undulyLenientSentence/1',
        content:
          'Is there an outstanding application under the unduly lenient sentence (ULS) scheme for this offender?',
      },
      {
        url: '/hdc/finalChecks/segregation/1',
        content: 'Is the offender currently segregated (except solely for their own protection)?',
      },
      { url: '/hdc/finalChecks/postpone/1', content: 'Postpone' },
    ]

    routes.forEach((route) => {
      test(`renders the ${route.url} page`, () => {
        const licenceService = createLicenceServiceStub()
        const app = createApp({ licenceServiceStub: licenceService })

        return request(app)
          .get(route.url)
          .expect(200)
          .expect('Content-Type', /html/)
          .expect((res) => {
            expect(res.text).toContain(route.content)
          })
      })
    })
  })

  describe('GET /finalChecks/postpone/:bookingId', () => {
    test('should get postpone version from licence and call service method correctly', () => {
      const licenceService = createLicenceServiceStub()
      const licence = { key: 'value' }
      const app = createApp({ licenceServiceStub: licenceService }, 'caUser')
      return request(app)
        .get('/hdc/finalChecks/postpone/1')
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect((res) => {
          expect(licenceService.getPostponeVersion).toHaveBeenCalledWith(licence)
        })
    })

    test('should only provide the radio button options applicable to version 1', () => {
      const licenceService = createLicenceServiceStub()
      const app = createApp({ licenceServiceStub: licenceService }, 'caUser')
      licenceService.getPostponeVersion.mockReturnValue('1')
      return request(app)
        .get('/hdc/finalChecks/postpone/1')
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect((res) => {
          expect(res.text).toContain('value="outstandingRisk')
          expect(res.text).toContain('value="investigation"')
          expect(res.text).not.toContain('value="awaitingInformation')
          expect(res.text).not.toContain('value="committedOffenceWhileInPrison')
          expect(res.text).not.toContain('value="remandedInCustodyOnOtherMatters')
          expect(res.text).not.toContain('value="confiscationOrderOutstanding')
          expect(res.text).not.toContain('value="segregatedForReasonsOtherThanProtection')
          expect(res.text).not.toContain('value="sentenceReviewedUnderULSScheme')
        })
    })

    test('should only provide the radio button options applicable to version 2', () => {
      const licenceService = createLicenceServiceStub()
      const app = createApp({ licenceServiceStub: licenceService }, 'caUser')
      licenceService.getPostponeVersion.mockReturnValue('2')
      return request(app)
        .get('/hdc/finalChecks/postpone/1')
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect((res) => {
          expect(res.text).not.toContain('value="outstandingRisk')
          expect(res.text).not.toContain('value="investigation"')
          expect(res.text).toContain('value="awaitingInformation')
          expect(res.text).toContain('value="committedOffenceWhileInPrison')
          expect(res.text).toContain('value="remandedInCustodyOnOtherMatters')
          expect(res.text).toContain('value="confiscationOrderOutstanding')
          expect(res.text).toContain('value="segregatedForReasonsOtherThanProtection')
          expect(res.text).toContain('value="sentenceReviewedUnderULSScheme')
        })
    })
  })

  describe('POST /hdc/finalChecks/:section/:bookingId', () => {
    const routes = [
      {
        url: '/hdc/finalChecks/seriousOffence/1',
        body: {},
        formName: 'seriousOffence',
        nextPath: '/hdc/finalChecks/onRemand/1',
      },
      {
        url: '/hdc/finalChecks/onRemand/1',
        body: {},
        formName: 'onRemand',
        nextPath: '/hdc/finalChecks/confiscationOrder/1',
      },
      {
        url: '/hdc/finalChecks/confiscationOrder/1',
        body: {},
        formName: 'confiscationOrder',
        nextPath: '/hdc/finalChecks/undulyLenientSentence/1',
      },
      {
        url: '/hdc/finalChecks/undulyLenientSentence/1',
        body: {},
        formName: 'undulyLenientSentence',
        nextPath: '/hdc/finalChecks/segregation/1',
      },
      {
        url: '/hdc/finalChecks/segregation/1',
        body: {},
        formName: 'segregation',
        nextPath: '/hdc/taskList/1',
      },
      {
        url: '/hdc/finalChecks/refuse/1',
        body: { decision: 'No' },
        fieldMap: formConfig.refuse,
        formName: 'refusal',
        nextPath: '/hdc/taskList/1',
      },
      {
        url: '/hdc/finalChecks/postpone/1',
        body: { decision: 'Yes', postponeReason: 'something' },
        fieldMap: formConfig.postpone,
        formName: 'postpone',
        nextPath: '/hdc/taskList/1',
      },
    ]

    routes.forEach((route) => {
      test(`renders the correct path '${route.nextPath}' page`, () => {
        const licenceService = createLicenceServiceStub()
        licenceService.update.mockResolvedValue({ finalChecks: { [route.formName]: {} } })
        const app = createApp({ licenceServiceStub: licenceService })

        return request(app)
          .post(route.url)
          .send(route.body)
          .expect(302)
          .expect((res) => {
            expect(licenceService.update).toHaveBeenCalled()
            expect(licenceService.update).toHaveBeenCalledWith({
              bookingId: '1',
              originalLicence: { licence: { key: 'value' } },
              config: route.fieldMap || formConfig[route.formName],
              userInput: route.body,
              licenceSection: 'finalChecks',
              formName: route.formName,
              postRelease: false,
            })

            expect(res.header.location).toBe(route.nextPath)
          })
      })

      test('throws an error if logged in as ro', () => {
        const licenceService = createLicenceServiceStub()
        const app = createApp({ licenceServiceStub: licenceService }, 'roUser')

        return request(app).post(route.url).send(route.body).expect(403)
      })
    })

    describe('when there are errors', () => {
      test('should redirect back to seriousOffence page if there is an error', () => {
        const licenceService = createLicenceServiceStub()
        licenceService.update.mockResolvedValue({ finalChecks: { seriousOffence: {} } })
        licenceService.validateForm = jest.fn().mockReturnValue({ reason: 'error' })
        const app = createApp({ licenceServiceStub: licenceService })

        return request(app)
          .post('/hdc/finalChecks/seriousOffence/1')
          .send({})
          .expect(302)
          .expect('Location', '/hdc/finalChecks/seriousOffence/1')
      })

      test('should redirect back to onRemand page if there is an error', () => {
        const licenceService = createLicenceServiceStub()
        licenceService.update.mockResolvedValue({ finalChecks: { onRemand: {} } })
        licenceService.validateForm = jest.fn().mockReturnValue({ reason: 'error' })
        const app = createApp({ licenceServiceStub: licenceService })

        return request(app)
          .post('/hdc/finalChecks/onRemand/1')
          .send({})
          .expect(302)
          .expect('Location', '/hdc/finalChecks/onRemand/1')
      })

      test('should redirect back to confiscationOrder page if there is an error', () => {
        const licenceService = createLicenceServiceStub()
        licenceService.update.mockResolvedValue({ finalChecks: { confiscationOrder: {} } })
        licenceService.validateForm = jest.fn().mockReturnValue({ reason: 'error' })
        const app = createApp({ licenceServiceStub: licenceService })

        return request(app)
          .post('/hdc/finalChecks/confiscationOrder/1')
          .send({})
          .expect(302)
          .expect('Location', '/hdc/finalChecks/confiscationOrder/1')
      })

      test('should redirect back to undulyLenientSentence page if there is an error', () => {
        const licenceService = createLicenceServiceStub()
        licenceService.update.mockResolvedValue({ finalChecks: { undulyLenientSentence: {} } })
        licenceService.validateForm = jest.fn().mockReturnValue({ reason: 'error' })
        const app = createApp({ licenceServiceStub: licenceService })

        return request(app)
          .post('/hdc/finalChecks/undulyLenientSentence/1')
          .send({})
          .expect(302)
          .expect('Location', '/hdc/finalChecks/undulyLenientSentence/1')
      })

      test('should redirect back to segregation page if there is an error', () => {
        const licenceService = createLicenceServiceStub()
        licenceService.update.mockResolvedValue({ finalChecks: { segregation: {} } })
        licenceService.validateForm = jest.fn().mockReturnValue({ reason: 'error' })
        const app = createApp({ licenceServiceStub: licenceService })

        return request(app)
          .post('/hdc/finalChecks/segregation/1')
          .send({})
          .expect(302)
          .expect('Location', '/hdc/finalChecks/segregation/1')
      })

      test('should redirect back to refuse page if nothing is selected and error flashed', () => {
        const licenceService = createLicenceServiceStub()
        licenceService.update.mockResolvedValue({ finalChecks: {} })
        licenceService.validateForm = jest.fn().mockReturnValue({ reason: 'error' })
        const app = createApp({ licenceServiceStub: licenceService })

        return request(app)
          .post('/hdc/finalChecks/refuse/1')
          .send({})
          .expect(302)
          .expect('Location', '/hdc/finalChecks/refuse/1')
      })
    })

    describe('push to nomis', () => {
      const specs = [
        {
          path: '/hdc/finalChecks/postpone/1',
          data: { finalChecks: { postpone: { decision: 'Yes', postponeReason: 'XYZ' } } },
          pushStatus: { type: 'postpone', status: 'Yes', reason: 'XYZ' },
        },
        {
          path: '/hdc/finalChecks/refuse/1',
          data: { finalChecks: { refusal: { decision: 'Yes', reason: 'addressUnsuitable' } } },
          pushStatus: { type: 'refusal', status: 'Yes', reason: 'addressUnsuitable' },
        },
      ]

      specs.forEach((spec) => {
        test(`should push ${spec.pushStatus.type} status to nomis`, () => {
          const licenceService = createLicenceServiceStub()
          licenceService.update.mockResolvedValue(spec.data)
          const nomisPushService = createNomisPushServiceStub()
          const app = createApp(
            {
              licenceServiceStub: licenceService,
              nomisPushServiceStub: nomisPushService,
            },
            'caUser',
            { pushToNomis: true }
          )

          return request(app)
            .post(spec.path)
            .send({ decision: 'Yes', reason: 'addressUnsuitable' })
            .expect(302)
            .expect(() => {
              expect(nomisPushService.pushStatus).toHaveBeenCalled()
              expect(nomisPushService.pushStatus).toHaveBeenCalledWith({
                bookingId: '1',
                data: spec.pushStatus,
                username: 'CA_USER_TEST',
              })
            })
        })
      })
    })

    test('should not push the postponement to nomis if config variable is false', () => {
      const licenceService = createLicenceServiceStub()
      licenceService.update.mockResolvedValue({
        finalChecks: { postpone: { decision: 'ABC', postponeReason: 'XYZ' } },
      })
      const nomisPushService = createNomisPushServiceStub()
      const app = createApp(
        {
          licenceServiceStub: licenceService,
          nomisPushServiceStub: nomisPushService,
        },
        'caUser',
        { pushToNomis: false }
      )

      return request(app)
        .post('/hdc/finalChecks/postpone/1')
        .send({ decision: 'Yes' })
        .expect(302)
        .expect(() => {
          expect(nomisPushService.pushStatus).not.toHaveBeenCalled()
        })
    })

    test('should not push the refusal to nomis if config variable is false', () => {
      const licenceService = createLicenceServiceStub()
      licenceService.update.mockResolvedValue({
        finalChecks: { refusal: { decision: 'Yes', reason: 'addressUnsuitable' } },
      })
      const nomisPushService = createNomisPushServiceStub()
      const app = createApp(
        {
          licenceServiceStub: licenceService,
          nomisPushServiceStub: nomisPushService,
        },
        'caUser',
        { pushToNomis: false }
      )

      return request(app)
        .post('/hdc/finalChecks/refuse/1')
        .send({ decision: 'Yes', reason: 'addressUnsuitable' })
        .expect(302)
        .expect(() => {
          expect(nomisPushService.pushStatus).not.toHaveBeenCalled()
        })
    })

    describe('postpone/resume CVL events', () => {
      test('posts a postpone event with the postponeReason as the event reason', () => {
        const licenceService = createLicenceServiceStub()
        licenceService.getLicence.mockResolvedValue({ id: 1, licence: {} })
        licenceService.update.mockResolvedValue({
          finalChecks: { postpone: { decision: 'Yes', postponeReason: 'outstandingRisk' } },
        })
        const hdcService = createHdcServiceStub()
        const app = createApp({ licenceServiceStub: licenceService, hdcServiceStub: hdcService }, 'caUser')

        return request(app)
          .post('/hdc/finalChecks/postpone/1')
          .send({ decision: 'Yes', postponeReason: 'outstandingRisk' })
          .expect(302)
          .expect('Location', '/hdc/taskList/1')
          .expect(() => {
            expect(hdcService.postPostponeEvent).toHaveBeenCalledWith(
              1,
              1,
              'A1234AA',
              'CA_USER_TEST',
              'outstandingRisk'
            )
            expect(hdcService.postResumeEvent).not.toHaveBeenCalled()
          })
      })

      test('posts a resume event when a previously postponed decision changes to No', () => {
        const licenceService = createLicenceServiceStub()
        licenceService.getLicence.mockResolvedValue({ id: 1, licence: { finalChecks: { postpone: { decision: 'Yes' } } } })
        licenceService.update.mockResolvedValue({ finalChecks: { postpone: { decision: 'No' } } })
        const hdcService = createHdcServiceStub()
        const app = createApp({ licenceServiceStub: licenceService, hdcServiceStub: hdcService }, 'caUser')

        return request(app)
          .post('/hdc/finalChecks/postpone/1')
          .send({ decision: 'No' })
          .expect(302)
          .expect('Location', '/hdc/taskList/1')
          .expect(() => {
            expect(hdcService.postResumeEvent).toHaveBeenCalledWith(
              1,
              1,
              'A1234AA',
              'CA_USER_TEST',
              'CA_USER_TEST resumed the HDC application'
            )
            expect(hdcService.postPostponeEvent).not.toHaveBeenCalled()
          })
      })

      test('does not post an event when the decision is unchanged', () => {
        const licenceService = createLicenceServiceStub()
        licenceService.getLicence.mockResolvedValue({ id: 1, licence: { finalChecks: { postpone: { decision: 'Yes' } } } })
        licenceService.update.mockResolvedValue({ finalChecks: { postpone: { decision: 'Yes' } } })
        const hdcService = createHdcServiceStub()
        const app = createApp({ licenceServiceStub: licenceService, hdcServiceStub: hdcService }, 'caUser')

        return request(app)
          .post('/hdc/finalChecks/postpone/1')
          .send({ decision: 'Yes' })
          .expect(302)
          .expect(() => {
            expect(hdcService.postPostponeEvent).not.toHaveBeenCalled()
            expect(hdcService.postResumeEvent).not.toHaveBeenCalled()
          })
      })
    })

    describe('refuse CVL events', () => {
      test('passes a single refusal reason as the event reason', () => {
        const licenceService = createLicenceServiceStub()
        licenceService.getLicence.mockResolvedValue({ id: 1, licence: {} })
        licenceService.update.mockResolvedValue({
          finalChecks: { refusal: { decision: 'Yes', reason: 'addressUnsuitable' } },
        })
        const hdcService = createHdcServiceStub()
        const app = createApp({ licenceServiceStub: licenceService, hdcServiceStub: hdcService }, 'caUser')

        return request(app)
          .post('/hdc/finalChecks/refuse/1')
          .send({ decision: 'Yes', reason: 'addressUnsuitable' })
          .expect(302)
          .expect('Location', '/hdc/taskList/1')
          .expect(() => {
            expect(hdcService.postRefuseEvent).toHaveBeenCalledWith(1, 1, 'A1234AA', 'CA_USER_TEST', 'addressUnsuitable')
          })
      })

      test('joins multiple refusal reasons for the event reason', () => {
        const reasons = ['addressUnsuitable', 'insufficientTime']
        const licenceService = createLicenceServiceStub()
        licenceService.getLicence.mockResolvedValue({ id: 1, licence: {} })
        licenceService.update.mockResolvedValue({
          finalChecks: { refusal: { decision: 'Yes', reason: reasons } },
        })
        const hdcService = createHdcServiceStub()
        const app = createApp({ licenceServiceStub: licenceService, hdcServiceStub: hdcService }, 'caUser')

        return request(app)
          .post('/hdc/finalChecks/refuse/1')
          .send({ decision: 'Yes', reason: reasons })
          .expect(302)
          .expect(() => {
            expect(hdcService.postRefuseEvent).toHaveBeenCalledWith(
              1,
              1,
              'A1234AA',
              'CA_USER_TEST',
              'addressUnsuitable, insufficientTime'
            )
          })
      })

      test('passes a one-item reason array as the event reason', () => {
        const reasons = ['addressUnsuitable']
        const licenceService = createLicenceServiceStub()
        licenceService.getLicence.mockResolvedValue({ id: 1, licence: {} })
        licenceService.update.mockResolvedValue({
          finalChecks: { refusal: { decision: 'Yes', reason: reasons } },
        })
        const hdcService = createHdcServiceStub()
        const app = createApp({ licenceServiceStub: licenceService, hdcServiceStub: hdcService }, 'caUser')

        return request(app)
          .post('/hdc/finalChecks/refuse/1')
          .send({ decision: 'Yes', reason: reasons })
          .expect(302)
          .expect(() => {
            expect(hdcService.postRefuseEvent).toHaveBeenCalledWith(1, 1, 'A1234AA', 'CA_USER_TEST', 'addressUnsuitable')
          })
      })

      test('does not post a refuse event when the decision is not Yes', () => {
        const licenceService = createLicenceServiceStub()
        licenceService.update.mockResolvedValue({ finalChecks: { refusal: { decision: 'No' } } })
        const hdcService = createHdcServiceStub()
        const app = createApp({ licenceServiceStub: licenceService, hdcServiceStub: hdcService }, 'caUser')

        return request(app)
          .post('/hdc/finalChecks/refuse/1')
          .send({ decision: 'No' })
          .expect(302)
          .expect(() => {
            expect(hdcService.postRefuseEvent).not.toHaveBeenCalled()
          })
      })

      test('posts a refuse event again when the refusal reason is updated', () => {
        const licenceService = createLicenceServiceStub()
        licenceService.getLicence.mockResolvedValue({
          id: 1,
          licence: { finalChecks: { refusal: { decision: 'Yes', reason: 'addressUnsuitable' } } },
        })
        licenceService.update.mockResolvedValue({
          finalChecks: { refusal: { decision: 'Yes', reason: 'insufficientTime' } },
        })
        const hdcService = createHdcServiceStub()
        const app = createApp({ licenceServiceStub: licenceService, hdcServiceStub: hdcService }, 'caUser')

        return request(app)
          .post('/hdc/finalChecks/refuse/1')
          .send({ decision: 'Yes', reason: 'insufficientTime', outOfTimeReasons: 'noAddress' })
          .expect(302)
          .expect(() => {
            expect(hdcService.postRefuseEvent).toHaveBeenCalledWith(1, 1, 'A1234AA', 'CA_USER_TEST', 'insufficientTime')
          })
      })

      test('does not post a refuse event when the licence was already refused and nothing changed', () => {
        const licenceService = createLicenceServiceStub()
        const existingLicence = { finalChecks: { refusal: { decision: 'Yes', reason: 'addressUnsuitable' } } }
        licenceService.getLicence.mockResolvedValue({ id: 1, licence: existingLicence })
        licenceService.update.mockResolvedValue(existingLicence)
        const hdcService = createHdcServiceStub()
        const app = createApp({ licenceServiceStub: licenceService, hdcServiceStub: hdcService }, 'caUser')

        return request(app)
          .post('/hdc/finalChecks/refuse/1')
          .send({ decision: 'Yes', reason: 'addressUnsuitable' })
          .expect(302)
          .expect(() => {
            expect(hdcService.postRefuseEvent).not.toHaveBeenCalled()
          })
      })
    })
  })
})

function createApp(
  { licenceServiceStub = null, nomisPushServiceStub = null, hdcServiceStub = null },
  user = 'caUser',
  config = {}
) {
  const prisonerService = createPrisonerServiceStub()
  const licenceService = licenceServiceStub || createLicenceServiceStub()
  const signInService = createSignInServiceStub()
  signInService.getClientCredentialsTokens.mockResolvedValue('new token')
  const nomisPushService = nomisPushServiceStub || createNomisPushServiceStub()
  const hdcService = hdcServiceStub || createHdcServiceStub()
  const audit = mockAudit()

  const baseRouter = standardRouter({
    licenceService,
    prisonerService,
    audit,
    signInService,
    tokenVerifier: new NullTokenVerifier(),
    config,
  })
  const route = baseRouter(createRoute({ licenceService, nomisPushService, hdcService }))

  return appSetup(route, user, '/hdc/finalChecks')
}
