const request = require('supertest')
const { mockAudit } = require('../mockClients')
const { appSetup, testFormPageGets } = require('../supertestSetup')

const {
  createPrisonerServiceStub,
  createLicenceServiceStub,
  createSignInServiceStub,
  createNomisPushServiceStub,
} = require('../mockServices')

const standardRouter = require('../../server/routes/routeWorkers/standardRouter')
const createRoute = require('../../server/routes/curfew')
const formConfig = require('../../server/routes/config/curfew')
const NullTokenVerifier = require('../../server/authentication/tokenverifier/NullTokenVerifier')

describe('/hdc/curfew', () => {
  describe('curfew routes', () => {
    const licenceService = createLicenceServiceStub()
    licenceService.getLicence.mockResolvedValue({
      licence: {
        proposedAddress: {
          curfewAddress: {},
        },
      },
    })
    const app = createApp({ licenceServiceStub: licenceService }, 'roUser')

    const routes = [
      { url: '/hdc/curfew/curfewAddressReview/1', content: 'Proposed curfew address' },
      { url: '/hdc/curfew/curfewHours/1', content: 'HDC curfew hours' },
    ]

    testFormPageGets(app, routes, licenceService)
  })

  describe('first night route', () => {
    const licenceService = createLicenceServiceStub()
    licenceService.getLicence = jest.fn().mockReturnValue({
      licence: {
        curfew: { firstNight: { firstNightFrom: '10:06' } },
      },
    })

    const app = createApp({ licenceServiceStub: licenceService }, 'caUser')

    const routes = [{ url: '/hdc/curfew/firstNight/1', content: 'id="firstNightFrom" value="10:06"' }]

    testFormPageGets(app, routes, licenceService)
  })

  describe('address withdrawal routes', () => {
    const licenceService = createLicenceServiceStub()
    licenceService.getLicence = jest.fn().mockReturnValue({
      licence: {
        proposedAddress: {
          curfewAddress: {},
        },
      },
    })
    const app = createApp({ licenceServiceStub: licenceService }, 'caUser')

    const routes = [
      { url: '/hdc/curfew/addressWithdrawn/1', content: 'Prisoner has withdrawn the address', user: 'caUser' },
      {
        url: '/hdc/curfew/consentWithdrawn/1',
        content: 'The landlord/homeowner has withdrawn consent',
        user: 'caUser',
      },
    ]

    testFormPageGets(app, routes, licenceService)
  })

  describe('approved premises routes', () => {
    const licenceService = createLicenceServiceStub()
    licenceService.getLicence = jest.fn().mockReturnValue({
      licence: {
        curfew: {
          approvedPremises: {
            approvedPremisesRequired: true,
          },
          approvedPremisesAddress: {
            addressLine1: 'address1',
          },
        },
      },
    })
    const app = createApp({ licenceServiceStub: licenceService }, 'roUser')

    const routes = [
      {
        url: '/hdc/curfew/approvedPremises/1',
        content: 'Does the offender need to be sent to approved premises',
        user: 'roUser',
      },
      {
        url: '/hdc/curfew/approvedPremisesAddress/1',
        content: 'name="addressLine1" value="address1"',
        user: 'roUser',
      },
    ]

    testFormPageGets(app, routes, licenceService)
  })

  describe('POST /hdc/curfew/approvedPremisesChoice/:bookingId', () => {
    const routes = [
      {
        url: '/hdc/curfew/approvedPremisesChoice/1',
        body: { bookingId: 1, decision: 'OptOut' },
        nextPath: '/hdc/taskList/1',
        user: 'caUser',
        addressContent: {
          optOut: { decision: 'Yes' },
          original: 'contents',
        },
        curfewContent: { approvedPremises: { required: 'No' } },
      },
      {
        url: '/hdc/curfew/approvedPremisesChoice/1',
        body: { bookingId: 1, decision: 'ApprovedPremises' },
        nextPath: '/hdc/curfew/approvedPremisesAddress/1',
        user: 'caUser',
        addressContent: {
          optOut: { decision: 'No' },
          original: 'contents',
        },
        curfewContent: { approvedPremises: { required: 'Yes' } },
      },
    ]

    routes.forEach((route) => {
      test(`renders the correct path '${route.nextPath}' page`, () => {
        const licenceService = createLicenceServiceStub()
        licenceService.getLicence = jest.fn().mockReturnValue({
          licence: {
            proposedAddress: {
              original: 'contents',
            },
          },
          stage: 'PROCESSING_CA',
        })
        const app = createApp({ licenceServiceStub: licenceService }, 'caUser')
        return request(app)
          .post(route.url)
          .send(route.body)
          .expect(302)
          .expect((res) => {
            expect(licenceService.updateSection).toHaveBeenCalledTimes(2)
            expect(licenceService.updateSection).toHaveBeenCalledWith('proposedAddress', '1', route.addressContent)
            expect(licenceService.updateSection).toHaveBeenCalledWith('curfew', '1', route.curfewContent)
            expect(res.header.location).toBe(route.nextPath)
          })
      })

      test('throws an error if logged in as dm', () => {
        const licenceService = createLicenceServiceStub()
        const app = createApp({ licenceServiceStub: licenceService }, 'dmUser')

        return request(app).post(route.url).send(route.body).expect(403)
      })
    })
  })

  describe('approvedPremisesChoice', () => {
    const routes = [
      {
        answer: 'none',
        licence: {},
        yes: [],
        no: ['input id="optout" type="radio" checked', 'input id="ApprovedPremises" type="radio" checked'],
      },
      {
        answer: 'optout',
        licence: { proposedAddress: { optOut: { decision: 'Yes' } } },
        yes: ['input id="optout" type="radio" checked'],
        no: ['input id="ApprovedPremises" type="radio" checked'],
      },
      {
        answer: 'ApprovedPremises',
        licence: { curfew: { approvedPremises: { required: 'Yes' } } },
        yes: ['input id="ApprovedPremises" type="radio" checked'],
        no: ['input id="optout" type="radio" checked'],
      },
    ]

    routes.forEach((route) => {
      test(`should show ${route.answer} selected`, () => {
        const licenceService = createLicenceServiceStub()
        licenceService.getLicence.mockResolvedValue({ licence: route.licence, stage: 'PROCESSING_CA' })
        const app = createApp({ licenceServiceStub: licenceService }, 'caUser')

        return request(app)
          .get('/hdc/curfew/approvedPremisesChoice/1')
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
      const licenceService = createLicenceServiceStub()
      licenceService.getLicence.mockResolvedValue({ licence: {}, stage: 'PROCESSING_CA' })
      const app = createApp(
        {
          nomisPushServiceStub: nomisPushService,
          licenceServiceStub: licenceService,
        },
        'caUser',
        { pushToNomis: true }
      )

      return request(app)
        .post('/hdc/curfew/approvedPremisesChoice/1')
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
      const licenceService = createLicenceServiceStub()
      licenceService.getLicence.mockResolvedValue({ licence: {}, stage: 'PROCESSING_CA' })
      const app = createApp(
        {
          nomisPushServiceStub: nomisPushService,
          licenceServiceStub: licenceService,
        },
        'caUser',
        { pushToNomis: true }
      )

      return request(app)
        .post('/hdc/curfew/approvedPremisesChoice/1')
        .send({ decision: 'Other' })
        .expect(302)
        .expect(() => {
          expect(nomisPushService.pushStatus).not.toHaveBeenCalled()
        })
    })
  })

  describe('POST /hdc/curfew/:form/:bookingId', () => {
    const routes = [
      {
        url: '/hdc/curfew/curfewHours/1',
        body: { curfewHours: 'done' },
        section: 'curfewHours',
        nextPath: '/hdc/taskList/1',
      },
      {
        url: '/hdc/curfew/addressWithdrawn/1',
        body: { enterNewAddress: 'Yes' },
        section: 'addressWithdrawn',
        nextPath: '/hdc/proposedAddress/curfewAddress/1',
        user: 'caUser',
      },
      {
        url: '/hdc/curfew/addressWithdrawn/1',
        body: { enterNewAddress: 'No' },
        section: 'addressWithdrawn',
        nextPath: '/hdc/proposedAddress/curfewAddressChoice/1',
        user: 'caUser',
      },
      {
        url: '/hdc/curfew/consentWithdrawn/1',
        body: { enterNewAddress: 'Yes' },
        section: 'consentWithdrawn',
        nextPath: '/hdc/proposedAddress/curfewAddress/1',
        user: 'caUser',
      },
      {
        url: '/hdc/curfew/consentWithdrawn/1',
        body: { enterNewAddress: 'No' },
        section: 'consentWithdrawn',
        nextPath: '/hdc/proposedAddress/curfewAddressChoice/1',
        user: 'caUser',
      },
      {
        url: '/hdc/curfew/firstNight/licence_type/1',
        body: { bookingId: 1, path: 'licence_type' },
        section: 'firstNight',
        nextPath: '/hdc/pdf/taskList/licence_type/1',
        user: 'caUser',
      },
    ]

    routes.forEach((route) => {
      test(`renders the correct path '${route.nextPath}' page`, () => {
        const licenceService = createLicenceServiceStub()
        licenceService.update.mockResolvedValue({ curfew: { firstNight: {} } })
        licenceService.addCurfewHoursInput.mockReturnValue({ curfewHours: 'done' })

        const app = createApp({ licenceServiceStub: licenceService }, route.user || 'roUser')
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
              licenceSection: 'curfew',
              formName: route.section,
              postRelease: false,
            })

            expect(res.header.location).toBe(route.nextPath)
          })
      })
    })

    test(`passes postRelease true if agencyLocationId is out`, () => {
      const licenceService = createLicenceServiceStub()
      licenceService.addCurfewHoursInput.mockReturnValue({ curfewHours: 'done' })
      const prisonerServiceStub = createPrisonerServiceStub()
      prisonerServiceStub.getPrisonerPersonalDetails.mockResolvedValue({ agencyLocationId: 'out' })
      const app = createApp({ licenceServiceStub: licenceService, prisonerServiceStub }, 'roUser')

      return request(app)
        .post(routes[0].url)
        .send(routes[0].body)
        .expect(302)
        .expect(() => {
          expect(licenceService.update).toHaveBeenCalled()
          expect(licenceService.update).toHaveBeenCalledWith({
            bookingId: '1',
            originalLicence: { licence: { key: 'value' } },
            config: formConfig[routes[0].section],
            userInput: routes[0].body,
            licenceSection: 'curfew',
            formName: routes[0].section,
            postRelease: true,
          })
        })
    })
  })

  describe('/hdc/curfew/curfewAddressReview/1', () => {
    const routes = [
      {
        url: '/hdc/curfew/curfewAddressReview/1',
        body: { bookingId: 1, consent: 'No', version: '' },
        formName: 'curfewAddressReview',
        nextPath: '/hdc/taskList/1',
      },
      {
        url: '/hdc/curfew/curfewAddressReview/1',
        body: { bookingId: 1, consent: 'Yes', electricity: 'No', version: '1' },
        formName: 'curfewAddressReview',
        nextPath: '/hdc/taskList/1',
      },
      {
        url: '/hdc/curfew/curfewAddressReview/1',
        body: { bookingId: 1, consent: 'Yes', version: '2' },
        formName: 'curfewAddressReview',
        nextPath: '/hdc/taskList/1',
        nextPathCa: '/hdc/taskList/1',
      },
    ]

    routes.forEach((route) => {
      test(`renders the correct path '${route.nextPath}' page`, () => {
        const licenceService = createLicenceServiceStub()
        const app = createApp({ licenceServiceStub: licenceService }, 'roUser')
        return request(app)
          .post(route.url)
          .send(route.body)
          .expect(302)
          .expect((res) => {
            expect(licenceService.update).toHaveBeenCalled()
            expect(licenceService.update).toHaveBeenCalledWith({
              bookingId: '1',
              originalLicence: { licence: { key: 'value' } },
              config: formConfig[route.formName],
              userInput: route.body,
              licenceSection: 'curfew',
              formName: route.formName,
              postRelease: false,
            })

            expect(res.header.location).toBe(route.nextPath)
          })
      })

      test(`renders the correct path '${route.nextPath}' page when ca in post approval`, () => {
        const licence = {
          licence: { key: 'value' },
          stage: 'MODIFIED',
        }

        const licenceService = createLicenceServiceStub()
        licenceService.getLicence = jest.fn().mockReturnValue(licence)
        const app = createApp({ licenceServiceStub: licenceService }, 'caUser')
        return request(app)
          .post(route.url)
          .send(route.body)
          .expect(302)
          .expect((res) => {
            expect(licenceService.update).toHaveBeenCalled()
            expect(licenceService.update).toHaveBeenCalledWith({
              bookingId: '1',
              originalLicence: licence,
              config: formConfig[route.formName],
              userInput: route.body,
              licenceSection: 'curfew',
              formName: route.formName,
              postRelease: false,
            })

            expect(res.header.location).toBe(route.nextPathCa || route.nextPath)
          })
      })

      test(`throws when posting to '${route.nextPath}' when ca except post-approval or final checks`, () => {
        const licence = {
          licence: {
            proposedAddress: {
              curfewAddress: {},
            },
          },
          stage: 'ELIGIBILITY',
        }

        const licenceService = createLicenceServiceStub()
        licenceService.getLicence = jest.fn().mockReturnValue(licence)
        const app = createApp({ licenceServiceStub: licenceService }, 'caUser')
        return request(app).post(route.url).send(route.body).expect(403)
      })
    })

    describe('curfewAddressReview', () => {
      test('shows three questions if main occupier is not the offender with version 1 of the main question text', () => {
        const licence = {
          licence: {
            proposedAddress: {
              curfewAddress: {},
            },
          },
          stage: 'PROCESSING_RO',
        }

        const licenceService = createLicenceServiceStub()
        licenceService.getLicence = jest.fn().mockReturnValue(licence)
        licenceService.getCurfewAddressReviewVersion = jest.fn().mockReturnValue('1')
        const app = createApp({ licenceServiceStub: licenceService }, 'roUser')
        return request(app)
          .get('/hdc/curfew/curfewAddressReview/1')
          .expect(200)
          .expect((res) => {
            expect(res.text).toContain('Does the main occupier consent to HDC?')
            expect(res.text).toContain('Is there an electricity supply?')
            expect(res.text).toContain('Did you do a home visit?')
          })
      })

      test('shows version 2 of the main occupier consent question text', () => {
        const licenceService = createLicenceServiceStub()
        licenceService.getCurfewAddressReviewVersion = jest.fn().mockReturnValue('2')
        const app = createApp({ licenceServiceStub: licenceService }, 'roUser')
        return request(app)
          .get('/hdc/curfew/curfewAddressReview/1')
          .expect(200)
          .expect((res) => {
            expect(res.text).toContain('Have you spoken to the main occupier and do they consent to HDC?')
          })
      })
      test('shows two questions if main occupier is the offender', () => {
        const licence = {
          licence: {
            proposedAddress: {
              curfewAddress: {
                occupier: { isOffender: 'Yes' },
              },
            },
          },
          stage: 'PROCESSING_RO',
        }

        const licenceService = createLicenceServiceStub()
        licenceService.getLicence = jest.fn().mockReturnValue(licence)
        const app = createApp({ licenceServiceStub: licenceService }, 'roUser')
        return request(app)
          .get('/hdc/curfew/curfewAddressReview/1')
          .expect(200)
          .expect((res) => {
            expect(res.text).toEqual(expect.not.arrayContaining(['Does the main occupier consent to HDC?']))
            expect(res.text).toContain('Is there an electricity supply?')
            expect(res.text).toContain('Did you do a home visit?')
          })
      })
    })
  })

  describe('address withdrawal posts', () => {
    const licence = {
      licence: {
        proposedAddress: {
          curfewAddress: {},
        },
      },
    }

    test('withdraw address calls rejectPropsedAddress then returns to taslist', () => {
      const licenceService = createLicenceServiceStub()
      licenceService.getLicence = jest.fn().mockReturnValue(licence)
      const app = createApp({ licenceServiceStub: licenceService }, 'caUser')
      return request(app)
        .post('/hdc/curfew/withdrawAddress/1')
        .send({ withdrawAddress: 'Yes' })
        .expect(302)
        .expect((res) => {
          expect(licenceService.rejectProposedAddress).toHaveBeenCalled()
          expect(licenceService.rejectProposedAddress).toHaveBeenCalledWith(licence.licence, '1', 'withdrawAddress')

          expect(res.header.location).toBe('/hdc/taskList/1')
        })
    })

    test('reinstate address calls reinstateProposedAddress then returns to taslist', () => {
      const licenceService = createLicenceServiceStub()
      licenceService.getLicence = jest.fn().mockReturnValue(licence)
      const app = createApp({ licenceServiceStub: licenceService }, 'caUser')
      return request(app)
        .post('/hdc/curfew/reinstateAddress/1')
        .send({ withdrawAddress: 'No', withdrawConsent: 'No' })
        .expect(302)
        .expect((res) => {
          expect(licenceService.reinstateProposedAddress).toHaveBeenCalled()
          expect(licenceService.reinstateProposedAddress).toHaveBeenCalledWith(licence.licence, '1')

          expect(res.header.location).toBe('/hdc/taskList/1')
        })
    })

    test('throws when posting to withdrawAddress when not a  ca', () => {
      const returnedLicence = {
        licence: {
          proposedAddress: {
            curfewAddress: {},
          },
        },
        stage: 'PROCESSING_CA',
      }

      const licenceService = createLicenceServiceStub()
      licenceService.getLicence = jest.fn().mockReturnValue(returnedLicence)
      const app = createApp({ licenceServiceStub: licenceService }, 'roUser')
      return request(app)
        .post('/hdc/curfew/withdrawAddress/1')
        .send({ withdrawAddress: 'No', withdrawConsent: 'No' })
        .expect(403)
    })

    describe('GET /hdc/curfew/approvedPremises/1', () => {
      const licenceService = createLicenceServiceStub()

      const app = createApp({ licenceServiceStub: licenceService }, 'roUser')
      test(`Additional Information section heading should not be displayed`, () => {
        return request(app)
          .get('/hdc/curfew/approvedPremises/1')
          .expect(200)
          .expect('Content-Type', /html/)
          .expect((res) => {
            expect(res.text).not.toContain('Additional information')
          })
      })
    })

    describe('GET /hdc/curfew/approvedPremises/1', () => {
      const licenceService = createLicenceServiceStub()

      licenceService.getLicence.mockResolvedValue({
        licence: {
          proposedAddress: {
            curfewAddress: {
              additionalInformation: 'info about curfew address',
            },
          },
        },
      })

      const app = createApp({ licenceServiceStub: licenceService }, 'roUser')
      test(`Additional Information text to be present as a view only`, () => {
        return request(app)
          .get('/hdc/curfew/approvedPremises/1')
          .expect(200)
          .expect('Content-Type', /html/)
          .expect((res) => {
            expect(res.text).toContain('Additional information')
            expect(res.text).toContain('info about curfew address')
          })
      })
    })
  })
})

function createApp(
  { licenceServiceStub = null, prisonerServiceStub = null, nomisPushServiceStub = null },
  user,
  config = {}
) {
  const prisonerService = prisonerServiceStub || createPrisonerServiceStub()
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

  return appSetup(route, user, '/hdc/curfew')
}
