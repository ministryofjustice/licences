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
const createRoute = require('../../server/routes/approval')
const formConfig = require('../../server/routes/config/approval')
const NullTokenVerifier = require('../../server/authentication/tokenverifier/NullTokenVerifier')

const prisonerInfoResponse = {
  bookingId: 1,
  facialImageId: 2,
  dateOfBirth: '23/12/1971',
  firstName: 'F',
  middleName: 'M',
  lastName: 'L',
  offenderNo: 'noms',
  aliases: 'Alias',
  assignedLivingUnitDesc: 'Loc',
  physicalAttributes: { gender: 'Male' },
  imageId: 'imgId',
  captureDate: '23/11/1971',
  sentenceExpiryDate: '03/12/1985',
}

describe('/hdc/approval', () => {
  let app
  let licenceServiceStub
  let nomisPushServiceStub
  let signInServiceStub

  beforeEach(() => {
    licenceServiceStub = createLicenceServiceStub()
    nomisPushServiceStub = createNomisPushServiceStub()
    signInServiceStub = createSignInServiceStub()
    app = createApp({ licenceServiceStub, nomisPushServiceStub, signInServiceStub }, 'dmUser')
    licenceServiceStub.update.mockResolvedValue({ approval: { release: { decision: 'Yes' } } })
  })

  describe('approval routes', () => {
    const service = createLicenceServiceStub()
    service.getLicence.mockResolvedValue({
      stage: 'APPROVAL',
      licence: {
        proposedAddress: { curfewAddress: { addressLine1: 'line1' } },
        curfew: { curfewAddressReview: { consent: 'No' } },
      },
    })
    app = createApp({ licenceServiceStub: service }, 'dmUser')
    const routes = [
      { url: '/hdc/approval/release/1', content: 'Do you approve HDC release for this offender?' },
      { url: '/hdc/approval/refuseReason/1', content: 'HDC refused' },
    ]

    testFormPageGets(app, routes, service)
  })

  describe('GET /approval/routes/:bookingId', () => {
    test('should display the offender details - release', () => {
      return request(app)
        .get('/hdc/approval/release/1')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('23/12/1971')
        })
    })
    test('should display the offender details - refuseReason', () => {
      return request(app)
        .get('/hdc/approval/refuseReason/1')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('23/12/1971')
        })
    })

    test('release should throw if requested by non-DM user', () => {
      const caApp = createApp({ licenceServiceStub }, 'caUser')

      return request(caApp).get('/hdc/approval/release/1').expect(403)
    })

    test('refuseReason should throw if requested by non-DM user', () => {
      const caApp = createApp({ licenceServiceStub }, 'caUser')

      return request(caApp).get('/hdc/approval/refuseReason/1').expect(403)
    })
  })

  describe('POST /hdc/approval/:form/:bookingId', () => {
    const routes = [
      {
        url: '/hdc/approval/release/1',
        body: { decision: 'Yes' },
        section: 'release',
        nextPath: '/hdc/send/decided/1',
        formName: 'release',
      },
      {
        url: '/hdc/approval/release/1',
        body: { decision: 'No' },
        section: 'release',
        nextPath: '/hdc/send/decided/1',
        formName: 'release',
      },
      {
        url: '/hdc/approval/refuseReason/1',
        body: { decision: 'No' },
        section: 'release',
        nextPath: '/hdc/send/decided/1',
        formName: 'refuseReason',
      },
    ]

    routes.forEach((route) => {
      test(`renders the correct path '${route.nextPath}' page`, () => {
        return request(app)
          .post(route.url)
          .send(route.body)
          .expect(302)
          .expect((res) => {
            expect(licenceServiceStub.update).toHaveBeenCalled()
            expect(licenceServiceStub.update).toHaveBeenCalledWith({
              bookingId: '1',
              originalLicence: { licence: { key: 'value' } },
              config: formConfig[route.formName],
              userInput: route.body,
              licenceSection: 'approval',
              formName: route.section,
              postRelease: false,
            })

            expect(res.header.location).toBe(route.nextPath)
          })
      })

      test('should redirect to same page if errors on input', () => {
        licenceServiceStub.validateForm.mockReturnValue({ decision: 'Error 1' })

        return request(app).post(route.url).send({}).expect(302).expect('Location', route.url)
      })

      test('should throw if submitted by non-DM user', () => {
        const caApp = createApp({ licenceServiceStub }, 'caUser')

        return request(caApp).post(route.url).send({ decision: 'Yes' }).expect(403)
      })

      test('should push the decision to nomis if config variable is true', () => {
        licenceServiceStub.update.mockResolvedValue({ approval: { release: { decision: 'ABC' } } })
        app = createApp({ licenceServiceStub, nomisPushServiceStub }, 'dmUser', {
          pushToNomis: true,
        })
        return request(app)
          .post(route.url)
          .send({ decision: 'Yes' })
          .expect(302)
          .expect(() => {
            expect(nomisPushServiceStub.pushStatus).toHaveBeenCalled()
            expect(nomisPushServiceStub.pushStatus).toHaveBeenCalledWith({
              bookingId: '1',
              data: { type: route.formName, status: 'ABC', reason: undefined },
              username: 'DM_USER',
            })
          })
      })

      test('should not push the decision to nomis if config variable is false', () => {
        licenceServiceStub.update.mockResolvedValue({ approval: { release: { decision: 'ABC' } } })
        app = createApp({ licenceServiceStub, nomisPushServiceStub }, 'dmUser', {
          pushToNomis: false,
        })
        return request(app)
          .post(route.url)
          .send({ decision: 'Yes' })
          .expect(302)
          .expect(() => {
            expect(nomisPushServiceStub.pushStatus).not.toHaveBeenCalled()
          })
      })
    })

    test('should throw if submitted by non-DM user case insensitively', () => {
      const caApp = createApp({ licenceServiceStub }, 'caUser')

      return request(caApp).post('/hdc/Approval/refuseReason/1').send({ decision: 'Yes' }).expect(403)
    })
  })
})

function createApp(
  { licenceServiceStub = null, nomisPushServiceStub = null, signInServiceStub = null },
  user,
  config = {}
) {
  const prisonerService = createPrisonerServiceStub()
  prisonerService.getPrisonerDetails = jest.fn().mockReturnValue(prisonerInfoResponse)
  const licenceService = licenceServiceStub || createLicenceServiceStub()
  const nomisPushService = nomisPushServiceStub || createNomisPushServiceStub()
  const signInService = signInServiceStub || createLicenceServiceStub()
  const audit = mockAudit()

  const baseRouter = standardRouter({
    licenceService,
    prisonerService,
    audit,
    signInService,
    tokenVerifier: new NullTokenVerifier(),
    config,
  })
  const route = baseRouter(createRoute({ licenceService, prisonerService, nomisPushService }))

  return appSetup(route, user, '/hdc/approval')
}
