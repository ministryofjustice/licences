import request from 'supertest'

import { createPrisonerServiceStub, createLicenceServiceStub, createSignInServiceStub } from '../../mockServices'
import { startRoute } from '../../supertestSetup'

import createAdminRoute from '../../../server/routes/admin/completionDestination'

describe('/completionDestination/', () => {
  const licenceService = createLicenceServiceStub()
  const prisonerService = createPrisonerServiceStub()

  describe('GET set licence completion destination', () => {
    test('Renders HTML output', () => {
      const app = createApp('batchUser')
      return request(app)
        .get('/admin/completionDestination/1/set-complete-destination')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('Select where this licence should be completed')
        })
    })

    it('should call prisoner service', () => {
      prisonerService.getPrisonerDetails.mockReturnValue({ com: { name: 'Jim' } })
      const app = createApp('batchUser')
      return request(app)
        .get('/admin/completionDestination/1/set-complete-destination')
        .expect(200)
        .expect((res) => {
          expect(prisonerService.getPrisonerDetails).toHaveBeenCalledWith('1', 'system-token')
        })
    })

    test('should throw if submitted by non-authorised user', () => {
      const app = createApp('roUser')
      return request(app).get('/admin/completionDestination/1/set-complete-destination').expect(403)
    })
  })

  describe('POST set licence completion destination', () => {
    test('should call licence service and redirect to admin page', () => {
      const app = createApp('batchUser')
      return request(app)
        .post('/admin/completionDestination/1/set-complete-destination')
        .send({ licenceInCvl: 'false' })
        .expect(302)
        .expect(() => {
          expect(licenceService.setLicenceCompletionDestination).toHaveBeenCalledWith(false, '1')
        })
        .expect('Location', '/admin')
    })

    test('should throw if submitted by non-authorised user', () => {
      const app = createApp('roUser')
      return request(app).post('/admin/completionDestination/1/set-complete-destination').expect(403)
    })
  })

  const createApp = (user) =>
    startRoute(
      createAdminRoute(licenceService, createSignInServiceStub(), prisonerService),
      '/admin/completionDestination',
      user
    )
})
