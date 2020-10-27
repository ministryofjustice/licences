import { mocked } from 'ts-jest/utils'
import request from 'supertest'
import { mockAudit } from '../mockClients'
import { appSetup, testFormPageGets } from '../supertestSetup'
import { createPrisonerServiceStub, createSignInServiceStub } from '../mockServices'
import standardRouter from '../../server/routes/routeWorkers/standardRouter'

import { varyRouter } from '../../server/routes/vary'

import formConfig from '../../server/routes/config/vary'

import NullTokenVerifier from '../../server/authentication/tokenverifier/NullTokenVerifier'
import { LicenceRecord, LicenceService } from '../../server/services/licenceService'

jest.mock('../../server/services/licenceService')

describe('/hdc/vary', () => {
  describe('vary routes', () => {
    const licenceService = new LicenceService(undefined)
    const licenceRecord = { licence: { reporting: { reportingInstructions: { buildingAndStreet1: 'this' } } } }
    mocked(licenceService).getLicence.mockResolvedValue(licenceRecord as LicenceRecord)
    mocked(licenceService).addSplitDateFields.mockImplementation((arg) => arg)
    const app = createApp({ licenceServiceStub: licenceService }, 'roUser')

    const routes = [
      { url: '/hdc/vary/evidence/1', content: 'Provide justification' },
      { url: '/hdc/vary/licenceDetails/1', content: 'Enter licence details' },
      { url: '/hdc/vary/address/1', content: 'Curfew address' },
      { url: '/hdc/vary/reportingAddress/1', content: 'name="reportingAddressLine1" value="this"' },
    ]

    testFormPageGets(app, routes, licenceService)
  })

  describe('GET /hdc/vary/licenceDetails', () => {
    test('renders page if licence doesnt exist', () => {
      const licenceService = new LicenceService(undefined)
      mocked(licenceService).getLicence.mockResolvedValue({
        licence: {
          vary: { evidence: { evidence: 'qfe' } },
          variedFromLicenceNotInSystem: true,
        },
        stage: 'VARY',
      } as LicenceRecord)

      const app = createApp({ licenceServiceStub: licenceService }, 'roUser')
      return request(app).get('/hdc/vary/licenceDetails/1').expect(200)
    })

    test('redirects to tasklist if licence exists', () => {
      const licenceService = new LicenceService(undefined)
      mocked(licenceService).getLicence.mockResolvedValue({
        licence: {
          vary: { evidence: { evidence: 'qfe' } },
          variedFromLicenceNotInSystem: true,
          proposedAddress: { curfewAddress: { addressLine1: 'this' } },
        },
        stage: 'VARY',
      } as LicenceRecord)

      const app = createApp({ licenceServiceStub: licenceService }, 'roUser')
      return request(app).get('/hdc/vary/licenceDetails/1').expect(302).expect('Location', '/hdc/taskList/1')
    })
  })

  describe('POST /hdc/vary/evidence/', () => {
    test('submits and redirects to /hdc/vary/licenceDetails/1', () => {
      const licenceService = new LicenceService(undefined)
      mocked(licenceService).getLicence.mockResolvedValue({ licence: {} } as LicenceRecord)
      mocked(licenceService).update.mockResolvedValue({ vary: { evidence: {} } })

      const app = createApp({ licenceServiceStub: licenceService }, 'roUser')
      return request(app)
        .post('/hdc/vary/evidence/1')
        .send({ bookingId: 1, evidence: 'a' })
        .expect(302)
        .expect((res) => {
          expect(licenceService.update).toHaveBeenCalled()
          expect(licenceService.update).toHaveBeenCalledWith({
            bookingId: '1',
            originalLicence: { licence: {} },
            config: formConfig.evidence,
            userInput: { bookingId: 1, evidence: 'a' },
            licenceSection: 'vary',
            formName: 'evidence',
            postRelease: false,
          })

          expect(res.header.location).toBe('/hdc/vary/licenceDetails/1')
        })
    })
  })

  describe('approval route', () => {
    const licenceService = new LicenceService(undefined)
    licenceService.getLicence = jest.fn().mockReturnValue({
      licence: {
        vary: { approval: { name: 'name', jobTitle: 'title' } },
      },
    })
    mocked(licenceService).addSplitDateFields.mockImplementation((arg) => arg)

    const app = createApp({ licenceServiceStub: licenceService }, 'roUser')

    const routes = [{ url: '/hdc/vary/approval/1', content: 'name="name" value="name"' }]

    testFormPageGets(app, routes, licenceService)
  })

  describe('POST /hdc/vary/licenceDetails/', () => {
    test('submits and redirects to additional conditions page if radio selected', () => {
      const licenceService = new LicenceService(undefined)
      mocked(licenceService).getLicence.mockResolvedValue({ licence: { vary: { evidence: {} } } } as LicenceRecord)

      const app = createApp({ licenceServiceStub: licenceService }, 'roUser')
      return request(app)
        .post('/hdc/vary/licenceDetails/1')
        .send({ bookingId: 1, additionalConditions: 'Yes' })
        .expect(302)
        .expect((res) => {
          expect(licenceService.createLicenceFromFlatInput).toHaveBeenCalled()
          expect(licenceService.createLicenceFromFlatInput).toHaveBeenCalledWith(
            { bookingId: 1, additionalConditions: 'Yes' },
            1,
            { vary: { evidence: {} } },
            formConfig.licenceDetails,
            true
          )

          expect(res.header.location).toBe('/hdc/licenceConditions/additionalConditions/1')
        })
    })

    test('submits and redirects to tasklist if radio not selected', () => {
      const licenceService = new LicenceService(undefined)
      mocked(licenceService).getLicence.mockResolvedValue({ licence: { vary: { evidence: {} } } } as LicenceRecord)
      const app = createApp({ licenceServiceStub: licenceService }, 'roUser')
      return request(app)
        .post('/hdc/vary/licenceDetails/1')
        .send({ bookingId: 1, additionalConditions: 'No' })
        .expect(302)
        .expect((res) => {
          expect(licenceService.createLicenceFromFlatInput).toHaveBeenCalled()
          expect(licenceService.createLicenceFromFlatInput).toHaveBeenCalledWith(
            { bookingId: 1, additionalConditions: 'No' },
            1,
            { vary: { evidence: {} } },
            formConfig.licenceDetails,
            true
          )

          expect(res.header.location).toBe('/hdc/taskList/1')
        })
    })

    test('calls validate and passes in appropriate form items', () => {
      const licenceService = new LicenceService(undefined)
      mocked(licenceService).getLicence.mockResolvedValue({ licence: { vary: { evidence: {} } } } as LicenceRecord)
      const app = createApp({ licenceServiceStub: licenceService }, 'roUser')
      return request(app)
        .post('/hdc/vary/licenceDetails/1')
        .send({ bookingId: 1, additionalConditions: 'No' })
        .expect(302)
        .expect(() => {
          expect(licenceService.validateForm).toHaveBeenCalled()
          expect(licenceService.validateForm).toHaveBeenCalledWith({
            formResponse: { additionalConditions: 'No' },
            pageConfig: formConfig.licenceDetails,
          })
        })
    })

    test('redirects to get if errors found', () => {
      const licenceService = new LicenceService(undefined)
      mocked(licenceService).getLicence.mockResolvedValue({ licence: {} } as LicenceRecord)
      mocked(licenceService).validateForm.mockReturnValue({ error: 'this' })
      const app = createApp({ licenceServiceStub: licenceService }, 'roUser')
      return request(app)
        .post('/hdc/vary/licenceDetails/1')
        .send({ bookingId: 1, addressLine1: 'this' })
        .expect(302)
        .expect('Location', '/hdc/vary/licenceDetails/1')
    })
  })

  describe('POST /hdc/vary/address/', () => {
    test('submits and redirects to tasklist', () => {
      const licenceService = new LicenceService(undefined)
      const licence = {
        proposedAddress: {
          curfewAddress: {
            addressLine1: 'address line 1',
          },
        },
      }
      mocked(licenceService).getLicence.mockResolvedValue({
        licence,
      } as LicenceRecord)
      const app = createApp({ licenceServiceStub: licenceService }, 'roUser')
      return request(app)
        .post('/hdc/vary/address/1')
        .send({ bookingId: 1, addressLine1: 'this' })
        .expect(302)
        .expect((res) => {
          expect(licenceService.createLicenceFromFlatInput).toHaveBeenCalled()
          expect(licenceService.createLicenceFromFlatInput).toHaveBeenCalledWith(
            { bookingId: 1, addressLine1: 'this' },
            1,
            licence,
            formConfig.licenceDetails,
            true
          )

          expect(res.header.location).toBe('/hdc/taskList/1')
        })
    })

    test('redirects to get if errors found', () => {
      const licenceService = new LicenceService(undefined)
      mocked(licenceService).getLicence.mockResolvedValue({ licence: {} } as LicenceRecord)
      mocked(licenceService).validateForm.mockReturnValue({ error: 'this' })
      const app = createApp({ licenceServiceStub: licenceService }, 'roUser')
      return request(app)
        .post('/hdc/vary/address/1')
        .send({ bookingId: 1, addressLine1: 'this' })
        .expect(302)
        .expect('Location', '/hdc/vary/address/1')
    })
  })

  describe('POST /hdc/vary/reportingAddress/', () => {
    test('submits and redirects to tasklist', () => {
      const licenceService = new LicenceService(undefined)
      mocked(licenceService).getLicence.mockResolvedValue({ licence: {} } as LicenceRecord)
      const app = createApp({ licenceServiceStub: licenceService }, 'roUser')
      return request(app)
        .post('/hdc/vary/reportingAddress/1')
        .send({ bookingId: 1, addressLine1: 'this' })
        .expect(302)
        .expect((res) => {
          expect(licenceService.createLicenceFromFlatInput).toHaveBeenCalled()
          expect(licenceService.createLicenceFromFlatInput).toHaveBeenCalledWith(
            { bookingId: 1, addressLine1: 'this' },
            1,
            {},
            formConfig.licenceDetails,
            true
          )

          expect(res.header.location).toBe('/hdc/taskList/1')
        })
    })

    test('redirects to get if errors found', () => {
      const licenceService = new LicenceService(undefined)
      mocked(licenceService).getLicence.mockResolvedValue({ licence: {} } as LicenceRecord)
      mocked(licenceService).validateForm.mockReturnValue({ error: 'this' })
      const app = createApp({ licenceServiceStub: licenceService }, 'roUser')
      return request(app)
        .post('/hdc/vary/reportingAddress/1')
        .send({ bookingId: 1, addressLine1: 'this' })
        .expect(302)
        .expect('Location', '/hdc/vary/reportingAddress/1')
    })
  })
})

