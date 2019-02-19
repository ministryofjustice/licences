const request = require('supertest')

const {
  createPrisonerServiceStub,
  createLicenceServiceStub,
  authenticationMiddleware,
  auditStub,
  appSetup,
  testFormPageGets,
  createSignInServiceStub,
} = require('../supertestSetup')

const standardRouter = require('../../server/routes/routeWorkers/standardRouter')
const createRoute = require('../../server/routes/curfew')
const formConfig = require('../../server/routes/config/curfew')

describe('/hdc/curfew', () => {
  describe('curfew routes', () => {
    const licenceService = createLicenceServiceStub()
    licenceService.getLicence.resolves({
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
    licenceService.getLicence = sinon.stub().resolves({
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
    licenceService.getLicence = sinon.stub().resolves({
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

    routes.forEach(route => {
      it(`renders the correct path '${route.nextPath}' page`, () => {
        const licenceService = createLicenceServiceStub()
        licenceService.update.resolves({ curfew: { firstNight: {} } })
        licenceService.addCurfewHoursInput.returns({ curfewHours: 'done' })

        const app = createApp({ licenceServiceStub: licenceService }, route.user || 'roUser')
        return request(app)
          .post(route.url)
          .send(route.body)
          .expect(302)
          .expect(res => {
            expect(licenceService.update).to.be.calledOnce()
            expect(licenceService.update).to.be.calledWith({
              bookingId: '1',
              originalLicence: { licence: { key: 'value' } },
              config: formConfig[route.section],
              userInput: route.body,
              licenceSection: 'curfew',
              formName: route.section,
              postRelease: false,
            })

            expect(res.header.location).to.equal(route.nextPath)
          })
      })
    })

    it(`passes postRelease true if agencyLocationId is out`, () => {
      const licenceService = createLicenceServiceStub()
      licenceService.addCurfewHoursInput.returns({ curfewHours: 'done' })
      const prisonerServiceStub = createPrisonerServiceStub()
      prisonerServiceStub.getPrisonerPersonalDetails.resolves({ agencyLocationId: 'out' })
      const app = createApp({ licenceServiceStub: licenceService, prisonerServiceStub }, 'roUser')

      return request(app)
        .post(routes[0].url)
        .send(routes[0].body)
        .expect(302)
        .expect(() => {
          expect(licenceService.update).to.be.calledOnce()
          expect(licenceService.update).to.be.calledWith({
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
        body: { bookingId: 1, consent: 'No' },
        formName: 'curfewAddressReview',
        nextPath: '/hdc/taskList/1',
      },
      {
        url: '/hdc/curfew/curfewAddressReview/1',
        body: { bookingId: 1, consent: 'Yes', electricity: 'No' },
        formName: 'curfewAddressReview',
        nextPath: '/hdc/taskList/1',
      },
      {
        url: '/hdc/curfew/curfewAddressReview/1',
        body: { bookingId: 1, consent: 'Yes' },
        formName: 'curfewAddressReview',
        nextPath: '/hdc/taskList/1',
        nextPathCa: '/hdc/taskList/1',
      },
    ]

    routes.forEach(route => {
      it(`renders the correct path '${route.nextPath}' page`, () => {
        const licenceService = createLicenceServiceStub()
        const app = createApp({ licenceServiceStub: licenceService }, 'roUser')
        return request(app)
          .post(route.url)
          .send(route.body)
          .expect(302)
          .expect(res => {
            expect(licenceService.update).to.be.calledOnce()
            expect(licenceService.update).to.be.calledWith({
              bookingId: '1',
              originalLicence: { licence: { key: 'value' } },
              config: formConfig[route.formName],
              userInput: route.body,
              licenceSection: 'curfew',
              formName: route.formName,
              postRelease: false,
            })

            expect(res.header.location).to.equal(route.nextPath)
          })
      })

      it(`renders the correct path '${route.nextPath}' page when ca in post approval`, () => {
        const licence = {
          licence: { key: 'value' },
          stage: 'MODIFIED',
        }

        const licenceService = createLicenceServiceStub()
        licenceService.getLicence = sinon.stub().resolves(licence)
        const app = createApp({ licenceServiceStub: licenceService }, 'caUser')
        return request(app)
          .post(route.url)
          .send(route.body)
          .expect(302)
          .expect(res => {
            expect(licenceService.update).to.be.calledOnce()
            expect(licenceService.update).to.be.calledWith({
              bookingId: '1',
              originalLicence: licence,
              config: formConfig[route.formName],
              userInput: route.body,
              licenceSection: 'curfew',
              formName: route.formName,
              postRelease: false,
            })

            expect(res.header.location).to.equal(route.nextPathCa || route.nextPath)
          })
      })

      it(`throws when posting to '${route.nextPath}' when ca except post-approval or final checks`, () => {
        const licence = {
          licence: {
            proposedAddress: {
              curfewAddress: {},
            },
          },
          stage: 'ELIGIBILITY',
        }

        const licenceService = createLicenceServiceStub()
        licenceService.getLicence = sinon.stub().resolves(licence)
        const app = createApp({ licenceServiceStub: licenceService }, 'caUser')
        return request(app)
          .post(route.url)
          .send(route.body)
          .expect(403)
      })
    })

    describe('curfewAddressReview', () => {
      it('shows three questions if main occupier is not the offender', () => {
        const licence = {
          licence: {
            proposedAddress: {
              curfewAddress: {},
            },
          },
          stage: 'PROCESSING_RO',
        }

        const licenceService = createLicenceServiceStub()
        licenceService.getLicence = sinon.stub().resolves(licence)
        const app = createApp({ licenceServiceStub: licenceService }, 'roUser')
        return request(app)
          .get('/hdc/curfew/curfewAddressReview/1')
          .expect(200)
          .expect(res => {
            expect(res.text).to.contain('Does the main occupier consent to HDC?')
            expect(res.text).to.contain('Is there an electricity supply?')
            expect(res.text).to.contain('Did you do a home visit?')
          })
      })

      it('shows two questions if main occupier is the offender', () => {
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
        licenceService.getLicence = sinon.stub().resolves(licence)
        const app = createApp({ licenceServiceStub: licenceService }, 'roUser')
        return request(app)
          .get('/hdc/curfew/curfewAddressReview/1')
          .expect(200)
          .expect(res => {
            expect(res.text).to.not.contain('Does the main occupier consent to HDC?')
            expect(res.text).to.contain('Is there an electricity supply?')
            expect(res.text).to.contain('Did you do a home visit?')
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

    it('withdraw address calls rejectPropsedAddress then returns to taslist', () => {
      const licenceService = createLicenceServiceStub()
      licenceService.getLicence = sinon.stub().resolves(licence)
      const app = createApp({ licenceServiceStub: licenceService }, 'caUser')
      return request(app)
        .post('/hdc/curfew/withdrawAddress/1')
        .send({ withdrawAddress: 'Yes' })
        .expect(302)
        .expect(res => {
          expect(licenceService.rejectProposedAddress).to.be.calledOnce()
          expect(licenceService.rejectProposedAddress).to.be.calledWith(licence.licence, '1', 'withdrawAddress')

          expect(res.header.location).to.equal('/hdc/taskList/1')
        })
    })

    it('reinstate address calls reinstateProposedAddress then returns to taslist', () => {
      const licenceService = createLicenceServiceStub()
      licenceService.getLicence = sinon.stub().resolves(licence)
      const app = createApp({ licenceServiceStub: licenceService }, 'caUser')
      return request(app)
        .post('/hdc/curfew/reinstateAddress/1')
        .send({ withdrawAddress: 'No', withdrawConsent: 'No' })
        .expect(302)
        .expect(res => {
          expect(licenceService.reinstateProposedAddress).to.be.calledOnce()
          expect(licenceService.reinstateProposedAddress).to.be.calledWith(licence.licence, '1')

          expect(res.header.location).to.equal('/hdc/taskList/1')
        })
    })

    it('throws when posting to withdrawAddress when not a  ca', () => {
      const returnedLicence = {
        licence: {
          proposedAddress: {
            curfewAddress: {},
          },
        },
        stage: 'PROCESSING_CA',
      }

      const licenceService = createLicenceServiceStub()
      licenceService.getLicence = sinon.stub().resolves(returnedLicence)
      const app = createApp({ licenceServiceStub: licenceService }, 'roUser')
      return request(app)
        .post('/hdc/curfew/withdrawAddress/1')
        .send({ withdrawAddress: 'No', withdrawConsent: 'No' })
        .expect(403)
    })
  })
})

function createApp({ licenceServiceStub, prisonerServiceStub }, user) {
  const prisonerService = prisonerServiceStub || createPrisonerServiceStub()
  const licenceService = licenceServiceStub || createLicenceServiceStub()
  const signInService = createSignInServiceStub()

  const baseRouter = standardRouter({
    licenceService,
    prisonerService,
    authenticationMiddleware,
    audit: auditStub,
    signInService,
  })
  const route = baseRouter(createRoute({ licenceService }))

  return appSetup(route, user, '/hdc/curfew')
}
