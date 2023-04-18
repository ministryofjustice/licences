const request = require('supertest')
const { mockAudit } = require('../mockClients')
const { appSetup, testFormPageGets } = require('../supertestSetup')

const { createPrisonerServiceStub, createLicenceServiceStub, createSignInServiceStub } = require('../mockServices')

const standardRouter = require('../../server/routes/routeWorkers/standardRouter')
const createRoute = require('../../server/routes/bassReferral')
const formConfig = require('../../server/routes/config/bassReferral')
const NullTokenVerifier = require('../../server/authentication/tokenverifier/NullTokenVerifier')

describe('/hdc/bassReferral', () => {
  describe('CA', () => {
    describe('bass referral routes', () => {
      const licenceService = createLicenceServiceStub()
      licenceService.getLicence = jest.fn().mockReturnValue({
        licence: {},
        stage: 'ELIGIBILITY',
      })

      const app = createApp({ licenceServiceStub: licenceService }, 'caUser')

      const routes = [
        { url: '/hdc/bassReferral/bassRequest/1', content: 'Does the offender have a preferred CAS2 area' },
        { url: '/hdc/bassReferral/bassOffer/1', content: 'CAS2 address' },
        { url: '/hdc/bassReferral/rejected/1', content: 'BASS area rejected' },
        { url: '/hdc/bassReferral/unsuitable/1', content: 'Unsuitable for CAS2' },
        { url: '/hdc/bassReferral/bassWithdrawn/1', content: 'BASS withdrawn' },
      ]

      testFormPageGets(app, routes, licenceService)
    })

    describe('POST /hdc/bassReferral/:form/:bookingId', () => {
      const routes = [
        {
          url: '/hdc/bassReferral/bassRequest/1',
          body: { bookingId: 1 },
          form: 'bassRequest',
          nextPath: '/hdc/taskList/1',
          user: 'caUser',
        },
        {
          url: '/hdc/bassReferral/bassOffer/1',
          body: { bookingId: 1, bassAccepted: 'Yes' },
          form: 'bassOffer',
          nextPath: '/hdc/taskList/1',
          user: 'caUser',
        },
      ]

      routes.forEach((route) => {
        test(`renders the correct path '${route.nextPath}' page`, () => {
          const licenceService = createLicenceServiceStub()
          const app = createApp({ licenceServiceStub: licenceService }, route.user)
          licenceService.update = jest.fn().mockReturnValue({
            bassReferral: { bassOffer: {} },
          })
          return request(app)
            .post(route.url)
            .send(route.body)
            .expect(302)
            .expect((res) => {
              expect(licenceService.update).toHaveBeenCalled()
              expect(licenceService.update).toHaveBeenCalledWith({
                bookingId: '1',
                originalLicence: { licence: { key: 'value' } },
                config: formConfig[route.form],
                userInput: route.body,
                licenceSection: 'bassReferral',
                formName: route.form,
                postRelease: false,
              })

              expect(res.header.location).toBe(route.nextPath)
            })
        })

        test('throws an error if logged in as dm', () => {
          const licenceService = createLicenceServiceStub()
          const app = createApp({ licenceServiceStub: licenceService }, 'dmUser')

          return request(app).post(route.url).send(route.body).expect(403)
        })

        test('throws an error if logged in as ro', () => {
          const licenceService = createLicenceServiceStub()
          const app = createApp({ licenceServiceStub: licenceService }, 'roUser')

          return request(app).post(route.url).send(route.body).expect(403)
        })
      })
    })

    describe('GET /hdc/bassReferral/bassRequest/1', () => {
      const licenceService = createLicenceServiceStub()
      const app = createApp({ licenceServiceStub: licenceService }, 'caUser')
      test(`Additional Information text box to be present`, () => {
        return request(app)
          .get('/hdc/bassReferral/bassRequest/1')
          .expect(200)
          .expect('Content-Type', /html/)
          .expect((res) => {
            expect(res.text).toContain('Additional information')
            expect(res.text).toContain('textarea')
          })
      })
    })

    test(`bassReferral/bassRequest/1 renders "Additional information" text content`, () => {
      const licenceService = createLicenceServiceStub()

      licenceService.getLicence.mockResolvedValue({
        licence: {
          bassReferral: {
            bassRequest: {
              additionalInformation: 'info about Bass address',
            },
          },
        },
      })

      const app = createApp({ licenceServiceStub: licenceService }, 'caUser')
      return request(app)
        .get('/hdc/bassReferral/bassRequest/1')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('info about Bass address')
        })
    })

    describe('GET /hdc/bassReferral/bassAreaCheck/1', () => {
      const licenceService = createLicenceServiceStub()
      licenceService.getLicence.mockResolvedValue({
        licence: {
          bassReferral: {
            bassRequest: {},
          },
        },
      })

      const app = createApp({ licenceServiceStub: licenceService }, 'roUser')
      test(`Additional Information section heading should not be displayed`, () => {
        return request(app)
          .get('/hdc/bassReferral/bassAreaCheck/1')
          .expect(200)
          .expect('Content-Type', /html/)
          .expect((res) => {
            expect(res.text).not.toContain('Additional information')
          })
      })
    })

    describe('GET /hdc/bassReferral/bassAreaCheck/1', () => {
      const licenceService = createLicenceServiceStub()
      licenceService.getLicence.mockResolvedValue({
        licence: {
          bassReferral: {
            bassRequest: {
              additionalInformation: 'info about Bass address',
            },
          },
        },
      })

      const app = createApp({ licenceServiceStub: licenceService }, 'roUser')
      test(`Additional Information text to be present as a view only`, () => {
        return request(app)
          .get('/hdc/bassReferral/bassAreaCheck/1')
          .expect(200)
          .expect('Content-Type', /html/)
          .expect((res) => {
            expect(res.text).toContain('Additional information')
          })
      })
    })

    describe('POST /hdc/bassReferral/rejected/:bookingId', () => {
      test('rejects the bass request', () => {
        const licenceService = createLicenceServiceStub()
        const app = createApp({ licenceServiceStub: licenceService }, 'caUser')
        licenceService.rejectBass = jest.fn().mockReturnValue({
          bassReferral: { bassOffer: {} },
        })
        return request(app)
          .post('/hdc/bassReferral/rejected/1')
          .send({ enterAlternative: 'Yes' })
          .expect(302)
          .expect((res) => {
            expect(licenceService.rejectBass).toHaveBeenCalled()
            expect(licenceService.rejectBass).toHaveBeenCalledWith({ key: 'value' }, '1', 'Yes', 'area')

            expect(res.header.location).toBe('/hdc/bassReferral/bassRequest/rejected/1')
          })
      })
    })

    describe('POST /hdc/bassReferral/unsuitable/:bookingId', () => {
      test('rejects the bass request', () => {
        const licenceService = createLicenceServiceStub()
        const app = createApp({ licenceServiceStub: licenceService }, 'caUser')
        licenceService.rejectBass = jest.fn().mockReturnValue({
          bassReferral: { bassOffer: {} },
        })
        return request(app)
          .post('/hdc/bassReferral/unsuitable/1')
          .send({ enterAlternative: 'Yes' })
          .expect(302)
          .expect((res) => {
            expect(licenceService.rejectBass).toHaveBeenCalled()
            expect(licenceService.rejectBass).toHaveBeenCalledWith({ key: 'value' }, '1', 'Yes', 'offender')

            expect(res.header.location).toBe('/hdc/bassReferral/bassRequest/unsuitable/1')
          })
      })
    })

    describe('POST /hdc/bassReferral/bassOffer/withdraw/:bookingId', () => {
      test('withdraws the bass request', () => {
        const licenceService = createLicenceServiceStub()
        const app = createApp({ licenceServiceStub: licenceService }, 'caUser')
        licenceService.withdrawBass = jest.fn().mockReturnValue({
          bassReferral: { bassOffer: {} },
        })
        return request(app)
          .post('/hdc/bassReferral/bassOffer/withdraw/1')
          .send({ withdrawalType: 'Offer' })
          .expect(302)
          .expect((res) => {
            expect(licenceService.withdrawBass).toHaveBeenCalled()
            expect(licenceService.withdrawBass).toHaveBeenCalledWith({ key: 'value' }, '1', 'Offer')

            expect(res.header.location).toBe('/hdc/bassReferral/bassWithdrawn/1')
          })
      })
    })

    describe('POST /hdc/bassReferral/bassOffer/reinstate/:bookingId', () => {
      test('reinstates the bass request', () => {
        const licenceService = createLicenceServiceStub()
        const app = createApp({ licenceServiceStub: licenceService }, 'caUser')
        licenceService.reinstateBass = jest.fn().mockReturnValue({
          bassReferral: { bassOffer: {} },
        })
        return request(app)
          .post('/hdc/bassReferral/bassOffer/reinstate/1')
          .expect(302)
          .expect((res) => {
            expect(licenceService.reinstateBass).toHaveBeenCalled()
            expect(licenceService.reinstateBass).toHaveBeenCalledWith({ key: 'value' }, '1')

            expect(res.header.location).toBe('/hdc/taskList/1')
          })
      })
    })
  })

  describe('RO', () => {
    describe('bass referral routes', () => {
      const licenceService = createLicenceServiceStub()
      licenceService.getLicence = jest.fn().mockReturnValue({
        licence: {},
        stage: 'PROCESSING_RO',
      })

      const app = createApp({ licenceServiceStub: licenceService }, 'roUser')

      const routes = [{ url: '/hdc/bassReferral/bassAreaCheck/1', content: 'CAS2 area check' }]

      testFormPageGets(app, routes, licenceService)
    })

    describe('POST /hdc/bassReferral/:form/:bookingId', () => {
      const routes = [
        {
          url: '/hdc/bassReferral/bassAreaCheck/1',
          body: { bookingId: 1 },
          form: 'bassAreaCheck',
          nextPath: '/hdc/taskList/1',
          user: 'roUser',
        },
      ]

      routes.forEach((route) => {
        test(`renders the correct path '${route.nextPath}' page`, () => {
          const licenceService = createLicenceServiceStub()
          licenceService.update = jest.fn().mockReturnValue({
            bassReferral: { bassAreaCheck: {} },
          })
          const app = createApp({ licenceServiceStub: licenceService }, route.user)
          return request(app)
            .post(route.url)
            .send(route.body)
            .expect(302)
            .expect((res) => {
              expect(licenceService.update).toHaveBeenCalled()
              expect(licenceService.update).toHaveBeenCalledWith({
                bookingId: '1',
                originalLicence: { licence: { key: 'value' } },
                config: formConfig[route.form],
                userInput: route.body,
                licenceSection: 'bassReferral',
                formName: route.form,
                postRelease: false,
              })

              expect(res.header.location).toBe(route.nextPath)
            })
        })

        test('throws an error if logged in as dm', () => {
          const licenceService = createLicenceServiceStub()
          const app = createApp({ licenceServiceStub: licenceService }, 'dmUser')

          return request(app).post(route.url).send(route.body).expect(403)
        })

        test('throws an error if logged in as ca', () => {
          const licenceService = createLicenceServiceStub()
          const app = createApp({ licenceServiceStub: licenceService }, 'caUser')

          return request(app).post(route.url).send(route.body).expect(403)
        })
      })
    })
  })
})

function createApp({ licenceServiceStub }, user) {
  const prisonerService = createPrisonerServiceStub()
  const licenceService = licenceServiceStub || createLicenceServiceStub()
  const signInService = createSignInServiceStub()
  const audit = mockAudit()

  const baseRouter = standardRouter({
    licenceService,
    prisonerService,
    audit,
    signInService,
    tokenVerifier: new NullTokenVerifier(),
    config: null,
  })
  const route = baseRouter(createRoute({ licenceService, nomisPushService: null }))

  return appSetup(route, user, '/hdc/bassReferral')
}
