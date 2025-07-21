import request from 'supertest'
import { RoService } from '../../server/services/roService'
import { createSignInServiceStub } from '../mockServices'
import { startRoute } from '../supertestSetup'
import createContactRoute from '../../server/routes/contact'
import UserAdminService from '../../server/services/userAdminService'
import { RoUser } from '../../server/data/userClient'

jest.mock('../../server/services/roService')
jest.mock('../../server/services/userAdminService')

let app

describe('/contact', () => {
  let userAdminService: jest.Mocked<UserAdminService>
  let roService: jest.Mocked<RoService>
  let signInService

  beforeEach(() => {
    roService = new RoService(undefined, undefined) as jest.Mocked<RoService>
    roService.findResponsibleOfficer.mockResolvedValue({
      deliusId: 'DELIUS_ID',
      staffIdentifier: 999,
      name: 'Ro Name',
      nomsNumber: undefined,
      teamCode: 'TEAM_CODE',
      teamDescription: 'The Team',
      lduCode: 'ABC123',
      lduDescription: 'LDU Description',
      probationAreaCode: 'PA_CODE',
      probationAreaDescription: 'PA Description',
      isAllocated: true,
    })
    roService.getStaffByStaffIdentifier.mockResolvedValue({
      username: 'username',
      email: '123456@somewhere.com',
      code: 'DELIUS_ID',
      staffId: 999,
      name: { forenames: 'RO', surname: 'Name' },
      teams: [
        {
          code: 'TEAM_CODE',
          description: 'The Team',
          telephone: '01234567890',
          probationDeliveryUnit: { code: 'ABC123', description: 'PDU Description' },
          localAdminUnit: { code: 'ABC123', description: 'LDU Description' },
        },
      ],
    })

    userAdminService = new UserAdminService(undefined, undefined, undefined) as jest.Mocked<UserAdminService>

    signInService = createSignInServiceStub()

    app = startRoute(createContactRoute(userAdminService, roService, signInService), '/contact', 'caUser')
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
          expect(userAdminService.getRoUserByStaffIdentifier).toHaveBeenCalled()
          expect(userAdminService.getRoUserByStaffIdentifier).toHaveBeenCalledWith(999)
          expect(userAdminService.getFunctionalMailbox).toHaveBeenCalledWith('PA_CODE', 'ABC123', 'TEAM_CODE')
        })
    })

    test('should display RO details (from delius)', () => {
      userAdminService.getFunctionalMailbox.mockResolvedValue('abc@def.com')
      return request(app)
        .get('/contact/123456')
        .expect(200)
        .expect((res) => {
          expect(res.text).toContain('ABC123')
          expect(res.text).toContain('LDU Description')
          expect(res.text).toContain('Ro Name')
          expect(res.text).toContain('DELIUS_ID')
          expect(res.text).toContain('999')
          expect(res.text).toContain('PA Description')
          expect(res.text).toContain('PA_CODE')
          expect(res.text).toContain('abc@def.com')
          expect(res.text).toContain('123456@somewhere.com')
        })
    })

    test('should display RO details (from local store)', () => {
      userAdminService.getRoUserByStaffIdentifier.mockResolvedValue({
        first: 'first',
        last: 'last',
        jobRole: 'JR',
        email: 'ro@email.com',
        telephone: '01234567890',
        organisation: 'The Org',
        orgEmail: 'org@email.com',
        staffIdentifier: 999,
      } as RoUser)

      return request(app)
        .get('/contact/123456')
        .expect(200)
        .expect((res) => {
          expect(res.text).toContain('first last')
          expect(res.text).toContain('JR')
          expect(res.text).toContain('ro@email.com')
          expect(res.text).toContain('The Org')
          expect(res.text).toContain('org@email.com')

          expect(userAdminService.getRoUserByStaffIdentifier).toHaveBeenCalledWith(999)
          expect(userAdminService.getRoUserByDeliusUsername).not.toHaveBeenCalled()
        })
    })

    test('should display RO details, from local store, when mapped username in delius', () => {
      userAdminService.getRoUserByStaffIdentifier.mockResolvedValueOnce(null)
      userAdminService.getRoUserByDeliusUsername.mockResolvedValueOnce({
        first: 'first',
        last: 'last',
        jobRole: 'JR',
        email: 'ro@email.com',
        deliusUsername: 'DELIUS_USER',
        telephone: '01234567890',
        organisation: 'The Org',
        orgEmail: 'org@email.com',
      } as RoUser)

      return request(app)
        .get('/contact/123456')
        .expect(200)
        .expect((res) => {
          expect(res.text).toContain('first last')
          expect(res.text).toContain('JR')
          expect(res.text).toContain('ro@email.com')
          expect(res.text).toContain('The Org')
          expect(res.text).toContain('org@email.com')

          expect(userAdminService.getRoUserByStaffIdentifier).toHaveBeenCalledWith(999)
          expect(userAdminService.getRoUserByDeliusUsername).toHaveBeenCalledWith('username')
        })
    })

    test('should handle absence of RO details (local and delius)', () => {
      roService.findResponsibleOfficer.mockResolvedValue({ message: 'message', code: 'ERROR_CODE' })

      return request(app)
        .get('/contact/123456')
        .expect(200)
        .expect((res) => {
          expect(res.text).toContain('No contact details found')
        })
    })
  })
})