describe('POST /hdc/vary/', () => {
  const routes = [
    '/hdc/vary/evidence/1',
    '/hdc/vary/licenceDetails/1',
    '/hdc/vary/address/1',
    '/hdc/vary/reportingAddress/1',
    '/hdc/vary/approval/hdc_ap_pss/1',
  ]

  routes.forEach((route) => {
    test(`calls audit for ${route}`, () => {
      const licenceService = new LicenceService(undefined)
      const audit = mockAudit()

      mocked(licenceService).getLicence.mockResolvedValue({ licence: { vary: { evidence: {} } } } as LicenceRecord)
      mocked(licenceService).update.mockResolvedValue({ vary: { evidence: {} } })
      const app = createApp({ licenceServiceStub: licenceService, audit }, 'roUser')

      return request(app)
        .post(route)
        .send({ bookingId: 1, a: 'a', b: 'b', c: 'c' })
        .expect(() => {
          expect(audit.record).toHaveBeenCalled()
          expect(audit.record).toHaveBeenCalledWith('UPDATE_SECTION', 'RO_USER', {
            path: route,
            bookingId: 1,
            userInput: { a: 'a', b: 'b', c: 'c' },
          })
        })
    })
  })
})

function createApp({ licenceServiceStub, audit = mockAudit() }, user) {
  const prisonerService = createPrisonerServiceStub()
  const licenceService = licenceServiceStub || new LicenceService(undefined)
  const signInService = createSignInServiceStub()

  const baseRouter = standardRouter({
    licenceService,
    prisonerService,
    audit,
    signInService,
    tokenVerifier: new NullTokenVerifier(),
    config: null,
  })
  const route = baseRouter(varyRouter({ licenceService, prisonerService }))

  return appSetup(route, user, '/hdc/vary')
}
