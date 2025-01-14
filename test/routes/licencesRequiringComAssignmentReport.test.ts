import request from 'supertest'
import { startRoute } from '../supertestSetup'
import createAdminRoute from '../../server/routes/licencesRequiringComAssignmentReport'

describe('/licencesRequiringComAssignmentReport', () => {
  let licenceSearchService

  beforeEach(() => {
    licenceSearchService = {
      getLicencesRequiringComAssignment: jest.fn(),
    }
  })

  describe('GET', () => {
    test('Renders HTML output', () => {
      const app = createApp('caUser')
      return request(app)
        .get('/licencesRequiringComAssignmentReport')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('Download licences Requiring COM Assignment')
        })
    })
  })

  describe('POST', () => {
    test('calls search service', () => {
      licenceSearchService.getLicencesRequiringComAssignment.mockReturnValue('1')
      const app = createApp('caUser')
      return request(app)
        .post('/licencesRequiringComAssignmentReport')
        .expect(200)
        .expect(() => {
          expect(licenceSearchService.getLicencesRequiringComAssignment).toHaveBeenCalledWith(
            'CA_USER_TEST',
            'caseLoadId'
          )
        })
    })
  })

  const createApp = (user) =>
    startRoute(createAdminRoute(licenceSearchService), '/licencesRequiringComAssignmentReport', user)
})
