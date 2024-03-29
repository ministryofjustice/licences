const request = require('supertest')

const { appSetup, testFormPageGets } = require('../supertestSetup')

const {
  createPrisonerServiceStub,
  createLicenceServiceStub,
  createSignInServiceStub,
  createNomisPushServiceStub,
} = require('../mockServices')

const { mockAudit } = require('../mockClients')

const standardRouter = require('../../server/routes/routeWorkers/standardRouter')
const createRoute = require('../../server/routes/address')
const formConfig = require('../../server/routes/config/proposedAddress')
const NullTokenVerifier = require('../../server/authentication/tokenverifier/NullTokenVerifier')

describe('/hdc/proposedAddress', () => {
  describe('proposed address routes', () => {
    const licenceService = createLicenceServiceStub()
    licenceService.getLicence = jest.fn().mockReturnValue({
      licence: {},
      stage: 'ELIGIBILITY',
    })

    const app = createApp({ licenceServiceStub: licenceService }, 'caUser')

    const routes = [
      {
        url: '/hdc/proposedAddress/curfewAddressChoice/1',
        content: 'Has the offender provided a curfew address?',
      },
      { url: '/hdc/proposedAddress/curfewAddress/1', content: 'Proposed curfew address' },
    ]

    testFormPageGets(app, routes, licenceService)
  })

  describe('POST /hdc/proposedAddress/:section/:bookingId', () => {
    const routes = [
      {
        url: '/hdc/proposedAddress/curfewAddress/1',
        body: { bookingId: 1 },
        section: 'curfewAddress',
        nextPath: '/hdc/taskList/1',
        user: 'caUser',
      },
    ]

    routes.forEach((route) => {
      test(`renders the correct path '${route.nextPath}' page`, () => {
        const licenceService = createLicenceServiceStub()
        licenceService.update.mockResolvedValue({ proposedAddress: { curfewAddress: { addresses: [{}] } } })
        const app = createApp({ licenceServiceStub: licenceService }, 'caUser')
        return request(app)
          .post(route.url)
          .send(route.body)
          .expect(302)
          .expect((res) => {
            expect(licenceService.update).toHaveBeenCalled()
            expect(licenceService.update).toHaveBeenCalledWith({
              bookingId: '1',
              originalLicence: { licence: { key: 'value' } },
              config: formConfig[route.section],
              userInput: route.body,
              licenceSection: 'proposedAddress',
              formName: route.section,
              postRelease: false,
            })

            expect(res.header.location).toBe(route.nextPath)
          })
      })

      test('throws an error if logged in as dm', () => {
        const licenceService = createLicenceServiceStub()
        licenceService.update.mockResolvedValue({ proposedAddress: { curfewAddress: { addresses: [{}] } } })
        const app = createApp({ licenceServiceStub: licenceService }, 'dmUser')

        return request(app).post(route.url).send(route.body).expect(403)
      })

      test('throws an error if logged in as ro except for curfew address', () => {
        const licenceService = createLicenceServiceStub()
        licenceService.update.mockResolvedValue({ proposedAddress: { curfewAddress: { addresses: [{}] } } })
        const app = createApp({ licenceServiceStub: licenceService }, 'roUser')

        if (route.url === '/hdc/proposedAddress/curfewAddress/1') {
          return request(app).post(route.url).send(route.body).expect(302)
        }

        return request(app).post(route.url).send(route.body).expect(403)
      })
    })
  })

  describe('POST /hdc/proposedAddress/curfewAddressChoice/:bookingId', () => {
    const routes = [
      {
        url: '/hdc/proposedAddress/curfewAddressChoice/1',
        body: { bookingId: 1, decision: 'OptOut' },
        nextPath: '/hdc/taskList/1',
        user: 'caUser',
        addressContent: {
          optOut: { decision: 'Yes' },
          addressProposed: { decision: 'No' },
          original: 'contents',
        },
        bassContent: { bassRequest: { bassRequested: 'No' } },
      },
      {
        url: '/hdc/proposedAddress/curfewAddressChoice/1',
        body: { bookingId: 1, decision: 'Address' },
        nextPath: '/hdc/proposedAddress/curfewAddress/1',
        user: 'caUser',
        addressContent: {
          optOut: { decision: 'No' },
          addressProposed: { decision: 'Yes' },
          original: 'contents',
        },
        bassContent: { bassRequest: { bassRequested: 'No' } },
      },
      {
        url: '/hdc/proposedAddress/curfewAddressChoice/1',
        body: { bookingId: 1, decision: 'Bass' },
        nextPath: '/hdc/bassReferral/bassRequest/1',
        user: 'caUser',
        addressContent: {
          optOut: { decision: 'No' },
          addressProposed: { decision: 'No' },
          original: 'contents',
        },
        bassContent: { bassRequest: { bassRequested: 'Yes' } },
      },
    ]

    routes.forEach((route) => {
      test(`renders the correct path '${route.nextPath}' page`, () => {
        const licenceService = createLicenceServiceStub()
        licenceService.getLicence = jest.fn().mockReturnValue({
          licence: {
            proposedAddress: {
              original: 'contents',
              addressProposed: 'replace',
            },
          },
          stage: 'ELIGIBILITY',
        })
        const app = createApp({ licenceServiceStub: licenceService }, 'caUser')
        return request(app)
          .post(route.url)
          .send(route.body)
          .expect(302)
          .expect((res) => {
            expect(licenceService.updateSection).toHaveBeenCalledTimes(2)
            expect(licenceService.updateSection).toHaveBeenCalledWith('proposedAddress', '1', route.addressContent)
            expect(licenceService.updateSection).toHaveBeenCalledWith('bassReferral', '1', route.bassContent)
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

  describe('curfewAddressChoice', () => {
    const routes = [
      {
        answer: 'none',
        licence: {},
        yes: [],
        no: [
          'input id="optout" type="radio" checked',
          'input id="address" type="radio" checked',
          'input id="bass" type="radio" checked',
        ],
      },
      {
        answer: 'optout',
        licence: { proposedAddress: { optOut: { decision: 'Yes' } } },
        yes: ['input id="optout" type="radio" checked'],
        no: ['input id="address" type="radio" checked', 'input id="bass" type="radio" checked'],
      },
      {
        answer: 'bass',
        licence: { bassReferral: { bassRequest: { bassRequested: 'Yes' } } },
        yes: ['input id="bass" type="radio" checked'],
        no: ['input id="optout" type="radio" checked', 'input id="address" type="radio" checked'],
      },
      {
        answer: 'address',
        licence: { proposedAddress: { addressProposed: { decision: 'Yes' } } },
        yes: ['input id="address" type="radio" checked'],
        no: ['input id="optout" type="radio" checked', 'input id="bass" type="radio" checked'],
      },
    ]

    routes.forEach((route) => {
      test(`should show ${route.answer} selected`, () => {
        const licenceService = createLicenceServiceStub()
        licenceService.getLicence.mockResolvedValue({ licence: route.licence })
        const app = createApp({ licenceServiceStub: licenceService }, 'caUser')

        return request(app)
          .get('/hdc/proposedAddress/curfewAddressChoice/1')
          .expect(200)
          .expect('Content-Type', /html/)
          .expect((res) => {
            route.yes.forEach((content) => {
              expect(res.text).toContain(content)
            })
            route.no.forEach((content) => {
              expect(res.text).toEqual(expect.not.arrayContaining([content]))
            })
          })
      })
    })

    test(`should push optout status to nomis`, () => {
      const nomisPushService = createNomisPushServiceStub()
      const app = createApp(
        {
          nomisPushServiceStub: nomisPushService,
        },
        'caUser',
        { pushToNomis: true }
      )

      return request(app)
        .post('/hdc/proposedAddress/curfewAddressChoice/1')
        .send({ decision: 'OptOut' })
        .expect(302)
        .expect(() => {
          expect(nomisPushService.pushStatus).toHaveBeenCalled()
          expect(nomisPushService.pushStatus).toHaveBeenCalledWith({
            bookingId: '1',
            data: { type: 'optOut', status: 'Yes' },
            username: 'CA_USER_TEST',
          })
        })
    })

    test(`should not push nomis if not optout`, () => {
      const nomisPushService = createNomisPushServiceStub()
      const app = createApp(
        {
          nomisPushServiceStub: nomisPushService,
        },
        'caUser',
        { pushToNomis: true }
      )

      return request(app)
        .post('/hdc/proposedAddress/curfewAddressChoice/1')
        .send({ decision: 'Other' })
        .expect(302)
        .expect(() => {
          expect(nomisPushService.pushStatus).not.toHaveBeenCalled()
        })
    })
  })

  describe('rejected', () => {
    test('should display the rejected address', () => {
      const licenceService = createLicenceServiceStub()
      licenceService.getLicence = jest.fn().mockReturnValue({
        licence: {
          proposedAddress: { curfewAddress: { addressLine1: 'address1', consent: 'No' } },
          curfew: { curfewAddressReview: { consent: 'No' } },
        },
      })
      const app = createApp({ licenceServiceStub: licenceService }, 'caUser')

      return request(app)
        .get('/hdc/proposedAddress/rejected/1')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('id="rejectedLine1">address1</p>')
        })
    })

    test('should display the rejection reason when curfewAddressReview version 1', () => {
      const licenceService = createLicenceServiceStub()
      licenceService.getLicence = jest.fn().mockReturnValue({
        licence: {
          curfew: { curfewAddressReview: { version: '1', consent: 'No' } },
        },
      })
      const app = createApp({ licenceServiceStub: licenceService }, 'caUser')

      return request(app)
        .get('/hdc/proposedAddress/rejected/1')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain(
            'id="rejectionConsentNotGiven">The homeowner/landlord does not give informed consent</p>'
          )
        })
    })

    test('should display the rejection reason when curfewAddressReview version 2', () => {
      const licenceService = createLicenceServiceStub()
      licenceService.getLicence = jest.fn().mockReturnValue({
        licence: {
          curfew: { curfewAddressReview: { version: '2', consentHavingSpoken: 'No' } },
        },
      })
      const app = createApp({ licenceServiceStub: licenceService }, 'caUser')

      return request(app)
        .get('/hdc/proposedAddress/rejected/1')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain(
            'id="rejectionConsentNotGiven">The homeowner/landlord does not give informed consent</p>'
          )
        })
    })

    test('should show the form to enter new address', () => {
      const licenceService = createLicenceServiceStub()
      licenceService.getLicence.mockResolvedValue({
        licence: {
          proposedAddress: { curfewAddress: { addressLine1: 'address1' } },
          curfew: { curfewAddressReview: { consent: 'No' } },
        },
      })
      const app = createApp({ licenceServiceStub: licenceService }, 'caUser')

      return request(app)
        .get('/hdc/proposedAddress/rejected/1')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('<form id="enterAlternativeForm" method="post">')
        })
    })
  })
})

function createApp({ licenceServiceStub = null, nomisPushServiceStub = null }, user, config = {}) {
  const prisonerService = createPrisonerServiceStub()
  const licenceService = licenceServiceStub || createLicenceServiceStub()
  const signInService = createSignInServiceStub()
  const nomisPushService = nomisPushServiceStub || createNomisPushServiceStub()
  const audit = mockAudit()

  const baseRouter = standardRouter({
    licenceService,
    prisonerService,
    audit,
    signInService,
    tokenVerifier: new NullTokenVerifier(),
    config,
  })
  const route = baseRouter(createRoute({ licenceService, nomisPushService }))

  return appSetup(route, user, '/hdc/proposedAddress')
}
