const request = require('supertest')

const {
  createPrisonerServiceStub,
  createLicenceServiceStub,
  appSetup,
  auditStub,
  createSignInServiceStub,
} = require('../supertestSetup')

const standardRouter = require('../../server/routes/routeWorkers/standardRouter')
const createContactRoute = require('../../server/routes/contact')

let app

describe('/contact', () => {
  let userAdminService
  let roService
  let signInService

  beforeEach(() => {
    roService = {
      findResponsibleOfficer: jest.fn().mockReturnValue({
        deliusId: 'DELIUS_ID',
        teamCode: 'TEAM_CODE',
        teamDescription: 'The Team',
        lduCode: 'ABC123',
        lduDescription: 'LDU Description',
        name: 'Ro Name',
        probationAreaDescription: 'PA Description',
        probationAreaCode: 'PA_CODE',
      }),
      getStaffByCode: jest.fn().mockReturnValue({
        username: 'username',
        email: '123456@somewhere.com',
        staffCode: 'DELIUS_ID',
        staff: { forenames: 'RO', surname: 'Name' },
        teams: [
          {
            code: 'TEAM_CODE',
            description: 'The Team',
            telephone: '01234567890',
            localDeliveryUnit: { code: 'ABC123', description: 'LDU Description' },
            district: { code: 'D', description: 'District' },
            borough: { code: 'B', description: 'Borough' },
          },
        ],
      }),
    }

    userAdminService = {
      getRoUserByDeliusId: jest.fn().mockReturnValue(undefined),
      getFunctionalMailbox: jest.fn().mockReturnValue('abc@def.com'),
    }

    signInService = createSignInServiceStub()

    app = createApp({ userAdminService, roService, signInService }, 'caUser')
  })

  describe('GET /contact/:bookingId', () => {
    test('calls user service and returns html', () => {
      return request(app)
        .get('/contact/123456')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(() => {
          expect(roService.findResponsibleOfficer).toHaveBeenCalled()
          expect(roService.findResponsibleOfficer).toHaveBeenCalledWith('123456', 'system-token')
          expect(userAdminService.getRoUserByDeliusId).toHaveBeenCalled()
          expect(userAdminService.getRoUserByDeliusId).toHaveBeenCalledWith('DELIUS_ID')
          expect(userAdminService.getFunctionalMailbox).toHaveBeenCalledWith('PA_CODE', 'ABC123', 'TEAM_CODE')
        })
    })

    test('should display RO details (from delius)', () => {
      return request(app)
        .get('/contact/123456')
        .expect(200)
        .expect(res => {
          expect(res.text).toContain('ABC123')
          expect(res.text).toContain('LDU Description')
          expect(res.text).toContain('Ro Name')
          expect(res.text).toContain('DELIUS_ID')
          expect(res.text).toContain('PA Description')
          expect(res.text).toContain('PA_CODE')
          expect(res.text).toContain('abc@def.com')
          expect(res.text).toContain('123456@somewhere.com')
        })
    })

    test('should display RO details (from local store)', () => {
      userAdminService.getRoUserByDeliusId.mockResolvedValue({
        first: 'first',
        last: 'last',
        jobRole: 'JR',
        email: 'ro@email.com',
        telephone: '01234567890',
        organisation: 'The Org',
        orgEmail: 'org@email.com',
      })

      return request(app)
        .get('/contact/123456')
        .expect(200)
        .expect(res => {
          expect(res.text).toContain('first last')
          expect(res.text).toContain('JR')
          expect(res.text).toContain('ro@email.com')
          expect(res.text).toContain('The Org')
          expect(res.text).toContain('org@email.com')
        })
    })

    test('should handle absence of RO details (local and delius)', () => {
      roService.findResponsibleOfficer.mockResolvedValue({ message: 'message', code: 'ERROR_CODE' })

      return request(app)
        .get('/contact/123456')
        .expect(200)
        .expect(res => {
          expect(res.text).toContain('No contact details found')
        })
    })
  })
})

function createApp({ userAdminService, roService, signInService }, user) {
  const prisonerService = createPrisonerServiceStub()
  const licenceService = createLicenceServiceStub()

  const baseRouter = standardRouter({ licenceService, prisonerService, audit: auditStub, signInService })
  const route = baseRouter(createContactRoute(userAdminService, roService, signInService))

  return appSetup(route, user, '/contact/')
}
